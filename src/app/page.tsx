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
    <div className="min-h-dvh flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Decorative circles */}
        <div className="relative mb-12">
          <div className="w-24 h-24 rounded-full bg-teal/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
          {/* Floating dots */}
          <div className="absolute -top-2 -right-3 w-3 h-3 rounded-full bg-amber animate-in delay-2" />
          <div className="absolute -bottom-1 -left-4 w-2 h-2 rounded-full bg-green animate-in delay-4" />
          <div className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-coral/60 animate-in delay-6" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-center mb-4 tracking-tight animate-in">
          HabitCircle
        </h1>
        <p className="text-lg text-warm-gray text-center max-w-sm mb-2 animate-in delay-1">
          습관서클
        </p>
        <p className="text-base text-warm-gray-light text-center max-w-xs mb-12 animate-in delay-2 leading-relaxed">
          함께 만드는 작은 습관의 힘.<br />
          매일의 기록이 모여 변화가 됩니다.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs animate-in delay-3">
          <Link
            href="/signup"
            className="w-full py-3.5 bg-teal text-white text-center rounded-2xl font-medium text-[15px] hover:bg-teal-dark active:scale-[0.98] transition-all"
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

      {/* Bottom decorative bar */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-center gap-6 text-warm-gray-light text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            습관 추적
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            친구 공유
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            서클 챌린지
          </span>
        </div>
      </div>
    </div>
  );
}
