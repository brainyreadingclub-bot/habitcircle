'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinCirclePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/circles/${data.circleId}`);
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-8 animate-in">
        <Link href="/circles" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <h1 className="text-xl font-bold">서클 참여</h1>
      </div>

      <div className="text-center py-8 animate-in delay-1">
        <div className="w-16 h-16 bg-teal-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔗</div>
        <p className="text-warm-gray text-sm mb-1">초대 코드를 입력해주세요</p>
        <p className="text-warm-gray-light text-xs">서클 멤버에게 6자리 코드를 받으세요</p>
      </div>

      {error && <div className="mb-4 p-3 bg-coral-light text-coral rounded-xl text-sm text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 animate-in delay-2">
        <input
          type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="w-full px-4 py-4 bg-surface border border-border rounded-xl text-center text-2xl tracking-[0.5em] font-mono uppercase focus:border-teal outline-none"
          placeholder="______"
        />
        <button type="submit" disabled={loading || code.length < 6}
          className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-50">
          {loading ? '참여 중...' : '서클 참여'}
        </button>
      </form>
    </div>
  );
}
