'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { INSIGHTS, INSIGHT_CATEGORIES, getRecommendedInsights } from '@/lib/insights';

export default function InsightsPage() {
  const [context, setContext] = useState({ daysSinceJoin: 0, streakBroken: false, completionRate7: 0, habitCount: 0 });
  const [loaded, setLoaded] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    Promise.all([
      authFetch('/api/auth/me').then(r => r.json()),
      authFetch('/api/stats').then(r => r.json()),
      authFetch('/api/habits').then(r => r.json()),
    ]).then(([me, stats, habitsData]) => {
      const habits = habitsData.habits || [];
      const anyStreakBroken = habits.some((h: { streak: number; completed_today: number }) => h.streak === 0 && !h.completed_today);
      const avgRate = habits.length > 0
        ? Math.round(habits.reduce((s: number, h: { completionRate7?: number }) => s + (h.completionRate7 || 0), 0) / habits.length)
        : 0;
      setContext({
        daysSinceJoin: stats.daysSinceJoin || 0,
        streakBroken: anyStreakBroken,
        completionRate7: avgRate,
        habitCount: habits.length,
      });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [authFetch]);

  const recommended = loaded ? getRecommendedInsights(context) : [];

  return (
    <div className="px-5 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-in">
        <Link href="/profile" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors touch-feedback">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold">인사이트</h1>
          <p className="text-xs text-warm-gray">습관의 심리학</p>
        </div>
      </div>

      {/* Recommended for you */}
      {loaded && recommended.length > 0 && (
        <div className="mb-8 animate-in delay-1">
          <h2 className="text-sm font-medium text-warm-gray mb-3">당신을 위한 추천</h2>
          <div className="space-y-3">
            {recommended.map(insight => {
              const cat = INSIGHT_CATEGORIES.find(c => c.id === insight.category);
              return (
                <Link key={insight.id} href={`/insights/${insight.id}`}
                  className="block p-4 bg-gradient-to-r from-teal-light/50 to-teal-light/20 rounded-2xl border border-teal/20 hover:border-teal/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{cat?.emoji || '💡'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{insight.title}</p>
                      <p className="text-xs text-warm-gray mt-1 line-clamp-1">{insight.subtitle}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal shrink-0 mt-1"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {INSIGHT_CATEGORIES.map((cat, ci) => {
        const catInsights = INSIGHTS.filter(i => i.category === cat.id);
        if (catInsights.length === 0) return null;
        return (
          <div key={cat.id} className={`mb-8 animate-in delay-${Math.min(ci + 2, 5)}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.emoji}</span>
              <div>
                <h2 className="text-sm font-medium">{cat.title}</h2>
                <p className="text-[11px] text-warm-gray">{cat.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {catInsights.map(insight => (
                <Link key={insight.id} href={`/insights/${insight.id}`}
                  className="flex items-center gap-3 p-3.5 bg-surface rounded-xl border border-border-light hover:border-border transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{insight.title}</p>
                    <p className="text-[11px] text-warm-gray mt-0.5 truncate">{insight.subtitle}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-gray-light shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
