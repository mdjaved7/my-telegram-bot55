import React, { useState } from 'react';
import { CartItem, Currency, Order } from '../types';
import { StorageService } from '../services/storage';
import { X, CheckCircle2, ShieldCheck, CreditCard, Building2, Lock, ArrowRight, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  promoCode: string;
  discountAmount: number;
  onOrderSuccess: (order: Order) => void;
  onNavigateToTracker: (orderId: string) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  currency,
  promoCode,
  discountAmount,
  onOrderSuccess,
  onNavigateToTracker,
}) => {
  const [formData, setFormData] = useState({
    name: 'Alexandra Miller',
    email: 'a.miller@veritas-cloud.io',
    phone: '+1 (415) 672-8819',
    company: 'Veritas Cloud Systems',
    address: '742 Evergreen Terrace, Tech District, SF, CA 94107',
    paymentMethod: 'credit_card',
    cardNumber: '4242 •••• •••• 9102',
    cardExp: '08/28',
    cardCvc: '842',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const taxableSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const tax = taxableSubtotal * 0.08;
  const total = taxableSubtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate instant secure transaction verification
    setTimeout(() => {
      const order = StorageService.createOrder({
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        items,
        subtotal: rawSubtotal,
        discount: discountAmount,
        promoCode: promoCode || undefined,
        tax,
        total,
        currency,
        paymentMethod:
          formData.paymentMethod === 'credit_card'
            ? `Credit Card (${formData.cardNumber})`
            : formData.paymentMethod === 'wire'
            ? 'Corporate Wire Transfer (ACH/SEPA)'
            : 'Enterprise Invoice NET-30',
        status: 'Processing',
      });

      setPlacedOrder(order);
      setIsSubmitting(false);
      onOrderSuccess(order);
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {placedOrder ? 'Order Confirmation' : 'Enterprise Secure Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close checkout modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {placedOrder ? (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Payment Authorized & Order Received!</h3>
              <p className="text-xs text-slate-500">
                Your receipt and deployment credentials have been issued to <strong>{placedOrder.email}</strong>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="rounded-xl border border-slate-200 p-5 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
                <div>
                  <span className="text-slate-500">Order ID: </span>
                  <strong className="font-mono text-slate-900">{placedOrder.id}</strong>
                </div>
                <div className="text-slate-500">
                  {new Date(placedOrder.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Items in receipt */}
              <div className="space-y-2">
                {placedOrder.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-xs">
                    <span className="text-slate-700">
                      {item.product.title} <span className="text-slate-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {StorageService.formatPrice(item.product.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary line */}
              <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                {placedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({placedOrder.promoCode})</span>
                    <span className="tabular-nums">-{StorageService.formatPrice(placedOrder.discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Sales Tax (8%)</span>
                  <span className="tabular-nums">{StorageService.formatPrice(placedOrder.tax, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>Total Paid</span>
                  <span className="tabular-nums">{StorageService.formatPrice(placedOrder.total, currency)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTracker(placedOrder.id);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Track Order Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {/* Customer Details Form */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Customer & Delivery Contact
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Billing & Delivery Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Payment Selection
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    formData.paymentMethod === 'credit_card'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-2" />
                  <span className="text-xs font-semibold">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'wire' })}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    formData.paymentMethod === 'wire'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-2" />
                  <span className="text-xs font-semibold">Wire Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'invoice' })}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    formData.paymentMethod === 'invoice'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-2" />
                  <span className="text-xs font-semibold">NET-30 Invoice</span>
                </button>
              </div>

              {formData.paymentMethod === 'credit_card' && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Card Number</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Expires</label>
                    <input
                      type="text"
                      value={formData.cardExp}
                      onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total and Submit */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total Authorized Amount</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  {StorageService.formatPrice(total, currency)}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Pay Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
