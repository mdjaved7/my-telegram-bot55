import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      name: 'Dr. Gregory Vance',
      role: 'VP of Platform Engineering',
      company: 'OmniCloud Labs',
      rating: 5,
      date: 'September 2026',
      content: 'The Cloud Infrastructure Blueprint cut our multi-region failover setup from 8 weeks of manual Terraform wrangling down to 48 hours of clean parameterization. The automated edge policies alone saved us thousands in latency audits.',
      outcome: 'Reduced cluster deployment cycle by 75% in first quarter',
    },
    {
      id: 'rev-2',
      name: 'Mei-Ling Zhou',
      role: 'Chief Design Officer',
      company: 'Aura Spatial Systems',
      rating: 5,
      date: 'October 2026',
      content: 'Our multi-disciplinary team was struggling with cross-platform design token drifting. ApexCommerce’s design system token pack provided immediate sync between Figma variable collections and Tailwind v4 definitions with zero handoff glitches.',
      outcome: 'Standardized design tokens across 14 enterprise micro-frontends',
    },
    {
      id: 'rev-3',
      name: 'Christian Lindqvist',
      role: 'Head of Infrastructure Security',
      company: 'Nordic FinCorp',
      rating: 5,
      date: 'August 2026',
      content: 'We contracted the Strategic Architecture Advisory Sprint ahead of our Series B due diligence. The thoroughness of the SOC2 vulnerability matrix and remediation recommendations gave our board complete confidence.',
      outcome: 'Passed SOC2 Type II audit with zero critical findings',
    },
  ];

  return (
    <section className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 font-mono">
            VERIFIED INDUSTRY OUTCOMES
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ textWrap: 'balance' }}>
            Trusted by Engineering & Design Leaders
          </h2>
          <p className="text-sm text-slate-600">
            Real deployments, concrete before/after milestones, and measurable outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{rev.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded">
                  Outcome: {rev.outcome}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {rev.role} · {rev.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
