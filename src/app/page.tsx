'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => { if (res.ok) router.replace('/dashboard'); })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-teal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-lavender/5 blur-[100px] pointer-events-none" />

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        {/* Logo mark */}
        <div className="relative mb-10">
          <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center border border-teal/10">
            <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          {/* Floating accents */}
          <div className="absolute -top-3 -right-4 w-2.5 h-2.5 rounded-full bg-amber animate-in delay-2" style={{ animationDuration: '0.8s' }} />
          <div className="absolute -bottom-2 -left-5 w-2 h-2 rounded-full bg-teal animate-in delay-4" style={{ animationDuration: '0.8s' }} />
          <div className="absolute top-0 -left-7 w-1.5 h-1.5 rounded-full bg-lavender/60 animate-in delay-6" style={{ animationDuration: '0.8s' }} />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-center mb-3 tracking-tight animate-in">
          HabitCircle
        </h1>
        <p className="text-lg text-warm-gray text-center mb-1 animate-in delay-1 font-display font-light tracking-wide">
          습관서클
        </p>
        <p className="text-sm text-warm-gray-light text-center max-w-xs mb-14 animate-in delay-2 leading-relaxed">
          함께 만드는 작은 습관의 힘.<br />
          매일의 기록이 모여 변화가 됩니다.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs animate-in delay-3">
          <Link
            href="/signup"
            className="w-full py-3.5 bg-teal text-cream text-center rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all shadow-[0_0_20px_-4px_rgba(110,231,183,0.3)]"
          >
            시작하기
          </Link>
          <Link
            href="/login"
            className="w-full py-3.5 bg-surface text-charcoal text-center rounded-2xl font-medium text-[15px] border border-border hover:bg-cream-dark active:scale-[0.98] transition-all"
          >
            로그인
          </Link>
        </div>
      </div>

      {/* Bottom feature hints */}
      <div className="px-6 pb-10 relative z-10">
        <div className="flex items-center justify-center gap-8 text-warm-gray-light text-xs">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            습관 추적
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lavender" />
            친구 공유
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            서클 챌린지
          </span>
        </div>
      </div>
    </div>
  );
}
