import React, { useState } from 'react';
import { Product, Currency } from '../types';
import { StorageService } from '../services/storage';
import { ShoppingBag, Eye, Check, Star } from 'lucide-react';

interface Props {
  product: Product;
  currency: Currency;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  currency,
  onQuickView,
  onAddToCart,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stock <= 0) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const formattedPrice = StorageService.formatPrice(product.price, currency);
  const formattedOriginalPrice = product.originalPrice
    ? StorageService.formatPrice(product.originalPrice, currency)
    : null;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 transition-all hover:shadow-md cursor-pointer relative"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Top badge if present */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
            {product.badge}
          </div>
        )}

        {/* Quick view hover icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Quick preview"
          aria-label="Quick preview"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Metadata: Zero-pill discipline (clean text with · separator) */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewsCount})</span>
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 text-base">
            {product.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom row: Price & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums mt-0.5">
              {product.stock > 0 ? `${product.stock} available in stock` : 'Out of stock'}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock || product.stock <= 0}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              !product.inStock || product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
