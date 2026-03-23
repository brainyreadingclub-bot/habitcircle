'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HabitDetail {
  id: number;
  name: string;
  emoji: string;
  description: string;
  is_shared: number;
  streak: number;
  longestStreak: number;
  completionRate7: number;
  completionRate30: number;
  logs: Array<{ date: string; completed: number }>;
  created_at: string;
}

const MILESTONES = [7, 14, 21, 30, 50, 60, 90, 100, 365];

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [habit, setHabit] = useState<HabitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/habits/${id}`).then(r => r.json()).then(d => { setHabit(d.habit); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm('이 습관을 삭제하시겠습니까?')) return;
    setDeleting(true);
    await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    router.push('/habits');
  }

  if (loading || !habit) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  // Build 35-day calendar (5 weeks for proper grid)
  const today = new Date();
  const completedDates = new Set(habit.logs.filter(l => l.completed).map(l => l.date));

  // Build weekly grid: 5 rows x 7 columns
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 34);
  // Align to Monday
  const dayOfWeek = startDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + mondayOffset);

  const calendarWeeks: Array<Array<{ date: string; completed: boolean; inRange: boolean; isToday: boolean }>> = [];
  const tempDate = new Date(startDate);
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const ds = tempDate.toISOString().split('T')[0];
      const todayDs = today.toISOString().split('T')[0];
      weekDays.push({
        date: ds,
        completed: completedDates.has(ds),
        inRange: tempDate <= today,
        isToday: ds === todayDs,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    calendarWeeks.push(weekDays);
  }

  // Milestone progress
  const nextMilestone = MILESTONES.find(m => m > habit.streak);
  const passedMilestones = MILESTONES.filter(m => m <= habit.streak);

  // Encouragement message based on data (personalized insight)
  function getInsight(): string {
    const h = habit as HabitDetail;
    if (h.completionRate7 === 100) return '7일 완벽 달성! 이 리듬을 유지하세요.';
    if (h.completionRate7 >= 80) return '거의 매일 해내고 있어요. 조금만 더!';
    if (h.completionRate7 >= 50) return '절반 이상 해냈어요. 천천히 이어가세요!';
    if (h.streak > 0) return h.streak + '일 연속! 내일도 이어가세요.';
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
      </div>

      {/* Personalized insight (cognitive psychology: specific feedback > generic stats) */}
      <div className="mb-5 px-4 py-3 bg-teal-light/50 rounded-xl animate-in delay-1">
        <p className="text-sm text-teal-dark leading-relaxed">{getInsight()}</p>
      </div>

      {/* Stats cards with animation */}
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

      {/* Milestone tracker (endowed progress effect) */}
      {habit.streak > 0 && nextMilestone && (
        <div className="mb-6 p-4 bg-surface rounded-2xl border border-border-light animate-in delay-3">
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
              <div key={m} className={`flex-1 flex items-center justify-center`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  m <= habit.streak ? 'bg-amber' : 'bg-border'
                }`} />
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

      {/* Weekly calendar heatmap (better spatial layout) */}
      <div className="bg-surface rounded-2xl border border-border-light p-5 mb-5 animate-in delay-4">
        <h2 className="text-sm font-medium mb-3">최근 기록</h2>
        <div className="flex gap-0.5 mb-1.5">
          <div className="w-5" /> {/* spacer for day labels */}
          {['월', '화', '수', '목', '금', '토', '일'].map(d => (
            <div key={d} className="flex-1 text-center text-[9px] text-warm-gray-light">{d}</div>
          ))}
        </div>
        {calendarWeeks.map((week, wi) => (
          <div key={wi} className="flex gap-0.5 mb-0.5">
            <div className="w-5 text-[8px] text-warm-gray-light flex items-center justify-end pr-1">
              {wi === 0 || wi === calendarWeeks.length - 1 ? '' : ''}
            </div>
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

      {/* 30-day completion rate with animated bar */}
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
      {habit.description && (
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
          onClick={handleDelete} disabled={deleting}
          className="w-full py-3 text-coral text-sm font-medium rounded-xl hover:bg-coral-light transition-colors touch-feedback"
        >
          {deleting ? '삭제 중...' : '습관 삭제'}
        </button>
      </div>
    </div>
  );
}
