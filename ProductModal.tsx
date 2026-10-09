import React, { useState } from 'react';
import { Product, Currency } from '../types';
import { StorageService } from '../services/storage';
import { X, Check, Star, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  product: Product | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<Props> = ({
  product,
  currency,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const formattedPrice = StorageService.formatPrice(product.price * quantity, currency);
  const singlePrice = StorageService.formatPrice(product.price, currency);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Media Column */}
          <div className="relative aspect-[4/3] md:aspect-auto bg-slate-100 h-full min-h-[300px]">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-md">
                {product.badge}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-slate-800 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({product.reviewsCount} verified reviews)</span>
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Deliverables / What's Included */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                  Included Package Assets & Deliverables
                </div>
                <div className="space-y-1.5">
                  {product.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">
                    {formattedPrice}
                  </div>
                  {quantity > 1 && (
                    <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                      ({singlePrice} each)
                    </div>
                  )}
                </div>

                {/* Quantity selector */}
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock || product.stock <= 0}
                  className={`py-2.5 px-4 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    added
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-slate-700" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuy}
                  disabled={!product.inStock || product.stock <= 0}
                  className="py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:bg-slate-300"
                >
                  <span>Instant Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Instant automated license handover · 30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
