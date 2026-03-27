'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface Circle {
  id: number;
  name: string;
  emoji: string;
  member_count: number;
  role: string;
  invite_code: string;
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthFetch();

  useEffect(() => {
    authFetch('/api/circles').then(r => r.json()).then(d => { setCircles(d.circles || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [authFetch]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-6 animate-in">
        <h1 className="text-2xl font-bold">서클</h1>
        <div className="flex gap-2">
          <Link href="/circles/join" className="px-3 py-2 border border-border rounded-xl text-sm font-medium text-warm-gray hover:border-teal hover:text-teal transition-colors">
            참여
          </Link>
          <Link href="/circles/new" className="px-3 py-2 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal-dark transition-colors">
            만들기
          </Link>
        </div>
      </div>

      {circles.length === 0 ? (
        <div className="text-center py-16 animate-in delay-1">
          <div className="w-16 h-16 bg-teal-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">👥</div>
          <p className="text-warm-gray mb-1">아직 서클이 없어요</p>
          <p className="text-sm text-warm-gray-light mb-6">서클을 만들거나 초대 코드로 참여하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {circles.map((circle, i) => (
            <Link
              key={circle.id}
              href={`/circles/${circle.id}`}
              className={`block p-5 bg-surface rounded-2xl border border-border-light hover:border-teal/30 transition-all animate-in delay-${Math.min(i + 1, 8)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl w-12 h-12 bg-teal-light rounded-2xl flex items-center justify-center">{circle.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] truncate">{circle.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-warm-gray">{circle.member_count}명</span>
                    {circle.role === 'owner' && <span className="text-[10px] bg-amber-light text-amber-dark px-1.5 py-0.5 rounded-md font-medium">관리자</span>}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-gray-light shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
