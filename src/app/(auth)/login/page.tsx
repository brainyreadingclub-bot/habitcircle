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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-teal/4 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-8 h-8 rounded-lg bg-teal/15 flex items-center justify-center border border-teal/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">HabitCircle</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-1 animate-in font-display">로그인</h1>
        <p className="text-warm-gray text-center text-sm mb-8 animate-in delay-1">다시 오셨군요! 오늘도 습관을 이어가세요.</p>

        {error && (
          <div className="mb-4 p-3 bg-coral-light text-coral rounded-xl text-sm text-center border border-coral/10">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 animate-in delay-2">
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">이메일</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal/50 focus:ring-1 focus:ring-teal/10 outline-none transition-colors"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-gray mb-1.5 ml-1">비밀번호</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cream-dark border border-border rounded-xl text-sm focus:border-teal/50 focus:ring-1 focus:ring-teal/10 outline-none transition-colors"
              placeholder="6자 이상"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-teal text-cream rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-[0_0_16px_-4px_rgba(110,231,183,0.25)]"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-warm-gray mt-8 animate-in delay-3">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-teal font-medium hover:text-teal-dark transition-colors">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
