'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface HabitDetail {
  id: number;
  name: string;
  emoji: string;
  description: string;
  is_shared: number;
  trigger_time: string | null;
  trigger_location: string | null;
  smallest_version: string | null;
  reward: string | null;
  streak: number;
  longestStreak: number;
  completionRate7: number;
  completionRate30: number;
  logs: Array<{ date: string; completed: number }>;
  created_at: string;
}

const MILESTONES = [7, 14, 21, 30, 50, 60, 90, 100, 365];
const EMOJI_OPTIONS = ['✅', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '💪', '🌅', '😴', '🥗', '🎵', '💻', '🚶', '📝', '🧹'];

function kstToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [habit, setHabit] = useState<HabitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', emoji: '', description: '',
    triggerTime: '', triggerLocation: '', smallestVersion: '', reward: '',
    isShared: false,
  });
  const authFetch = useAuthFetch();

  useEffect(() => {
    authFetch(`/api/habits/${id}`)
      .then(r => r.json())
      .then(d => {
        setHabit(d.habit);
        if (d.habit) {
          setEditForm({
            name: d.habit.name || '',
            emoji: d.habit.emoji || '✅',
            description: d.habit.description || '',
            triggerTime: d.habit.trigger_time || '',
            triggerLocation: d.habit.trigger_location || '',
            smallestVersion: d.habit.smallest_version || '',
            reward: d.habit.reward || '',
            isShared: !!d.habit.is_shared,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, authFetch]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await authFetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          emoji: editForm.emoji,
          description: editForm.description,
          triggerTime: editForm.triggerTime || null,
          triggerLocation: editForm.triggerLocation || null,
          smallestVersion: editForm.smallestVersion || null,
          reward: editForm.reward || null,
          isShared: editForm.isShared,
        }),
      });
      if (res.ok) {
        setHabit(prev => prev ? {
          ...prev,
          name: editForm.name, emoji: editForm.emoji, description: editForm.description,
          trigger_time: editForm.triggerTime || null, trigger_location: editForm.triggerLocation || null,
          smallest_version: editForm.smallestVersion || null, reward: editForm.reward || null,
          is_shared: editForm.isShared ? 1 : 0,
        } : prev);
        setEditing(false);
      }
    } catch { /* handled by authFetch */ }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await authFetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/habits');
      } else {
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-warm-gray text-sm">습관을 불러올 수 없습니다.</p>
        <Link href="/habits" className="px-4 py-2 bg-teal text-white rounded-xl text-sm font-medium">목록으로</Link>
      </div>
    );
  }

  // Calendar with KST timezone
  const todayStr = kstToday();
  const completedDates = new Set(habit.logs.filter(l => l.completed).map(l => l.date));

  // Build weekly grid: 6 rows x 7 columns, aligned to Monday
  const todayDate = new Date(todayStr + 'T00:00:00+09:00');
  const startDate = new Date(todayDate);
  startDate.setDate(startDate.getDate() - 34);
  const dayOfWeek = startDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + mondayOffset);

  const calendarWeeks: Array<Array<{ date: string; completed: boolean; inRange: boolean; isToday: boolean }>> = [];
  const tempDate = new Date(startDate);
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const ds = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(tempDate);
      weekDays.push({
        date: ds,
        completed: completedDates.has(ds),
        inRange: tempDate <= todayDate,
        isToday: ds === todayStr,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    calendarWeeks.push(weekDays);
  }

  const nextMilestone = MILESTONES.find(m => m > habit.streak);
  const passedMilestones = MILESTONES.filter(m => m <= habit.streak);
  const hasDesignInfo = habit.trigger_time || habit.trigger_location || habit.smallest_version || habit.reward;

  function getInsight(): string {
    if (habit!.completionRate7 === 100) return '7일 완벽 달성! 이 리듬을 유지하세요.';
    if (habit!.completionRate7 >= 80) return '거의 매일 해내고 있어요. 조금만 더!';
    if (habit!.completionRate7 >= 50) return '절반 이상 해냈어요. 천천히 이어가세요!';
    if (habit!.streak > 0) return habit!.streak + '일 연속! 내일도 이어가세요.';
    return '오늘 다시 시작해요. 한 번의 체크가 새 시작!';
  }

  return (
    <div className="px-5 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-in">
        <Link href="/habits" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors touch-feedback">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.emoji}</span>
            <h1 className="text-xl font-bold truncate">{habit.name}</h1>
          </div>
        </div>
        <button onClick={() => setEditing(!editing)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${editing ? 'bg-warm-gray/20 text-warm-gray' : 'bg-teal-light text-teal'}`}>
          {editing ? '취소' : '편집'}
        </button>
      </div>

      {/* Edit mode */}
      {editing && (
        <div className="mb-6 p-5 bg-surface rounded-2xl border border-teal/30 space-y-4 animate-in">
          <h2 className="text-sm font-medium text-teal mb-1">습관 편집</h2>

          {/* Emoji picker */}
          <div>
            <label className="block text-xs text-warm-gray mb-2">아이콘</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} type="button" onClick={() => setEditForm(f => ({ ...f, emoji: e }))}
                  className={`w-9 h-9 rounded-lg text-base flex items-center justify-center transition-all ${
                    editForm.emoji === e ? 'bg-teal-light border-2 border-teal scale-110' : 'bg-cream-dark border border-border-light'
                  }`}>{e}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-warm-gray mb-1">습관 이름</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none" />
          </div>

          <div>
            <label className="block text-xs text-warm-gray mb-1">설명</label>
            <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none resize-none h-16" />
          </div>

          <div className="pt-2 border-t border-border-light">
            <p className="text-xs font-medium text-warm-gray mb-3">습관 설계 (Atomic Habits)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-warm-gray mb-1">📍 언제 하나요?</label>
                <input type="text" value={editForm.triggerTime} onChange={e => setEditForm(f => ({ ...f, triggerTime: e.target.value }))}
                  placeholder="예: 아침 7시, 점심 후"
                  className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none" />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">📍 어디서 하나요?</label>
                <input type="text" value={editForm.triggerLocation} onChange={e => setEditForm(f => ({ ...f, triggerLocation: e.target.value }))}
                  placeholder="예: 거실, 회사 책상"
                  className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none" />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">🔬 가장 작은 버전</label>
                <input type="text" value={editForm.smallestVersion} onChange={e => setEditForm(f => ({ ...f, smallestVersion: e.target.value }))}
                  placeholder="예: 1페이지만 읽기"
                  className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none" />
                <p className="text-[10px] text-warm-gray-light mt-0.5 ml-1">2분 안에 끝낼 수 있는 버전</p>
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">🎁 완료 후 보상</label>
                <input type="text" value={editForm.reward} onChange={e => setEditForm(f => ({ ...f, reward: e.target.value }))}
                  placeholder="예: 좋아하는 커피 한 잔"
                  className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-medium">친구에게 공개</p>
            </div>
            <button type="button" onClick={() => setEditForm(f => ({ ...f, isShared: !f.isShared }))}
              className={`w-11 h-6 rounded-full transition-colors ${editForm.isShared ? 'bg-teal' : 'bg-border'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${editForm.isShared ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </button>
          </div>

          <button onClick={handleSave} disabled={saving || !editForm.name.trim()}
            className="w-full py-3 bg-teal text-white rounded-xl font-medium text-sm hover:bg-teal-dark transition-colors disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {/* Personalized insight */}
      <div className="mb-5 px-4 py-3 bg-teal-light/50 rounded-xl animate-in delay-1">
        <p className="text-sm text-teal-dark leading-relaxed">{getInsight()}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 animate-in delay-2">
        <div className={`rounded-2xl p-3.5 text-center ${habit.streak > 0 ? 'bg-amber-light' : 'bg-border-light'}`}>
          <p className={`text-2xl font-bold ${habit.streak > 0 ? 'text-amber-dark' : 'text-warm-gray'}`}>
            {habit.streak > 0 && <span className="animate-fire inline-block mr-0.5">🔥</span>}
            {habit.streak}
          </p>
          <p className="text-[10px] text-warm-gray mt-0.5">현재 연속</p>
        </div>
        <div className="bg-lavender-light rounded-2xl p-3.5 text-center">
          <p className="text-2xl font-bold text-lavender">{habit.longestStreak}</p>
          <p className="text-[10px] text-lavender/70 mt-0.5">최장 연속</p>
        </div>
        <div className="bg-teal-light rounded-2xl p-3.5 text-center">
          <p className="text-2xl font-bold text-teal">{habit.completionRate7}%</p>
          <p className="text-[10px] text-teal/70 mt-0.5">7일 달성률</p>
        </div>
      </div>

      {/* Implementation Intention — Atomic Habits design info */}
      {hasDesignInfo && !editing && (
        <div className="bg-surface rounded-2xl border border-border-light p-5 mb-5 animate-in delay-3">
          <h2 className="text-sm font-medium mb-3">습관 설계</h2>
          {(habit.trigger_time || habit.trigger_location) && (
            <p className="text-sm text-warm-gray leading-relaxed mb-2">
              나는{habit.trigger_time && <span className="font-medium text-charcoal"> {habit.trigger_time}</span>}에
              {habit.trigger_location && <span className="font-medium text-charcoal"> {habit.trigger_location}</span>}에서 이 습관을 한다
            </p>
          )}
          {habit.smallest_version && (
            <div className="flex items-start gap-2 mb-2">
              <span className="text-sm">🔬</span>
              <div>
                <p className="text-[11px] text-warm-gray-light">2분 버전</p>
                <p className="text-sm text-charcoal">{habit.smallest_version}</p>
              </div>
            </div>
          )}
          {habit.reward && (
            <div className="flex items-start gap-2">
              <span className="text-sm">🎁</span>
              <div>
                <p className="text-[11px] text-warm-gray-light">보상</p>
                <p className="text-sm text-charcoal">{habit.reward}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestone tracker */}
      {habit.streak > 0 && nextMilestone && (
        <div className="mb-5 p-4 bg-surface rounded-2xl border border-border-light animate-in delay-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-warm-gray">다음 마일스톤</span>
            <span className="text-xs font-bold text-amber">{nextMilestone}일</span>
          </div>
          <div className="h-2 bg-border-light rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-amber to-coral rounded-full transition-all duration-1000"
              style={{ width: `${(habit.streak / nextMilestone) * 100}%` }} />
          </div>
          <div className="flex items-center gap-1">
            {MILESTONES.filter(m => m <= (nextMilestone || 365)).map(m => (
              <div key={m} className="flex-1 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${m <= habit.streak ? 'bg-amber' : 'bg-border'}`} />
              </div>
            ))}
          </div>
          {passedMilestones.length > 0 && (
            <p className="text-[10px] text-warm-gray-light mt-2">
              달성한 마일스톤: {passedMilestones.map(m => `${m}일`).join(' → ')}
            </p>
          )}
        </div>
      )}

      {/* Weekly calendar heatmap */}
      <div className="bg-surface rounded-2xl border border-border-light p-5 mb-5 animate-in delay-4">
        <h2 className="text-sm font-medium mb-3">최근 기록</h2>
        <div className="flex gap-0.5 mb-1.5">
          <div className="w-5" />
          {['월', '화', '수', '목', '금', '토', '일'].map(d => (
            <div key={d} className="flex-1 text-center text-[9px] text-warm-gray-light">{d}</div>
          ))}
        </div>
        {calendarWeeks.map((week, wi) => (
          <div key={wi} className="flex gap-0.5 mb-0.5">
            <div className="w-5 text-[8px] text-warm-gray-light flex items-center justify-end pr-1" />
            {week.map(day => (
              <div key={day.date} className="flex-1 aspect-square">
                <div
                  title={`${day.date}${day.completed ? ' ✓' : ''}`}
                  className={`w-full h-full rounded-[3px] transition-all ${
                    !day.inRange
                      ? 'bg-transparent'
                      : day.isToday
                      ? day.completed
                        ? 'bg-green ring-2 ring-green/30 ring-offset-1'
                        : 'bg-cream-dark ring-2 ring-teal/20 ring-offset-1'
                      : day.completed
                      ? 'bg-green'
                      : 'bg-border-light'
                  }`}
                />
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-warm-gray-light">
            {calendarWeeks[0]?.[0]?.date?.slice(5).replace('-', '/')} — 오늘
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-border-light" />
              <span className="text-[9px] text-warm-gray-light">미완료</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-green" />
              <span className="text-[9px] text-warm-gray-light">완료</span>
            </div>
          </div>
        </div>
      </div>

      {/* 30-day completion rate */}
      <div className="bg-surface rounded-2xl border border-border-light p-5 mb-5 animate-in delay-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">30일 달성률</span>
          <span className="text-sm text-teal font-bold">{habit.completionRate30}%</span>
        </div>
        <div className="h-2 bg-border-light rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-teal to-green rounded-full animate-progress" style={{ width: `${habit.completionRate30}%` }} />
        </div>
        <p className="text-[10px] text-warm-gray-light mt-2">
          {habit.completionRate30 >= 80 ? '아주 잘하고 있어요!' :
           habit.completionRate30 >= 50 ? '절반 이상! 꾸준히 이어가세요.' :
           '조금씩 늘려가면 됩니다.'}
        </p>
      </div>

      {/* Description */}
      {habit.description && !editing && (
        <div className="bg-surface rounded-2xl border border-border-light p-5 mb-5 animate-in delay-6">
          <h2 className="text-sm font-medium mb-2">메모</h2>
          <p className="text-sm text-warm-gray leading-relaxed">{habit.description}</p>
        </div>
      )}

      {/* Info + Delete */}
      <div className="space-y-3 animate-in delay-7">
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-light">
          <span className="text-sm text-warm-gray">공개 여부</span>
          <span className={`text-sm font-medium ${habit.is_shared ? 'text-teal' : 'text-warm-gray-light'}`}>
            {habit.is_shared ? '친구에게 공개' : '비공개'}
          </span>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)} disabled={deleting}
          className="w-full py-3 text-coral text-sm font-medium rounded-xl hover:bg-coral-light transition-colors touch-feedback"
        >
          습관 삭제
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-surface rounded-2xl p-6 w-full max-w-sm border border-border-light" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-2">습관을 삭제하시겠습니까?</h3>
            <p className="text-sm text-warm-gray mb-1">
              {habit.emoji} {habit.name}
            </p>
            <p className="text-xs text-warm-gray-light mb-5">
              쉬어가는 것도 전략이에요. 나중에 다시 시작할 수 있습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting}
                className="flex-1 py-2.5 bg-cream-dark text-sm font-medium rounded-xl transition-colors">
                취소
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-coral text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
