'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface CircleDetail {
  id: number;
  name: string;
  emoji: string;
  description: string;
  invite_code: string;
  memberCount: number;
}

interface MemberProgress {
  id: number;
  displayName: string;
  avatarColor: string;
  role: string;
  dailyProgress: Array<{ date: string; completed: number; total: number }>;
}

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    Promise.all([
      authFetch(`/api/circles/${id}`).then(r => r.json()),
      authFetch(`/api/circles/${id}/members`).then(r => r.json()),
    ]).then(([circleData, membersData]) => {
      setCircle(circleData.circle);
      setMembers(membersData.members || []);
      setDays(membersData.days || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, authFetch]);

  function copyCode() {
    if (circle) {
      navigator.clipboard.writeText(circle.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading || !circle) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  const dayLabels = days.map(d => {
    const date = new Date(d + 'T00:00:00');
    return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  });

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-in">
        <Link href="/circles" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{circle.emoji}</span>
            <h1 className="text-xl font-bold truncate">{circle.name}</h1>
          </div>
          <p className="text-xs text-warm-gray mt-0.5">{circle.memberCount}명의 멤버</p>
        </div>
      </div>

      {/* Invite code */}
      <div className="bg-teal-light rounded-2xl p-4 mb-6 animate-in delay-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-dark font-medium mb-1">초대 코드</p>
            <p className="text-xl font-mono font-bold tracking-[0.3em] text-teal-dark">{circle.invite_code}</p>
          </div>
          <button onClick={copyCode}
            className="px-4 py-2 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal-dark transition-colors">
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
      </div>

      {circle.description && (
        <div className="bg-surface rounded-2xl border border-border-light p-4 mb-6 animate-in delay-2">
          <p className="text-sm text-warm-gray">{circle.description}</p>
        </div>
      )}

      {/* Progress Grid — The key visual */}
      <div className="bg-surface rounded-2xl border border-border-light p-5 mb-6 animate-in delay-3">
        <h2 className="text-sm font-medium mb-4">최근 7일 진행도</h2>

        {members.length === 0 ? (
          <p className="text-sm text-warm-gray text-center py-4">멤버가 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3 pr-3">
                    <span className="text-xs text-warm-gray-light font-normal">멤버</span>
                  </th>
                  {dayLabels.map((label, i) => (
                    <th key={i} className="pb-3 px-0.5 text-center">
                      <span className="text-[10px] text-warm-gray-light font-normal">{label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: member.avatarColor }}>
                          {member.displayName[0]}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[80px]">{member.displayName}</span>
                      </div>
                    </td>
                    {member.dailyProgress.map((day, i) => {
                      const pct = day.total > 0 ? day.completed / day.total : 0;
                      const isToday = i === member.dailyProgress.length - 1;
                      return (
                        <td key={i} className="py-3 px-0.5 text-center">
                          <div
                            className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[11px] font-medium transition-colors ${
                              pct === 1
                                ? 'bg-green text-white'
                                : pct > 0
                                ? 'bg-green-light text-green-dark'
                                : isToday
                                ? 'bg-cream-dark text-warm-gray-light'
                                : 'bg-border-light text-warm-gray-light'
                            }`}
                            title={`${day.date}: ${day.completed}/${day.total}`}
                          >
                            {pct === 1 ? '✓' : day.total > 0 ? `${day.completed}` : '·'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border-light">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-border-light" />
            <span className="text-[10px] text-warm-gray-light">미완료</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-light" />
            <span className="text-[10px] text-warm-gray-light">일부</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green" />
            <span className="text-[10px] text-warm-gray-light">완료</span>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="animate-in delay-4">
        <h2 className="text-sm font-medium mb-3">멤버</h2>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-light">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: member.avatarColor }}>
                {member.displayName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.displayName}</p>
              </div>
              {member.role === 'owner' && (
                <span className="text-[10px] bg-amber-light text-amber-dark px-1.5 py-0.5 rounded-md font-medium">관리자</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
