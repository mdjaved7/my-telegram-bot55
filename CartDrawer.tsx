import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { StorageService } from '../services/storage';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (appliedPromo: string, discountAmount: number) => void;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>('APEX20'); // Preloaded promo recommendation
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountRate = 0;
  if (appliedPromo === 'APEX20') discountRate = 0.2;
  else if (appliedPromo === 'WELCOME10') discountRate = 0.1;

  const discountAmount = rawSubtotal * discountRate;
  const taxableSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const tax = taxableSubtotal * 0.08;
  const total = taxableSubtotal + tax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'APEX20' || code === 'WELCOME10') {
      setAppliedPromo(code);
      setPromoError(null);
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon code. Try APEX20 or WELCOME10.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">Your Shopping Cart</h2>
            <span className="text-xs text-slate-500 tabular-nums">
              ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-slate-500 hover:text-rose-600 transition-colors cursor-pointer mr-2"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our catalog for production-ready blueprints, design tokens, and advisory services.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Browse Store Catalog
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {item.product.title}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {StorageService.formatPrice(item.product.price, currency)} each
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-300 rounded bg-white">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                        }
                        className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-semibold text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.min(item.product.stock, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Total line item */}
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {StorageService.formatPrice(
                        item.product.price * item.quantity,
                        currency
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-white space-y-4">
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon Applied: <strong>{appliedPromo}</strong> ({discountRate * 100}% off)</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-xs underline hover:text-emerald-950 cursor-pointer font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. APEX20)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full text-xs pl-8 pr-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <div className="text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-slate-800">
                  {StorageService.formatPrice(rawSubtotal, currency)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promotional Discount</span>
                  <span className="tabular-nums">
                    -{StorageService.formatPrice(discountAmount, currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated VAT / Tax (8%)</span>
                <span className="tabular-nums font-medium text-slate-800">
                  {StorageService.formatPrice(tax, currency)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due</span>
                <span className="tabular-nums">
                  {StorageService.formatPrice(total, currency)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => onProceedToCheckout(appliedPromo || '', discountAmount)}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
