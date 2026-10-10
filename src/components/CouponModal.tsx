import React from 'react';
import { X, Tag, Check } from 'lucide-react';
import { COUPONS, CouponItem } from '../data/stories';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedCoupon: CouponItem | null;
  onApplyCoupon: (coupon: CouponItem) => void;
  lang: 'hi' | 'en';
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  appliedCoupon,
  onApplyCoupon,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-rose-500" />
            <h3 className="text-base font-bold text-white">
              {lang === 'hi' ? 'कूपन और ऑफ़र' : 'Coupons & Special Offers'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close coupons"
            className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {COUPONS.map((coupon) => {
            const isApplied = appliedCoupon?.code === coupon.code;
            return (
              <div
                key={coupon.code}
                className={`p-4 rounded-2xl border transition-colors ${
                  isApplied
                    ? 'bg-emerald-950/25 border-emerald-500/50'
                    : 'bg-zinc-900/80 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyCoupon(coupon);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-zinc-200 text-black'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'लागू किया गया' : 'Applied'}</span>
                      </>
                    ) : (
                      <span>{lang === 'hi' ? 'लागू करें' : 'Apply'}</span>
                    )}
                  </button>
                </div>
                <div className="text-sm font-semibold text-white">
                  {lang === 'hi' ? coupon.titleHi : coupon.titleEn}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {lang === 'hi' ? coupon.descHi : coupon.descEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
