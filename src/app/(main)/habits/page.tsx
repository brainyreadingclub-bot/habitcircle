'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    fetch('/api/habits').then(r => r.json()).then(d => { setHabits(d.habits); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-6 animate-in">
        <h1 className="text-2xl font-bold">내 습관</h1>
        <Link href="/habits/new" className="w-9 h-9 bg-teal text-white rounded-xl flex items-center justify-center hover:bg-teal-dark transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 animate-in delay-1">
          <p className="text-warm-gray mb-4">아직 습관이 없어요</p>
          <Link href="/habits/new" className="inline-flex px-6 py-2.5 bg-teal text-white rounded-xl text-sm font-medium">습관 추가하기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, i) => (
            <Link
              key={habit.id}
              href={`/habits/${habit.id}`}
              className={`block p-4 bg-surface rounded-2xl border border-border-light hover:border-teal/30 transition-all animate-in delay-${Math.min(i + 1, 8)}`}
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
          ))}
        </div>
      )}
    </div>
  );
}
