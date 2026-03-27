'use client';

import { use } from 'react';
import Link from 'next/link';
import { INSIGHTS, INSIGHT_CATEGORIES } from '@/lib/insights';

export default function InsightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const insight = INSIGHTS.find(i => i.id === id);
  const category = insight ? INSIGHT_CATEGORIES.find(c => c.id === insight.category) : null;

  // Related insights from same category (excluding current)
  const related = insight
    ? INSIGHTS.filter(i => i.category === insight.category && i.id !== insight.id).slice(0, 2)
    : [];

  if (!insight) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-warm-gray text-sm">인사이트를 찾을 수 없습니다.</p>
        <Link href="/insights" className="px-4 py-2 bg-teal text-white rounded-xl text-sm font-medium">목록으로</Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-in">
        <Link href="/insights" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors touch-feedback">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        {category && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface rounded-full border border-border-light">
            <span className="text-sm">{category.emoji}</span>
            <span className="text-[11px] text-warm-gray">{category.title}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mb-8 animate-in delay-1">
        <h1 className="text-2xl font-bold leading-tight mb-2">{insight.title}</h1>
        <p className="text-sm text-warm-gray leading-relaxed">{insight.subtitle}</p>
      </div>

      {/* Body */}
      <div className="space-y-5 mb-8 animate-in delay-2">
        {insight.body.map((paragraph, i) => (
          <p key={i} className="text-[15px] text-charcoal-light leading-[1.8]">{paragraph}</p>
        ))}
      </div>

      {/* Source */}
      {insight.source && (
        <div className="mb-8 px-4 py-3 bg-surface rounded-xl border border-border-light animate-in delay-3">
          <p className="text-[11px] text-warm-gray-light">
            📎 {insight.source}
          </p>
        </div>
      )}

      {/* Related insights */}
      {related.length > 0 && (
        <div className="mb-6 animate-in delay-4">
          <h2 className="text-sm font-medium text-warm-gray mb-3">관련 인사이트</h2>
          <div className="space-y-2">
            {related.map(r => (
              <Link key={r.id} href={`/insights/${r.id}`}
                className="flex items-center gap-3 p-3.5 bg-surface rounded-xl border border-border-light hover:border-border transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-warm-gray mt-0.5 truncate">{r.subtitle}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-gray-light shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to all */}
      <Link href="/insights"
        className="block w-full py-3 text-center text-teal text-sm font-medium rounded-xl border border-teal/20 hover:bg-teal-light/30 transition-colors animate-in delay-5">
        모든 인사이트 보기
      </Link>
    </div>
  );
}
