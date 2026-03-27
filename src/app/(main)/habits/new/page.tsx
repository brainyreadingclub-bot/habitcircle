'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/useAuthFetch';

const EMOJI_OPTIONS = ['✅', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '💪', '🌅', '😴', '🥗', '🎵', '💻', '🚶', '📝', '🧹'];

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [isShared, setIsShared] = useState(false);
  const [showDesign, setShowDesign] = useState(false);
  const [triggerTime, setTriggerTime] = useState('');
  const [triggerLocation, setTriggerLocation] = useState('');
  const [smallestVersion, setSmallestVersion] = useState('');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authFetch = useAuthFetch();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, emoji, isShared,
          triggerTime: triggerTime || undefined,
          triggerLocation: triggerLocation || undefined,
          smallestVersion: smallestVersion || undefined,
          reward: reward || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push('/dashboard');
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-8 animate-in">
        <Link href="/habits" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <h1 className="text-xl font-bold">새 습관 추가</h1>
      </div>

      {error && <div className="mb-4 p-3 bg-coral-light text-coral rounded-xl text-sm text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 animate-in delay-1">
        {/* Emoji picker */}
        <div>
          <label className="block text-xs font-medium text-warm-gray mb-3 ml-1">아이콘</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e} type="button" onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                  emoji === e ? 'bg-teal-light border-2 border-teal scale-110' : 'bg-surface border border-border-light hover:border-border'
                }`}
              >{e}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">습관 이름</label>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none transition-colors"
            placeholder="예: 매일 30분 독서"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">설명 (선택)</label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none transition-colors resize-none h-20"
            placeholder="이 습관에 대한 메모..."
          />
        </div>

        {/* 습관 설계 (Atomic Habits) — 접이식 */}
        <div>
          <button type="button" onClick={() => setShowDesign(!showDesign)}
            className="flex items-center gap-2 text-sm text-teal font-medium mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showDesign ? 'rotate-90' : ''}`}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            습관 설계 (선택사항)
          </button>
          {showDesign && (
            <div className="space-y-4 pl-1 animate-in">
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">📍 언제 하나요?</label>
                <input type="text" value={triggerTime} onChange={e => setTriggerTime(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none"
                  placeholder="예: 아침 7시, 점심 후" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">📍 어디서 하나요?</label>
                <input type="text" value={triggerLocation} onChange={e => setTriggerLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none"
                  placeholder="예: 거실, 회사 책상" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">🔬 가장 작은 버전</label>
                <input type="text" value={smallestVersion} onChange={e => setSmallestVersion(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none"
                  placeholder="예: 1페이지만 읽기" />
                <p className="text-[11px] text-warm-gray-light mt-1 ml-1">2분 안에 끝낼 수 있는 버전</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">🎁 완료 후 보상</label>
                <input type="text" value={reward} onChange={e => setReward(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none"
                  placeholder="예: 좋아하는 커피 한 잔" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-light">
          <div>
            <p className="text-sm font-medium">친구에게 공개</p>
            <p className="text-xs text-warm-gray mt-0.5">친구들이 내 진행 상황을 볼 수 있어요</p>
          </div>
          <button
            type="button" onClick={() => setIsShared(!isShared)}
            className={`w-11 h-6 rounded-full transition-colors ${isShared ? 'bg-teal' : 'bg-border'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isShared ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? '추가 중...' : '습관 추가'}
        </button>
      </form>
    </div>
  );
}
