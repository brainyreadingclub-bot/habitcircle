'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFreshDate } from '@/hooks/useFreshDate';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { getTodayInsight, type Insight } from '@/lib/insights';

interface Habit {
  id: number;
  name: string;
  emoji: string;
  completed_today: number;
  streak: number;
}

interface FeedItem {
  display_name: string;
  avatar_color: string;
  habit_name: string;
  habit_emoji: string;
}

// Streak milestone thresholds
const MILESTONES = [7, 14, 21, 30, 50, 60, 90, 100, 365];
function getNextMilestone(streak: number) {
  return MILESTONES.find(m => m > streak);
}
function isMilestone(streak: number) {
  return MILESTONES.includes(streak);
}

// Time-aware greeting (cognitive psychology: personalization increases commitment)
function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 6) return { text: `좋은 새벽이에요, ${name}님`, sub: '일찍 일어나셨네요! 오늘도 좋은 하루를 시작해요.' };
  if (hour < 12) return { text: `좋은 아침이에요, ${name}님`, sub: '상쾌한 아침, 오늘의 습관을 시작해볼까요?' };
  if (hour < 18) return { text: `좋은 오후예요, ${name}님`, sub: '오후에도 꾸준히! 남은 습관을 완료해보세요.' };
  return { text: `좋은 저녁이에요, ${name}님`, sub: '오늘 하루를 마무리하며 습관을 점검해요.' };
}

// Motivational messages (variable reward — brain science: unpredictability boosts dopamine)
const MOTIVATIONS = [
  '작은 습관이 쌓이면 큰 변화가 됩니다.',
  '"우리는 반복적으로 하는 행동으로 만들어진다." — 아리스토텔레스',
  '어제보다 1%만 나아지면 됩니다.',
  '완벽하지 않아도 괜찮아요. 꾸준함이 완벽을 이깁니다.',
  '지금 이 순간의 작은 결심이 미래를 바꿉니다.',
  '습관은 의지력이 아니라 시스템입니다.',
  '오늘의 한 걸음이 내일의 백 걸음이 됩니다.',
];

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [rippleId, setRippleId] = useState<number | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [milestoneHabit, setMilestoneHabit] = useState<{ name: string; emoji: string; streak: number } | null>(null);
  const [motivation] = useState(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  const [todayInsight, setTodayInsight] = useState<Insight | null>(null);
  const [insightDismissed, setInsightDismissed] = useState(false);
  const prevCompletedRef = useRef(false);
  const todayStr = useFreshDate();
  const authFetch = useAuthFetch();

  const today = new Date(todayStr + 'T00:00:00+09:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, feedRes, meRes] = await Promise.all([
        authFetch('/api/habits').then(r => r.json()),
        authFetch('/api/feed').then(r => r.json()),
        authFetch('/api/auth/me').then(r => r.json()),
      ]);
      if (meRes.user && !meRes.user.onboardingCompleted) {
        router.replace('/onboarding');
        return;
      }
      const habitsData = habitsRes.habits || [];
      setHabits(habitsData);
      setFeed((feedRes.feed || []).slice(0, 3));
      setUserName(meRes.user?.displayName || '');

      // Compute insight context
      const createdAt = meRes.user?.createdAt;
      const daysSinceJoin = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000) : 0;
      const anyStreakBroken = habitsData.some((h: Habit) => h.streak === 0 && !h.completed_today);
      setTodayInsight(getTodayInsight({
        daysSinceJoin,
        streakBroken: anyStreakBroken,
        completionRate7: 0,
        habitCount: habitsData.length,
      }));
    } finally {
      setLoading(false);
    }
  }, [todayStr, authFetch, router]);

  // 날짜 변경 시 즉시 체크 초기화 (새 날 = 새 시작)
  const prevDateRef = useRef(todayStr);
  useEffect(() => {
    if (prevDateRef.current !== todayStr) {
      prevDateRef.current = todayStr;
      setHabits(prev => prev.map(h => ({ ...h, completed_today: 0 })));
    }
  }, [todayStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggleHabit(habitId: number) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const wasCompleted = !!habit.completed_today;
    const newStreak = wasCompleted ? habit.streak - 1 : habit.streak + 1;

    // Trigger animations
    setAnimatingId(habitId);
    if (!wasCompleted) {
      setRippleId(habitId);
      setTimeout(() => setRippleId(null), 600);

      // Check for milestone (neuroscience: milestone celebrations create dopamine spikes)
      if (isMilestone(newStreak)) {
        setTimeout(() => {
          setMilestoneHabit({ name: habit.name, emoji: habit.emoji, streak: newStreak });
          setTimeout(() => setMilestoneHabit(null), 3500);
        }, 500);
      }
    }
    setTimeout(() => setAnimatingId(null), 500);

    // Optimistic update with rollback
    const previousHabits = habits;
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, completed_today: wasCompleted ? 0 : 1, streak: newStreak } : h
    ));

    try {
      const res = await authFetch(`/api/habits/${habitId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: todayStr }),
      });
      if (!res.ok) setHabits(previousHabits);
    } catch {
      setHabits(previousHabits);
    }
  }

  // Detect all-complete state (peak-end rule: celebrate the climax moment)
  const completedCount = habits.filter(h => h.completed_today).length;
  const totalCount = habits.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (allDone && !prevCompletedRef.current) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 4000);
    }
    prevCompletedRef.current = allDone;
  }, [allDone]);

  const greeting = getGreeting(userName || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-10 pb-6">
      {/* Milestone celebration overlay */}
      {milestoneHabit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-charcoal/20 backdrop-blur-sm" onClick={() => setMilestoneHabit(null)}>
          <div className="bg-surface rounded-3xl p-8 mx-6 text-center animate-celebrate shadow-xl max-w-sm">
            <div className="text-5xl mb-3 animate-fire">{milestoneHabit.emoji}</div>
            <p className="text-xs text-amber font-medium mb-1 tracking-wider uppercase">MILESTONE</p>
            <p className="text-2xl font-bold mb-1">{milestoneHabit.name}</p>
            <p className="text-3xl font-bold text-amber">🔥 {milestoneHabit.streak}일 연속!</p>
            <p className="text-sm text-warm-gray mt-3">대단해요! 이 기록을 이어가세요.</p>
          </div>
        </div>
      )}

      {/* All-complete celebration banner */}
      {justCompleted && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-light via-teal-light to-lavender-light rounded-2xl text-center animate-celebrate relative overflow-hidden">
          {/* Confetti particles */}
          <div className="confetti-particle confetti-1 top-2 left-1/4 w-2 h-2 bg-amber rounded-sm" />
          <div className="confetti-particle confetti-2 top-3 left-1/2 w-1.5 h-1.5 bg-coral rounded-full" />
          <div className="confetti-particle confetti-3 top-1 left-3/4 w-2 h-2 bg-green rounded-sm" />
          <div className="confetti-particle confetti-4 top-4 left-1/3 w-1.5 h-1.5 bg-lavender rounded-full" />
          <div className="confetti-particle confetti-5 top-2 left-2/3 w-2 h-2 bg-teal rounded-sm" />
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-charcoal">오늘의 습관 모두 완료!</p>
          <p className="text-sm text-warm-gray mt-1">꾸준히 해내는 당신, 정말 멋져요.</p>
        </div>
      )}

      {/* Personalized greeting (cognitive psych: identity-based habit building) */}
      <div className="mb-2 animate-in">
        <p className="text-sm text-warm-gray mb-0.5">
          {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 {dayNames[today.getDay()]}요일
        </p>
        <h1 className="text-xl font-bold">{greeting.text}</h1>
        <p className="text-xs text-warm-gray-light mt-1 leading-relaxed">{greeting.sub}</p>
      </div>

      {/* Daily motivation (variable reward) */}
      <div className="mb-6 animate-in delay-1">
        <p className="text-[13px] text-teal-muted italic leading-relaxed">"{motivation}"</p>
      </div>

      {/* Social proof nudge (behavioral economics: social proof drives action) */}
      {feed.length > 0 && (
        <div className="mb-5 animate-in delay-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-teal-light/50 rounded-xl">
            <div className="flex -space-x-2">
              {feed.slice(0, 3).map((f, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-teal-light flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ backgroundColor: f.avatar_color, zIndex: 3 - i }}>
                  {f.display_name[0]}
                </div>
              ))}
            </div>
            <p className="text-xs text-teal-dark flex-1">
              <span className="font-medium">{feed[0].display_name}</span>님이{feed.length > 1 ? ` 외 ${feed.length - 1}명이` : ''} 오늘 습관을 완료했어요
            </p>
          </div>
        </div>
      )}

      {/* Today's insight card */}
      {todayInsight && !insightDismissed && (
        <div className="mb-5 animate-in delay-2">
          <div className="relative p-4 bg-surface rounded-2xl border border-amber/20">
            <button onClick={() => setInsightDismissed(true)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-cream-dark text-warm-gray-light">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div className="flex items-start gap-3 pr-6">
              <span className="text-lg mt-0.5">💡</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">{todayInsight.title}</p>
                <p className="text-xs text-warm-gray mt-1 line-clamp-2">{todayInsight.subtitle}</p>
                <Link href={`/insights/${todayInsight.id}`} className="inline-block text-xs text-teal font-medium mt-2 hover:underline">
                  더 읽기 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress summary with animated bar */}
      {totalCount > 0 && (
        <div className="mb-6 animate-in delay-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-warm-gray">
              {allDone ? '모두 완료! 🎉' : `${completedCount}/${totalCount} 완료`}
            </span>
            <span className={`text-sm font-bold transition-all ${allDone ? 'text-green animate-number' : 'text-teal'}`}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="h-2.5 bg-border-light rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                allDone
                  ? 'bg-gradient-to-r from-green via-teal to-green'
                  : 'bg-gradient-to-r from-teal to-green'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Habits list */}
      {totalCount === 0 ? (
        <div className="text-center py-16 animate-in delay-2">
          <div className="w-16 h-16 bg-teal-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl" role="img" aria-label="체크">✅</div>
          <p className="text-warm-gray mb-1">아직 습관이 없어요</p>
          <p className="text-sm text-warm-gray-light mb-6">첫 습관이 가장 어렵습니다. 하지만 시작한 사람만이 변합니다.</p>
          <Link href="/habits/new" className="inline-flex px-6 py-2.5 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal-dark transition-colors">
            습관 추가하기
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map((habit, i) => {
            const isCompleted = !!habit.completed_today;
            const nextMilestone = getNextMilestone(habit.streak);
            const milestoneProgress = nextMilestone ? (habit.streak / nextMilestone) * 100 : 100;
            const isAnimating = animatingId === habit.id;
            const showRipple = rippleId === habit.id;

            return (
              <div
                key={habit.id}
                className={`relative flex items-center gap-3.5 p-4 bg-surface rounded-2xl border transition-all touch-feedback animate-in delay-${Math.min(i + 3, 8)} ${
                  isCompleted
                    ? 'habit-completed-glow'
                    : 'border-border-light hover:border-border'
                }`}
              >
                {/* Emoji with subtle scale on completion */}
                <span className={`text-2xl w-10 h-10 flex items-center justify-center shrink-0 transition-transform ${
                  isCompleted ? 'scale-105' : 'opacity-80'
                }`}>
                  {habit.emoji}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/habits/${habit.id}`} className={`font-medium text-[15px] transition-colors truncate block ${
                    isCompleted ? 'text-charcoal' : 'text-charcoal-light hover:text-teal'
                  }`}>
                    {habit.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-0.5">
                    {habit.streak > 0 && (
                      <span className={`text-xs text-amber flex items-center gap-0.5 ${
                        isMilestone(habit.streak) ? 'font-bold' : ''
                      }`}>
                        <span className={isMilestone(habit.streak) ? 'animate-fire inline-block' : ''} role="img" aria-label="연속 기록">🔥</span>
                        {habit.streak}일
                      </span>
                    )}
                    {/* Milestone progress hint (endowed progress effect) */}
                    {nextMilestone && habit.streak > 0 && !isCompleted && (
                      <span className="text-[10px] text-warm-gray-light">
                        → {nextMilestone}일까지 {nextMilestone - habit.streak}일
                      </span>
                    )}
                  </div>

                  {/* Mini milestone progress bar (endowed progress effect — makes goal feel closer) */}
                  {nextMilestone && habit.streak > 0 && (
                    <div className="h-1 bg-border-light rounded-full overflow-hidden mt-1.5 max-w-[120px]">
                      <div className="h-full bg-amber/60 rounded-full transition-all duration-500" style={{ width: `${milestoneProgress}%` }} />
                    </div>
                  )}
                </div>

                {/* Toggle button with ripple effect */}
                <div className="relative shrink-0">
                  {/* Ripple */}
                  {showRipple && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-green/30 animate-ripple" />
                    </div>
                  )}

                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green border-green text-white shadow-md shadow-green/20'
                        : 'border-border-light hover:border-teal-muted bg-surface'
                    } ${isAnimating ? 'animate-check' : ''}`}
                    aria-label={isCompleted ? '완료 취소' : '완료하기'}
                  >
                    {isCompleted ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      /* Empty state: subtle inner ring hint */
                      <div className="w-5 h-5 rounded-full border-2 border-border opacity-40" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Streak warning — loss aversion (cognitive psychology: fear of losing is 2x stronger than gaining) */}
      {habits.some(h => h.streak >= 3 && !h.completed_today) && !allDone && (
        <div className="mt-4 p-3 bg-amber-light/60 rounded-xl flex items-center gap-2.5 animate-in delay-6">
          <span className="text-lg animate-shake" role="img" aria-label="경고">⚠️</span>
          <div>
            <p className="text-xs font-medium text-amber-dark">연속 기록을 지켜주세요!</p>
            <p className="text-[11px] text-amber-dark/70">
              {habits.filter(h => h.streak >= 3 && !h.completed_today).map(h => `${h.emoji} ${h.name} (${h.streak}일)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Add habit button */}
      {totalCount > 0 && (
        <Link
          href="/habits/new"
          className="flex items-center justify-center gap-2 mt-5 py-3 border-2 border-dashed border-border rounded-2xl text-warm-gray hover:border-teal hover:text-teal transition-colors touch-feedback animate-in delay-7"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span className="text-sm font-medium">습관 추가</span>
        </Link>
      )}
    </div>
  );
}
