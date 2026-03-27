'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarColor: string;
  createdAt: string;
}

interface Stats {
  habitCount: number;
  totalCompletions: number;
  bestStreak: { current: number; longest: number; habitName: string; habitEmoji: string };
  friendCount: number;
  circleCount: number;
  daysSinceJoin: number;
  habits: Array<{ id: number; name: string; emoji: string; streak: number; completionRate7: number }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthFetch();

  useEffect(() => {
    Promise.all([
      authFetch('/api/auth/me').then(r => r.json()),
      authFetch('/api/stats').then(r => r.json()),
    ]).then(([userData, statsData]) => {
      setUser(userData.user);
      setStats(statsData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [authFetch]);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  }

  if (loading || !user || !stats) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Profile card */}
      <div className="flex flex-col items-center mb-8 animate-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
          style={{ backgroundColor: user.avatarColor }}>
          {user.displayName[0]}
        </div>
        <h1 className="text-xl font-bold">{user.displayName}</h1>
        <p className="text-sm text-warm-gray">@{user.username}</p>
        <p className="text-xs text-warm-gray-light mt-1">{stats.daysSinceJoin}일째 함께하는 중</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-in delay-1">
        <div className="bg-surface rounded-2xl border border-border-light p-4 text-center">
          <p className="text-2xl font-bold text-teal">{stats.habitCount}</p>
          <p className="text-[11px] text-warm-gray mt-1">습관</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border-light p-4 text-center">
          <p className="text-2xl font-bold text-green">{stats.totalCompletions}</p>
          <p className="text-[11px] text-warm-gray mt-1">총 완료</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border-light p-4 text-center">
          <p className="text-2xl font-bold text-amber">{stats.bestStreak.longest}</p>
          <p className="text-[11px] text-warm-gray mt-1">최장 연속</p>
        </div>
      </div>

      {/* Social stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-in delay-2">
        <Link href="/friends" className="bg-surface rounded-2xl border border-border-light p-4 hover:border-teal/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lavender-light rounded-xl flex items-center justify-center text-lg" role="img" aria-label="친구">👋</div>
            <div>
              <p className="text-lg font-bold">{stats.friendCount}</p>
              <p className="text-[11px] text-warm-gray">친구</p>
            </div>
          </div>
        </Link>
        <Link href="/circles" className="bg-surface rounded-2xl border border-border-light p-4 hover:border-teal/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center text-lg" role="img" aria-label="서클">👥</div>
            <div>
              <p className="text-lg font-bold">{stats.circleCount}</p>
              <p className="text-[11px] text-warm-gray">서클</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Best streak highlight */}
      {stats.bestStreak.current > 0 && (
        <div className="bg-gradient-to-r from-amber-light to-amber-light/50 rounded-2xl p-5 mb-6 animate-in delay-3">
          <p className="text-xs text-amber-dark font-medium mb-2">현재 최고 연속 기록</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stats.bestStreak.habitEmoji}</span>
            <div>
              <p className="font-bold text-amber-dark">{stats.bestStreak.habitName}</p>
              <p className="text-2xl font-bold text-amber-dark">🔥 {stats.bestStreak.current}일</p>
            </div>
          </div>
        </div>
      )}

      {/* Habit stats breakdown */}
      {stats.habits.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border-light p-5 mb-6 animate-in delay-4">
          <h2 className="text-sm font-medium mb-4">습관별 현황</h2>
          <div className="space-y-4">
            {stats.habits.map(habit => (
              <div key={habit.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm">{habit.emoji} {habit.name}</span>
                  <div className="flex items-center gap-3 text-xs">
                    {habit.streak > 0 && <span className="text-amber">🔥{habit.streak}</span>}
                    <span className="text-teal font-medium">{habit.completionRate7}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${habit.completionRate7}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3 text-coral text-sm font-medium rounded-xl hover:bg-coral-light transition-colors animate-in delay-5">
        로그아웃
      </button>
    </div>
  );
}
