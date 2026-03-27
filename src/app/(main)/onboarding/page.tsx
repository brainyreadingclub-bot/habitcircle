'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { getKSTDateStr } from '@/hooks/useFreshDate';
import { IDENTITY_OPTIONS, HABIT_TEMPLATES, ALL_POPULAR, type HabitTemplate } from '@/lib/constants';

const EMOJI_OPTIONS = ['✅', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '💪', '🌅', '😴', '🥗', '🎵', '💻', '🚶', '📝', '🧹'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [customIdentity, setCustomIdentity] = useState('');
  const [showCustomIdentity, setShowCustomIdentity] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<HabitTemplate[]>([]);
  const [showCustomHabit, setShowCustomHabit] = useState(false);
  const [customHabitName, setCustomHabitName] = useState('');
  const [customHabitEmoji, setCustomHabitEmoji] = useState('✅');
  const [createdHabits, setCreatedHabits] = useState<Array<{ id: number; name: string; emoji: string }>>([]);
  const [habitDesigns, setHabitDesigns] = useState<Record<number, { triggerTime?: string; triggerLocation?: string; smallestVersion?: string; reward?: string }>>({});
  const [expandedHabitId, setExpandedHabitId] = useState<number | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const authFetch = useAuthFetch();

  const loadUser = useCallback(() => {
    authFetch('/api/auth/me').then(r => r.json()).then(d => {
      setUserName(d.user?.displayName || '');
      if (d.user?.onboardingCompleted) router.replace('/dashboard');
    }).catch(() => {});
  }, [authFetch, router]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const templates = selectedIdentity && HABIT_TEMPLATES[selectedIdentity]
    ? HABIT_TEMPLATES[selectedIdentity]
    : ALL_POPULAR;

  function toggleHabitTemplate(habit: HabitTemplate) {
    setSelectedHabits(prev => {
      const exists = prev.find(h => h.name === habit.name);
      if (exists) return prev.filter(h => h.name !== habit.name);
      if (prev.length >= 5) return prev;
      return [...prev, habit];
    });
  }

  function addCustomHabit() {
    if (!customHabitName.trim() || selectedHabits.length >= 5) return;
    const newHabit: HabitTemplate = { name: customHabitName.trim(), emoji: customHabitEmoji, category: 'custom' };
    setSelectedHabits(prev => [...prev, newHabit]);
    setCustomHabitName('');
    setCustomHabitEmoji('✅');
    setShowCustomHabit(false);
  }

  async function saveIdentity() {
    const identity = showCustomIdentity ? customIdentity.trim() : selectedIdentity;
    if (identity) {
      await authFetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity }),
      }).catch(() => {});
    }
  }

  async function createHabits() {
    setSaving(true);
    setCreateError('');
    await saveIdentity();
    const created: Array<{ id: number; name: string; emoji: string }> = [];
    for (const habit of selectedHabits) {
      try {
        const res = await authFetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: habit.name, emoji: habit.emoji, isShared: true }),
        });
        const data = await res.json();
        if (res.ok) created.push({ id: data.habit.id, name: habit.name, emoji: habit.emoji });
      } catch { /* continue */ }
    }
    if (created.length === 0 && selectedHabits.length > 0) {
      setCreateError('습관 생성에 실패했습니다. 다시 시도해주세요.');
      setSaving(false);
      return;
    }
    setCreatedHabits(created);
    setSaving(false);
    setStep(created.length > 0 ? 3 : 4);
  }

  async function saveHabitDesigns() {
    for (const [habitId, design] of Object.entries(habitDesigns)) {
      const hasValues = Object.values(design).some(v => v && v.trim());
      if (!hasValues) continue;
      await authFetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerTime: design.triggerTime || null,
          triggerLocation: design.triggerLocation || null,
          smallestVersion: design.smallestVersion || null,
          reward: design.reward || null,
        }),
      }).catch(() => {});
    }
    setStep(4);
  }

  async function checkHabit(habitId: number) {
    const today = getKSTDateStr();
    await authFetch('/api/habits/' + habitId + '/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    }).catch(() => {});
    setCheckedIds(prev => new Set([...prev, habitId]));
  }

  async function finishOnboarding() {
    await authFetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: true }),
    }).catch(() => {});
    router.push('/dashboard');
  }

  function skipToEnd() {
    saveIdentity().then(() => finishOnboarding());
  }

  // Progress bar helper
  const totalSteps = 5;
  const progressBars = Array.from({ length: totalSteps - 1 }, (_, i) => i < step);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">

        {/* ===== STEP 0: WHY — 왜 습관인가 ===== */}
        {step === 0 && (
          <div className="text-center animate-in">
            {/* Identity-based diagram */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-border-light flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-teal/15 border-2 border-teal flex items-center justify-center">
                    <span className="text-sm font-bold text-teal">정체성</span>
                  </div>
                </div>
                <span className="absolute top-3 text-[11px] text-warm-gray-light">결과</span>
                <span className="absolute bottom-12 left-6 text-[11px] text-warm-gray">과정</span>
              </div>
            </div>

            <h1 className="text-xl font-bold mb-3">
              진짜 변화는 정체성에서 시작됩니다
            </h1>
            <p className="text-sm text-warm-gray leading-relaxed mb-2">
              대부분 "살 빼기" 같은 <strong>결과</strong>에 집중하지만,<br />
              지속되는 변화는 <strong>"나는 건강한 사람이다"</strong>라는<br />
              정체성의 변화에서 시작됩니다.
            </p>
            <p className="text-xs text-warm-gray-light mb-8 italic">
              — 제임스 클리어, 아주 작은 습관의 힘
            </p>

            <div className="bg-surface rounded-2xl border border-border-light p-4 mb-8 text-left">
              <p className="text-xs text-warm-gray-light mb-2">HabitCircle이 도와드릴 것:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center text-xs">1</span>
                  <span className="text-sm">되고 싶은 사람을 정하고</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center text-xs">2</span>
                  <span className="text-sm">그에 맞는 작은 습관을 만들고</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center text-xs">3</span>
                  <span className="text-sm">함께하는 사람들과 이어갑니다</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all"
            >
              시작하기
            </button>
          </div>
        )}

        {/* ===== STEP 1: 정체성 선택 ===== */}
        {step === 1 && (
          <div className="animate-in">
            <div className="flex gap-1.5 mb-8">
              {progressBars.map((active, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${active ? 'bg-teal' : 'bg-border-light'}`} />
              ))}
            </div>

            <button onClick={() => setStep(0)} className="text-sm text-warm-gray hover:text-teal transition-colors mb-4 flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              뒤로
            </button>

            <h1 className="text-xl font-bold mb-2">어떤 사람이 되고 싶으세요?</h1>
            <p className="text-sm text-warm-gray mb-6 leading-relaxed">
              완벽하게 고르지 않아도 돼요. 언제든 바꿀 수 있어요.
            </p>

            <div className="space-y-2.5">
              {IDENTITY_OPTIONS.map((option, i) => (
                <button
                  key={option.id}
                  onClick={() => { setSelectedIdentity(option.id); setShowCustomIdentity(false); setSelectedHabits([]); }}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all touch-feedback animate-in ${
                    selectedIdentity === option.id && !showCustomIdentity
                      ? 'border-teal bg-teal-light/50'
                      : 'border-border-light bg-surface hover:border-border'
                  }`}
                  style={{ animationDelay: `${0.05 * i}s` }}
                >
                  <span className="text-2xl w-10 h-10 flex items-center justify-center">{option.emoji}</span>
                  <div>
                    <p className="font-medium text-[15px]">{option.label}</p>
                    <p className="text-xs text-warm-gray">{option.desc}</p>
                  </div>
                  {selectedIdentity === option.id && !showCustomIdentity && (
                    <div className="ml-auto w-6 h-6 bg-teal rounded-full flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </button>
              ))}

              {/* 직접 입력 옵션 */}
              <button
                onClick={() => { setShowCustomIdentity(true); setSelectedIdentity(''); }}
                className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
                  showCustomIdentity ? 'border-teal bg-teal-light/50' : 'border-border-light bg-surface hover:border-border'
                }`}
              >
                <span className="text-2xl w-10 h-10 flex items-center justify-center">✨</span>
                <div className="flex-1">
                  <p className="font-medium text-[15px]">직접 입력하기</p>
                  {showCustomIdentity ? (
                    <input
                      type="text"
                      value={customIdentity}
                      onChange={e => setCustomIdentity(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2 bg-cream-dark border border-border rounded-lg text-sm focus:border-teal outline-none"
                      placeholder="예: 꾸준한 사람, 성실한 개발자"
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <p className="text-xs text-warm-gray">나만의 정체성을 정의하세요</p>
                  )}
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedIdentity && !showCustomIdentity}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-30 mt-6"
            >
              다음
            </button>

            <button onClick={() => { setSelectedIdentity(''); setShowCustomIdentity(false); setStep(2); }}
              className="w-full text-center text-sm text-warm-gray-light mt-3 py-2 hover:text-warm-gray transition-colors">
              건너뛰기
            </button>
          </div>
        )}

        {/* ===== STEP 2: 습관 선택 + 직접 작성 ===== */}
        {step === 2 && (
          <div className="animate-in">
            <div className="flex gap-1.5 mb-8">
              {progressBars.map((active, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${active ? 'bg-teal' : 'bg-border-light'}`} />
              ))}
            </div>

            <button onClick={() => setStep(1)} className="text-sm text-warm-gray hover:text-teal transition-colors mb-4 flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              뒤로
            </button>

            <h1 className="text-xl font-bold mb-2">
              {selectedIdentity
                ? `${IDENTITY_OPTIONS.find(o => o.id === selectedIdentity)?.emoji || '✨'} 추천 습관`
                : '인기 습관'}
            </h1>
            <p className="text-sm text-warm-gray mb-1">골라도 되고, 직접 만들어도 돼요. (최대 5개)</p>
            <p className="text-xs text-warm-gray-light mb-5">나중에 언제든 추가/삭제할 수 있어요.</p>

            {/* 직접 만들기 */}
            {!showCustomHabit ? (
              <button
                onClick={() => setShowCustomHabit(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border-light text-warm-gray hover:border-teal hover:text-teal transition-colors mb-4"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                <span className="text-sm font-medium">직접 만들기</span>
              </button>
            ) : (
              <div className="p-4 bg-surface rounded-2xl border border-teal/30 mb-4 animate-in">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {EMOJI_OPTIONS.slice(0, 8).map(e => (
                    <button key={e} type="button" onClick={() => setCustomHabitEmoji(e)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        customHabitEmoji === e ? 'bg-teal-light border border-teal scale-110' : 'bg-cream-dark border border-border-light'
                      }`}>{e}</button>
                  ))}
                </div>
                <input
                  type="text" value={customHabitName} onChange={e => setCustomHabitName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal outline-none mb-3"
                  placeholder="습관 이름을 입력하세요"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && addCustomHabit()}
                />
                <div className="flex gap-2">
                  <button onClick={addCustomHabit} disabled={!customHabitName.trim() || selectedHabits.length >= 5}
                    className="flex-1 py-2 bg-teal text-white rounded-xl text-sm font-medium disabled:opacity-30">추가</button>
                  <button onClick={() => setShowCustomHabit(false)}
                    className="px-4 py-2 bg-surface border border-border rounded-xl text-sm text-warm-gray">취소</button>
                </div>
              </div>
            )}

            {/* 선택된 습관 뱃지 */}
            {selectedHabits.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedHabits.map(h => (
                  <span key={h.name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-light text-teal text-xs rounded-full font-medium">
                    {h.emoji} {h.name}
                    <button onClick={() => toggleHabitTemplate(h)} className="ml-0.5 hover:text-coral transition-colors">&times;</button>
                  </span>
                ))}
              </div>
            )}

            {/* 템플릿 목록 */}
            <div className="space-y-2">
              {templates.filter(t => !selectedHabits.some(s => s.name === t.name)).map((habit, i) => (
                <button
                  key={habit.name}
                  onClick={() => toggleHabitTemplate(habit)}
                  disabled={selectedHabits.length >= 5}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border border-border-light bg-surface hover:border-border text-left transition-all disabled:opacity-30 animate-in`}
                  style={{ animationDelay: `${0.04 * i}s` }}
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <span className="flex-1 text-[14px] font-medium">{habit.name}</span>
                  <div className="w-6 h-6 rounded-full border-2 border-border-light" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 mb-4">
              <span className="text-xs text-warm-gray-light">{selectedHabits.length}/5 선택됨</span>
            </div>

            {createError && <p className="text-sm text-coral text-center mb-3">{createError}</p>}

            <button
              onClick={createHabits}
              disabled={saving}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? '습관 만드는 중...' : selectedHabits.length > 0 ? '이 습관들로 시작하기' : '습관 없이 시작하기'}
            </button>

            {selectedHabits.length === 0 && (
              <p className="text-center text-[11px] text-warm-gray-light mt-2">나중에 습관 탭에서 추가할 수 있어요</p>
            )}
          </div>
        )}

        {/* ===== STEP 3: 습관 설계 (완전 선택사항) ===== */}
        {step === 3 && createdHabits.length > 0 && (
          <div className="animate-in">
            <div className="flex gap-1.5 mb-8">
              {progressBars.map((active, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${active ? 'bg-teal' : 'bg-border-light'}`} />
              ))}
            </div>

            <h1 className="text-xl font-bold mb-2">더 확실하게 만들어볼까요?</h1>
            <p className="text-sm text-warm-gray mb-6 leading-relaxed">
              언제, 어디서, 어떻게 할지 정하면 실행 확률이 <strong className="text-teal">2배</strong> 올라갑니다.<br />
              <span className="text-warm-gray-light">건너뛰어도 괜찮아요! 나중에 설정할 수 있어요.</span>
            </p>

            <div className="space-y-3">
              {createdHabits.map(habit => {
                const isExpanded = expandedHabitId === habit.id;
                const design = habitDesigns[habit.id] || {};
                return (
                  <div key={habit.id} className="bg-surface rounded-2xl border border-border-light overflow-hidden">
                    <button
                      onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className="text-xl">{habit.emoji}</span>
                      <span className="flex-1 text-[15px] font-medium">{habit.name}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`text-warm-gray-light transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 animate-in">
                        <div>
                          <label className="text-xs text-warm-gray mb-1 block">📍 언제 하나요?</label>
                          <input type="text" value={design.triggerTime || ''}
                            onChange={e => setHabitDesigns(prev => ({ ...prev, [habit.id]: { ...prev[habit.id], triggerTime: e.target.value } }))}
                            className="w-full px-3 py-2 bg-cream-dark border border-border rounded-lg text-sm focus:border-teal outline-none"
                            placeholder="예: 아침 7시, 점심 후, 자기 전" />
                        </div>
                        <div>
                          <label className="text-xs text-warm-gray mb-1 block">📍 어디서 하나요?</label>
                          <input type="text" value={design.triggerLocation || ''}
                            onChange={e => setHabitDesigns(prev => ({ ...prev, [habit.id]: { ...prev[habit.id], triggerLocation: e.target.value } }))}
                            className="w-full px-3 py-2 bg-cream-dark border border-border rounded-lg text-sm focus:border-teal outline-none"
                            placeholder="예: 거실, 회사 책상, 공원" />
                        </div>
                        <div>
                          <label className="text-xs text-warm-gray mb-1 block">🔬 가장 작은 버전은?</label>
                          <input type="text" value={design.smallestVersion || ''}
                            onChange={e => setHabitDesigns(prev => ({ ...prev, [habit.id]: { ...prev[habit.id], smallestVersion: e.target.value } }))}
                            className="w-full px-3 py-2 bg-cream-dark border border-border rounded-lg text-sm focus:border-teal outline-none"
                            placeholder="예: 1페이지만 읽기, 1분만 스트레칭" />
                          <p className="text-[11px] text-warm-gray-light mt-1">2분 안에 끝낼 수 있는 버전으로 시작하세요</p>
                        </div>
                        <div>
                          <label className="text-xs text-warm-gray mb-1 block">🎁 완료 후 보상은?</label>
                          <input type="text" value={design.reward || ''}
                            onChange={e => setHabitDesigns(prev => ({ ...prev, [habit.id]: { ...prev[habit.id], reward: e.target.value } }))}
                            className="w-full px-3 py-2 bg-cream-dark border border-border rounded-lg text-sm focus:border-teal outline-none"
                            placeholder="예: 좋아하는 커피 한 잔, 음악 듣기" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={saveHabitDesigns}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all mt-6">
              {Object.keys(habitDesigns).length > 0 ? '설정 완료' : '다음'}
            </button>

            <button onClick={() => setStep(4)}
              className="w-full text-center text-sm text-warm-gray-light mt-3 py-2 hover:text-warm-gray transition-colors">
              건너뛰기
            </button>
          </div>
        )}

        {/* ===== STEP 4: 첫 체크 ===== */}
        {step === 4 && (
          <div className="animate-in">
            <div className="flex gap-1.5 mb-8">
              {progressBars.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full bg-teal" />
              ))}
            </div>

            {createdHabits.length > 0 ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-3xl mb-3 animate-celebrate">🎉</p>
                  <h1 className="text-xl font-bold mb-2">습관이 준비되었어요!</h1>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    지금 바로 오늘의 첫 습관을 체크해보세요.<br />
                    <span className="text-teal font-medium">이 작은 체크 하나가 여정의 시작입니다.</span>
                  </p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {createdHabits.map((habit, i) => {
                    const checked = checkedIds.has(habit.id);
                    return (
                      <button key={habit.id}
                        onClick={() => !checked && checkHabit(habit.id)}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all touch-feedback animate-in ${
                          checked ? 'border-green bg-green-light/30' : 'border-border-light bg-surface hover:border-teal-muted'
                        }`}
                        style={{ animationDelay: `${0.08 * i}s` }}
                      >
                        <span className={`text-2xl transition-transform ${checked ? 'scale-110' : ''}`}>{habit.emoji}</span>
                        <span className={`flex-1 text-[15px] font-medium ${checked ? 'text-green-dark' : ''}`}>{habit.name}</span>
                        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                          checked ? 'bg-green border-green text-white shadow-md shadow-green/20 animate-check' : 'border-border-light'
                        }`}>
                          {checked ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-border opacity-30" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {checkedIds.size > 0 && (
                  <div className="text-center mb-4 animate-in">
                    <p className="text-sm text-teal font-medium">
                      {checkedIds.size === createdHabits.length
                        ? '모든 습관을 완료했어요! 대단해요! 🔥'
                        : checkedIds.size + '개 완료! 나머지도 해볼까요?'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center mb-6">
                <p className="text-3xl mb-3">👋</p>
                <h1 className="text-xl font-bold mb-2">준비 완료!</h1>
                <p className="text-sm text-warm-gray leading-relaxed">
                  습관은 나중에 언제든 추가할 수 있어요.<br />
                  먼저 둘러보세요!
                </p>
              </div>
            )}

            <button onClick={finishOnboarding}
              className={`w-full py-3.5 rounded-2xl font-medium text-[15px] active:scale-[0.98] transition-all ${
                checkedIds.size > 0 || createdHabits.length === 0
                  ? 'bg-teal text-white hover:bg-teal-dark'
                  : 'bg-surface text-warm-gray border border-border hover:bg-cream-dark'
              }`}
            >
              {checkedIds.size > 0 || createdHabits.length === 0 ? '대시보드로 가기 →' : '나중에 할게요'}
            </button>

            {checkedIds.size === 0 && createdHabits.length > 0 && (
              <p className="text-center text-[11px] text-warm-gray-light mt-3">
                위 습관을 하나라도 체크하면 여정이 시작됩니다!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
