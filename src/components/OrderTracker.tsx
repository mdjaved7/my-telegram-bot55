import React, { useState, useEffect } from 'react';
import { Order, Currency } from '../types';
import { StorageService } from '../services/storage';
import { Search, CheckCircle2, Clock, Package, AlertCircle } from 'lucide-react';

interface Props {
  initialOrderId?: string;
  currency: Currency;
}

export const OrderTracker: React.FC<Props> = ({ initialOrderId, currency }) => {
  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reloadOrders = () => {
    const orders = StorageService.getOrders();
    setAllOrders(orders);
    if (searchId.trim()) {
      const found = orders.find(
        (o) => o.id.toLowerCase() === searchId.trim().toLowerCase()
      );
      if (found) {
        setSelectedOrder(found);
        setErrorMsg(null);
      }
    } else if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  };

  useEffect(() => {
    reloadOrders();
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const orders = StorageService.getOrders();
    const found = orders.find(
      (o) => o.id.toLowerCase() === searchId.trim().toLowerCase()
    );

    if (found) {
      setSelectedOrder(found);
      setErrorMsg(null);
    } else {
      setSelectedOrder(null);
      setErrorMsg(`No order found with ID "${searchId}". Please check the ID and try again.`);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered & Handed Over</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3.5 h-3.5" />
            <span>Dispatched / Active Delivery</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing / In Fulfillment</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            <span>Pending Verification</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900">
          Order & License Fulfillment Tracker
        </h2>
        <p className="text-xs text-slate-600">
          Track the live provisioning status, license keys, and deployment handover for your organization's purchase.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ORD-89241)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Track Order
          </button>
        </form>

        {/* Quick select recent orders */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
          <span>Quick Lookup:</span>
          {allOrders.slice(0, 4).map((ord) => (
            <button
              key={ord.id}
              onClick={() => {
                setSearchId(ord.id);
                setSelectedOrder(ord);
                setErrorMsg(null);
              }}
              className="font-mono text-[11px] underline text-slate-700 hover:text-slate-950 cursor-pointer"
            >
              {ord.id}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center max-w-md mx-auto">
          {errorMsg}
        </div>
      )}

      {/* Selected Order Detail Display */}
      {selectedOrder && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-6">
          {/* Top Banner */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Order Reference</div>
              <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {selectedOrder.id}
              </h3>
              <div className="text-xs text-slate-500 mt-1">
                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div>{getStatusBadge(selectedOrder.status)}</div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Timeline Column */}
            <div className="md:col-span-7 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Fulfillment & Handover Milestones
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedOrder.trackingEvents.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        evt.completed
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {evt.completed && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {evt.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {evt.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder.adminNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 space-y-1">
                  <div className="font-semibold text-amber-950">Operations Note:</div>
                  <div>{selectedOrder.adminNotes}</div>
                </div>
              )}
            </div>

            {/* Order Items & Customer Column */}
            <div className="md:col-span-5 space-y-6 border-t md:border-t-0 md:border-l border-slate-200 md:pl-8 pt-6 md:pt-0">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Customer & Destination
                </h4>
                <div className="text-xs space-y-1 text-slate-600">
                  <div className="font-semibold text-slate-900">{selectedOrder.customerName}</div>
                  {selectedOrder.company && <div>{selectedOrder.company}</div>}
                  <div>{selectedOrder.email}</div>
                  <div>{selectedOrder.phone}</div>
                  <div className="text-slate-500 pt-1">{selectedOrder.address}</div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Purchased Deliverables
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100"
                    >
                      <div className="pr-2">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {item.product.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Qty: {item.quantity} · {item.product.category}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 tabular-nums shrink-0">
                        {StorageService.formatPrice(item.product.price * item.quantity, currency)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Payment Method</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="tabular-nums">
                      {StorageService.formatPrice(selectedOrder.total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
