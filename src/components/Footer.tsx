import React, { useState } from 'react';
import { Lock, Download } from 'lucide-react';

interface Props {
  onOpenAdminGate: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ onOpenAdminGate, onNavigateTab }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const next = clickCount + 1;
    if (next >= 3) {
      setClickCount(0);
      onOpenAdminGate();
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 1500);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                A
              </div>
              <span className="font-bold text-slate-900 tracking-tight">ApexCommerce</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enterprise digital commerce, production architectural blueprints, and high-impact advisory services for mission-critical software.
            </p>
            <div className="pt-2">
              <a
                href="/apexcommerce-source-code.zip"
                download="apexcommerce-source-code.zip"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full Code (.zip)</span>
              </a>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Solutions & Deliverables
            </div>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cloud & Infrastructure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Design Token Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Executive Advisory Sprints
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Zero-Trust SOC2 Toolkits
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Operations */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Operations & Client Desk
            </div>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li>
                <button
                  onClick={() => onNavigateTab('tracker')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('support')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('reviews')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Verified Client Reviews
                </button>
              </li>
              <li>
                <span className="text-slate-400">SLA Response: &lt; 4 Hours</span>
              </li>
            </ul>
          </div>

          {/* Security & Access Notice */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Security & Compliance
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All digital licenses and client repositories are delivered with cryptographic signatures and automated verification workflows.
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Protected by multi-tier encryption and role-based access management.
            </div>
          </div>
        </div>

        {/* Bottom subtle bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div
            onClick={handleSecretClick}
            className="cursor-pointer select-none hover:text-slate-600 transition-colors flex items-center gap-1.5"
            title="Triple-click for administrative console"
          >
            <span>© 2026 ApexCommerce Suite. All rights reserved.</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/apexcommerce-source-code.zip"
              download="apexcommerce-source-code.zip"
              className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
            >
              <Download className="w-3 h-3 text-amber-600" />
              <span>Download .ZIP</span>
            </a>

            <span className="text-[11px] text-slate-400 hidden lg:inline">
              Hotkey: <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600">Ctrl+Shift+A</kbd>
            </span>

            {/* Subtle, discreet Staff Gateway trigger */}
            <button
              onClick={onOpenAdminGate}
              className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Restricted Staff Console"
            >
              <Lock className="w-2.5 h-2.5 opacity-60" />
              <span>Staff Gateway</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
