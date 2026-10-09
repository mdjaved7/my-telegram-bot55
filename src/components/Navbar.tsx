import React from 'react';
import { ShoppingBag, Globe, Download } from 'lucide-react';
import { Currency } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cartCount: number;
  openCart: () => void;
  onStaffAccessClick: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  cartCount,
  openCart,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-mono text-sm font-semibold">
            A
          </div>
          <span>ApexCommerce</span>
        </button>

        {/* Zone 2: Clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'catalog' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Store Catalog
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'tracker' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Order Tracker
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'support' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Support & Inquiries
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reviews' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Client Reviews
          </button>
        </nav>

        {/* Zone 3: Currency selector, Download ZIP, & Cart Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Download Source Code ZIP Button */}
          <a
            href="/apexcommerce-source-code.zip"
            download="apexcommerce-source-code.zip"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-slate-200"
            title="Download full project source code as a ZIP file"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Download ZIP</span>
          </a>

          {/* Currency Selector */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 bg-white">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
