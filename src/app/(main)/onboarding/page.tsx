'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ===== STEP DATA =====

const IDENTITY_OPTIONS = [
  { id: 'healthy', emoji: '💪', label: '건강한 사람', desc: '몸과 마음을 돌보는' },
  { id: 'learner', emoji: '📚', label: '배우는 사람', desc: '매일 성장하는' },
  { id: 'creative', emoji: '🎨', label: '창의적인 사람', desc: '꾸준히 만들어가는' },
  { id: 'mindful', emoji: '🧘', label: '마음챙김하는 사람', desc: '의식적으로 사는' },
  { id: 'productive', emoji: '🎯', label: '생산적인 사람', desc: '목표를 달성하는' },
  { id: 'social', emoji: '🤝', label: '관계를 가꾸는 사람', desc: '사람을 소중히 여기는' },
];

interface HabitTemplate {
  name: string;
  emoji: string;
  category: string;
}

const HABIT_TEMPLATES: Record<string, HabitTemplate[]> = {
  healthy: [
    { name: '아침 운동 30분', emoji: '🏃', category: 'healthy' },
    { name: '물 8잔 마시기', emoji: '💧', category: 'healthy' },
    { name: '7시간 수면', emoji: '😴', category: 'healthy' },
    { name: '스트레칭 10분', emoji: '🧘', category: 'healthy' },
    { name: '건강한 식사', emoji: '🥗', category: 'healthy' },
  ],
  learner: [
    { name: '30분 독서', emoji: '📚', category: 'learner' },
    { name: '새로운 것 배우기', emoji: '🧠', category: 'learner' },
    { name: '영어 공부 20분', emoji: '📝', category: 'learner' },
    { name: '온라인 강의 1강', emoji: '💻', category: 'learner' },
    { name: '일기 쓰기', emoji: '✍️', category: 'learner' },
  ],
  creative: [
    { name: '글쓰기 30분', emoji: '✍️', category: 'creative' },
    { name: '그림 그리기', emoji: '🎨', category: 'creative' },
    { name: '악기 연습', emoji: '🎵', category: 'creative' },
    { name: '사진 촬영', emoji: '📷', category: 'creative' },
    { name: '아이디어 기록', emoji: '💡', category: 'creative' },
  ],
  mindful: [
    { name: '명상 10분', emoji: '🧘', category: 'mindful' },
    { name: '감사일기 3줄', emoji: '🙏', category: 'mindful' },
    { name: '디지털 디톡스 1시간', emoji: '📵', category: 'mindful' },
    { name: '산책 20분', emoji: '🚶', category: 'mindful' },
    { name: '호흡 운동', emoji: '🌬️', category: 'mindful' },
  ],
  productive: [
    { name: '오늘 할 일 3개 정하기', emoji: '📋', category: 'productive' },
    { name: '딥워크 2시간', emoji: '🎯', category: 'productive' },
    { name: '이메일 정리', emoji: '📧', category: 'productive' },
    { name: '하루 회고 5분', emoji: '📝', category: 'productive' },
    { name: '코딩 1시간', emoji: '💻', category: 'productive' },
  ],
  social: [
    { name: '가족에게 연락하기', emoji: '👨‍👩‍👧', category: 'social' },
    { name: '친구에게 안부 묻기', emoji: '💬', category: 'social' },
    { name: '칭찬 1번 하기', emoji: '👏', category: 'social' },
    { name: '경청 연습', emoji: '👂', category: 'social' },
    { name: '봉사/기부', emoji: '❤️', category: 'social' },
  ],
};

// All habits for "직접 선택" mode
const ALL_POPULAR = [
  { name: '30분 독서', emoji: '📚', category: 'learner' },
  { name: '아침 운동', emoji: '🏃', category: 'healthy' },
  { name: '물 8잔 마시기', emoji: '💧', category: 'healthy' },
  { name: '명상 10분', emoji: '🧘', category: 'mindful' },
  { name: '일기 쓰기', emoji: '✍️', category: 'learner' },
  { name: '7시간 수면', emoji: '😴', category: 'healthy' },
  { name: '감사일기 3줄', emoji: '🙏', category: 'mindful' },
  { name: '코딩 1시간', emoji: '💻', category: 'productive' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: welcome, 1: identity, 2: habits, 3: first-check
  const [userName, setUserName] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<HabitTemplate[]>([]);
  const [createdHabits, setCreatedHabits] = useState<Array<{ id: number; name: string; emoji: string }>>([]);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUserName(d.user?.displayName || '');
    });
  }, []);

  const templates = selectedIdentity ? HABIT_TEMPLATES[selectedIdentity] || ALL_POPULAR : ALL_POPULAR;

  function toggleHabitTemplate(habit: HabitTemplate) {
    setSelectedHabits(prev => {
      const exists = prev.find(h => h.name === habit.name);
      if (exists) return prev.filter(h => h.name !== habit.name);
      if (prev.length >= 5) return prev; // max 5
      return [...prev, habit];
    });
  }

  async function createHabits() {
    setSaving(true);
    const created: Array<{ id: number; name: string; emoji: string }> = [];
    for (const habit of selectedHabits) {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: habit.name, emoji: habit.emoji, isShared: true }),
      });
      const data = await res.json();
      if (res.ok) created.push({ id: data.habit.id, name: habit.name, emoji: habit.emoji });
    }
    setCreatedHabits(created);
    setSaving(false);
    setStep(3);
  }

  async function checkHabit(habitId: number) {
    const today = new Date().toISOString().split('T')[0];
    await fetch('/api/habits/' + habitId + '/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    });
    setCheckedIds(prev => new Set([...prev, habitId]));
  }

  function goToDashboard() {
    router.push('/dashboard');
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">

        {/* ===== STEP 0: Welcome ===== */}
        {step === 0 && (
          <div className="text-center animate-in">
            <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              환영합니다, {userName}님!
            </h1>
            <p className="text-warm-gray leading-relaxed mb-2">
              HabitCircle와 함께 변화를 시작해볼까요?
            </p>
            <p className="text-sm text-warm-gray-light mb-10 leading-relaxed">
              3가지 간단한 질문으로<br />나만의 습관을 세팅해드릴게요.
            </p>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-8 mb-10">
              {[
                { num: '1', label: '정체성' },
                { num: '2', label: '습관 선택' },
                { num: '3', label: '첫 체크!' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 animate-in" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  <div className="w-9 h-9 rounded-full bg-teal-light text-teal flex items-center justify-center text-sm font-bold">
                    {s.num}
                  </div>
                  <span className="text-[11px] text-warm-gray">{s.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all animate-in delay-4"
            >
              시작하기
            </button>
          </div>
        )}

        {/* ===== STEP 1: Identity ===== */}
        {step === 1 && (
          <div className="animate-in">
            {/* Progress */}
            <div className="flex gap-1.5 mb-8">
              <div className="flex-1 h-1 rounded-full bg-teal" />
              <div className="flex-1 h-1 rounded-full bg-border-light" />
              <div className="flex-1 h-1 rounded-full bg-border-light" />
            </div>

            <h1 className="text-xl font-bold mb-2">
              어떤 사람이 되고 싶으세요?
            </h1>
            <p className="text-sm text-warm-gray mb-1 leading-relaxed">
              습관은 행동이 아니라 정체성에서 시작됩니다.
            </p>
            <p className="text-xs text-warm-gray-light mb-6">
              — 제임스 클리어, 아주 작은 습관의 힘
            </p>

            <div className="space-y-2.5">
              {IDENTITY_OPTIONS.map((option, i) => (
                <button
                  key={option.id}
                  onClick={() => { setSelectedIdentity(option.id); setSelectedHabits([]); }}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all touch-feedback animate-in ${
                    selectedIdentity === option.id
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
                  {selectedIdentity === option.id && (
                    <div className="ml-auto w-6 h-6 bg-teal rounded-full flex items-center justify-center shrink-0 animate-check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedIdentity}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-30 mt-6"
            >
              다음
            </button>
          </div>
        )}

        {/* ===== STEP 2: Select Habits ===== */}
        {step === 2 && (
          <div className="animate-in">
            <div className="flex gap-1.5 mb-8">
              <div className="flex-1 h-1 rounded-full bg-teal" />
              <div className="flex-1 h-1 rounded-full bg-teal" />
              <div className="flex-1 h-1 rounded-full bg-border-light" />
            </div>

            <h1 className="text-xl font-bold mb-2">
              {IDENTITY_OPTIONS.find(o => o.id === selectedIdentity)?.emoji}{' '}
              {IDENTITY_OPTIONS.find(o => o.id === selectedIdentity)?.label}이 되기 위한 습관
            </h1>
            <p className="text-sm text-warm-gray mb-1">
              실천할 습관을 골라주세요. (1~5개)
            </p>
            <p className="text-xs text-warm-gray-light mb-6">
              작게 시작하는 것이 핵심! 나중에 언제든 추가할 수 있어요.
            </p>

            <div className="space-y-2">
              {templates.map((habit, i) => {
                const selected = selectedHabits.some(h => h.name === habit.name);
                return (
                  <button
                    key={habit.name}
                    onClick={() => toggleHabitTemplate(habit)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all touch-feedback animate-in ${
                      selected
                        ? 'border-green bg-green-light/50'
                        : 'border-border-light bg-surface hover:border-border'
                    }`}
                    style={{ animationDelay: `${0.04 * i}s` }}
                  >
                    <span className="text-xl">{habit.emoji}</span>
                    <span className="flex-1 text-[14px] font-medium">{habit.name}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected ? 'bg-green border-green text-white' : 'border-border-light'
                    }`}>
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-2 mb-4">
              <button onClick={() => setStep(1)} className="text-sm text-warm-gray hover:text-teal transition-colors px-2 py-1">
                ← 뒤로
              </button>
              <span className="text-xs text-warm-gray-light">{selectedHabits.length}/5 선택됨</span>
            </div>

            <button
              onClick={createHabits}
              disabled={selectedHabits.length === 0 || saving}
              className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-30"
            >
              {saving ? '습관 만드는 중...' : '이 습관들로 시작하기'}
            </button>
          </div>
        )}

        {/* ===== STEP 3: First Check (Aha Moment!) ===== */}
        {step === 3 && (
          <div className="animate-in">
            <div className="flex gap-1.5 mb-8">
              <div className="flex-1 h-1 rounded-full bg-teal" />
              <div className="flex-1 h-1 rounded-full bg-teal" />
              <div className="flex-1 h-1 rounded-full bg-teal" />
            </div>

            <div className="text-center mb-6">
              <p className="text-3xl mb-3 animate-celebrate">🎉</p>
              <h1 className="text-xl font-bold mb-2">
                습관이 준비되었어요!
              </h1>
              <p className="text-sm text-warm-gray leading-relaxed">
                지금 바로 오늘의 첫 습관을 체크해보세요.<br />
                <span className="text-teal font-medium">이 작은 체크 하나가 여정의 시작입니다.</span>
              </p>
            </div>

            <div className="space-y-2.5 mb-6">
              {createdHabits.map((habit, i) => {
                const checked = checkedIds.has(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => !checked && checkHabit(habit.id)}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all touch-feedback animate-in ${
                      checked
                        ? 'border-green bg-green-light/30'
                        : 'border-border-light bg-surface hover:border-teal-muted'
                    }`}
                    style={{ animationDelay: `${0.08 * i}s` }}
                  >
                    <span className={`text-2xl transition-transform ${checked ? 'scale-110' : ''}`}>{habit.emoji}</span>
                    <span className={`flex-1 text-[15px] font-medium ${checked ? 'text-green-dark' : ''}`}>
                      {habit.name}
                    </span>
                    <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                      checked
                        ? 'bg-green border-green text-white shadow-md shadow-green/20 animate-check'
                        : 'border-border-light'
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

            {/* Progress feedback */}
            {checkedIds.size > 0 && (
              <div className="text-center mb-4 animate-in">
                <p className="text-sm text-teal font-medium">
                  {checkedIds.size === createdHabits.length
                    ? '모든 습관을 완료했어요! 대단해요! 🔥'
                    : checkedIds.size + '개 완료! 나머지도 해볼까요?'}
                </p>
              </div>
            )}

            <button
              onClick={goToDashboard}
              className={`w-full py-3.5 rounded-2xl font-medium text-[15px] active:scale-[0.98] transition-all ${
                checkedIds.size > 0
                  ? 'bg-teal text-white hover:bg-teal-dark'
                  : 'bg-surface text-warm-gray border border-border hover:bg-cream-dark'
              }`}
            >
              {checkedIds.size > 0 ? '대시보드로 가기 →' : '나중에 할게요'}
            </button>

            {checkedIds.size === 0 && (
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
