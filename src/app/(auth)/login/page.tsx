'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="font-display text-xl font-semibold">HabitCircle</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-1 animate-in">로그인</h1>
        <p className="text-warm-gray text-center text-sm mb-8 animate-in delay-1">다시 오셨군요! 오늘도 습관을 이어가세요.</p>

        {error && (
          <div className="mb-4 p-3 bg-coral-light text-coral rounded-xl text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 animate-in delay-2">
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">이메일</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none transition-colors"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">비밀번호</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none transition-colors"
              placeholder="6자 이상"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-teal text-white rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-warm-gray mt-6 animate-in delay-3">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-teal font-medium hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
