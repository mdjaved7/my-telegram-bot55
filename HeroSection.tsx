import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import heroImg from '../assets/images/hero_product_hub_1791572417562.jpg';

interface Props {
  onExplore: () => void;
  onTrackOrder: () => void;
}

export const HeroSection: React.FC<Props> = ({ onExplore, onTrackOrder }) => {
  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span className="text-amber-600 font-mono">2026 RELEASE</span>
              <span aria-hidden="true">·</span>
              <span>ENTERPRISE DIGITAL COMMERCE & ADVISORY</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight" style={{ textWrap: 'balance' }}>
              Production Systems, Design Tokens & Executive Advisory.
            </h1>

            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Equip your engineering teams with battle-tested cloud modules, modular design token frameworks, and hands-on technical architecture evaluations designed for hyperscale operations.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onTrackOrder}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Track Existing Order
              </button>
            </div>

            {/* Proof Points Strip (Adjacent to claims) */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              <div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">1,400+</div>
                <div className="text-xs text-slate-500 mt-0.5">Active Deployments</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">99.98%</div>
                <div className="text-xs text-slate-500 mt-0.5">SLA Availability</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">&lt; 4 Hours</div>
                <div className="text-xs text-slate-500 mt-0.5">Average Support Response</div>
              </div>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <img
                src={heroImg}
                alt="Modern workstation with developer tools and design architecture"
                className="w-full h-72 sm:h-96 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Featured Blueprint
                </div>
                <div className="text-sm font-semibold mt-1">
                  Cloud Infrastructure & Microservice Gateway Suite
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Pre-configured with zero-latency load balancing and edge policies
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
