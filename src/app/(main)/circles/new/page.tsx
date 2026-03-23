'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EMOJI_OPTIONS = ['👥', '🎯', '💪', '📚', '🏃', '🧘', '🌱', '⭐', '🔥', '🚀', '🎨', '🎵'];

export default function NewCirclePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, emoji }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/circles/${data.circle.id}`);
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
        <h1 className="text-xl font-bold">새 서클 만들기</h1>
      </div>

      {error && <div className="mb-4 p-3 bg-coral-light text-coral rounded-xl text-sm text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 animate-in delay-1">
        <div>
          <label className="block text-xs font-medium text-warm-gray mb-3 ml-1">아이콘</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-teal-light border-2 border-teal scale-110' : 'bg-surface border border-border-light'}`}
              >{e}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">서클 이름</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none"
            placeholder="예: 독서 모임" />
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">설명 (선택)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none resize-none h-20"
            placeholder="서클에 대한 설명..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-50">
          {loading ? '만드는 중...' : '서클 만들기'}
        </button>
      </form>
    </div>
  );
}
