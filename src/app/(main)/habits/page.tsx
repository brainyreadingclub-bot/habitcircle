'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface Habit {
  id: number;
  name: string;
  emoji: string;
  description: string;
  is_shared: number;
  streak: number;
  longestStreak: number;
  completed_today: number;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [saving, setSaving] = useState(false);
  const authFetch = useAuthFetch();

  const loadHabits = useCallback(() => {
    authFetch('/api/habits').then(r => r.json()).then(d => { setHabits(d.habits || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [authFetch]);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  function moveHabit(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= habits.length) return;
    const updated = [...habits];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setHabits(updated);
  }

  async function saveOrder() {
    setSaving(true);
    try {
      const res = await authFetch('/api/habits/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitIds: habits.map(h => h.id) }),
      });
      if (res.ok) setReordering(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-6 animate-in">
        <h1 className="text-2xl font-bold">내 습관</h1>
        <div className="flex items-center gap-2">
          {habits.length > 1 && (
            reordering ? (
              <button
                onClick={saveOrder}
                disabled={saving}
                className="px-3 py-2 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : '완료'}
              </button>
            ) : (
              <button
                onClick={() => setReordering(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border-light hover:border-teal hover:text-teal transition-colors text-warm-gray"
                aria-label="순서 변경"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  <polyline points="7 3 3 6 7 9" /><polyline points="17 15 21 18 17 21" />
                </svg>
              </button>
            )
          )}
          {!reordering && (
            <Link href="/habits/new" className="w-9 h-9 bg-teal text-white rounded-xl flex items-center justify-center hover:bg-teal-dark transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </Link>
          )}
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 animate-in delay-1">
          <p className="text-warm-gray mb-4">아직 습관이 없어요</p>
          <Link href="/habits/new" className="inline-flex px-6 py-2.5 bg-teal text-white rounded-xl text-sm font-medium">습관 추가하기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, i) => (
            <div
              key={habit.id}
              className={`flex items-center gap-2 animate-in delay-${Math.min(i + 1, 8)}`}
            >
              {reordering && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => moveHabit(i, -1)}
                    disabled={i === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border-light hover:border-teal disabled:opacity-20 transition-colors"
                    aria-label="위로 이동"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
                  </button>
                  <button
                    onClick={() => moveHabit(i, 1)}
                    disabled={i === habits.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border-light hover:border-teal disabled:opacity-20 transition-colors"
                    aria-label="아래로 이동"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                </div>
              )}
              {reordering ? (
                <div className="flex-1 p-4 bg-surface rounded-2xl border border-teal/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center">{habit.emoji}</span>
                    <p className="font-medium text-[15px] truncate">{habit.name}</p>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/habits/${habit.id}`}
                  className="flex-1 block p-4 bg-surface rounded-2xl border border-border-light hover:border-teal/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center">{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px] truncate">{habit.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {habit.streak > 0 && <span className="text-xs text-amber">🔥 {habit.streak}일</span>}
                        {habit.is_shared ? (
                          <span className="text-xs text-teal-muted">공개</span>
                        ) : (
                          <span className="text-xs text-warm-gray-light">비공개</span>
                        )}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-gray-light"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
