import React, { useState, useEffect } from 'react';
import {
  Product,
  Order,
  Ticket,
  Announcement,
  AuditLog,
  Currency,
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LifeBuoy,
  Megaphone,
  Shield,
  LogOut,
  Store,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  X,
  MessageSquare,
  Send,
} from 'lucide-react';

interface Props {
  onReturnToStore: () => void;
  onLogout: () => void;
  currency: Currency;
}

export const AdminDashboard: React.FC<Props> = ({
  onReturnToStore,
  onLogout,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'catalog' | 'orders' | 'tickets' | 'announcement' | 'security'
  >('overview');

  // Core state from storage
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement>(
    StorageService.getAnnouncement()
  );
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Session timer
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All');

  // Modals inside Admin
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrderView, setSelectedOrderView] = useState<Order | null>(null);
  const [replyingTicket, setReplyingTicket] = useState<Ticket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Add Product Form
  const [newProductForm, setNewProductForm] = useState({
    title: '',
    category: 'Cloud & Infrastructure' as Product['category'],
    price: 199,
    originalPrice: 249,
    stock: 20,
    badge: 'New',
    description: '',
    deliverables: 'Architecture Manifest\nCI/CD Configuration\nHandover Documentation',
  });

  // Announcement edit form
  const [announcementText, setAnnouncementText] = useState(announcement.text);
  const [announcementType, setAnnouncementType] = useState(announcement.type);
  const [announcementActive, setAnnouncementActive] = useState(announcement.isActive);
  const [announcementSavedToast, setAnnouncementSavedToast] = useState(false);

  // Load latest data
  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setOrders(StorageService.getOrders());
    setTickets(StorageService.getTickets());
    const ann = StorageService.getAnnouncement();
    setAnnouncement(ann);
    setAnnouncementText(ann.text);
    setAnnouncementType(ann.type);
    setAnnouncementActive(ann.isActive);
    setLogs(StorageService.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Product Actions
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.title || !newProductForm.description) return;

    StorageService.addProduct({
      title: newProductForm.title,
      category: newProductForm.category,
      price: Number(newProductForm.price),
      originalPrice: newProductForm.originalPrice ? Number(newProductForm.originalPrice) : undefined,
      stock: Number(newProductForm.stock),
      inStock: Number(newProductForm.stock) > 0,
      rating: 5.0,
      reviewsCount: 1,
      description: newProductForm.description,
      deliverables: newProductForm.deliverables.split('\n').filter((d) => d.trim().length > 0),
      image: products[0]?.image || '',
      badge: newProductForm.badge || undefined,
      featured: false,
    });

    setIsAddProductOpen(false);
    setNewProductForm({
      title: '',
      category: 'Cloud & Infrastructure',
      price: 199,
      originalPrice: 249,
      stock: 20,
      badge: 'New',
      description: '',
      deliverables: 'Architecture Manifest\nCI/CD Configuration\nHandover Documentation',
    });
    refreshData();
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    StorageService.updateProduct({
      ...editingProduct,
      inStock: editingProduct.stock > 0,
    });
    setEditingProduct(null);
    refreshData();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this item from the store?')) {
      StorageService.deleteProduct(id);
      refreshData();
    }
  };

  const handleToggleStock = (product: Product) => {
    const newStock = product.stock > 0 ? 0 : 15;
    StorageService.updateProduct({
      ...product,
      stock: newStock,
      inStock: newStock > 0,
    });
    refreshData();
  };

  // Order Actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    refreshData();
    if (selectedOrderView && selectedOrderView.id === orderId) {
      const updated = StorageService.getOrders().find((o) => o.id === orderId);
      if (updated) setSelectedOrderView(updated);
    }
  };

  // Ticket Actions
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicket || !ticketReplyText.trim()) return;

    StorageService.replyToTicket(replyingTicket.id, ticketReplyText.trim(), 'Resolved');
    setTicketReplyText('');
    setReplyingTicket(null);
    refreshData();
  };

  // Announcement Actions
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Announcement = {
      ...announcement,
      text: announcementText,
      type: announcementType,
      isActive: announcementActive,
    };
    StorageService.saveAnnouncement(updated);
    setAnnouncement(updated);
    setAnnouncementSavedToast(true);
    setTimeout(() => setAnnouncementSavedToast(false), 2000);
  };

  // Database Backup Actions
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexcommerce-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = StorageService.importDatabaseJSON(content);
        if (ok) {
          alert('Database successfully restored from JSON file.');
          refreshData();
        } else {
          alert('Failed to parse backup JSON. Invalid structure.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Warning: This will restore the store to factory demo state. Proceed?')) {
      StorageService.resetToDefault();
      refreshData();
    }
  };

  // Calculation KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const activeTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Filtered Lists
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === 'All' || p.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  const filteredTickets = tickets.filter((t) => {
    if (ticketStatusFilter === 'All') return true;
    return t.status === ticketStatusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Administrative Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Security Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-mono font-bold text-sm shadow-sm">
              ADM
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Apex Admin Console</span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  SECURE PASSCODE VERIFIED
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>Session: {formatSessionTime(sessionSeconds)}</span>
                <span aria-hidden="true">·</span>
                <span>Role: Root Administrator</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStore}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>View Storefront</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-800/80"
              title="Lock and terminate admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock & Exit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 border-t border-slate-800/80 py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catalog & Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Orders & Fulfillment ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Tickets ({activeTicketsCount} open)</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'announcement'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Store Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Audit & Backup</span>
          </button>
        </div>
      </header>

      {/* Main Admin Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gross Processed Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {StorageService.formatPrice(totalRevenue, currency)}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.4% vs previous 30-day window</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Placed Orders</span>
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {totalOrdersCount}
                </div>
                <div className="text-[11px] text-slate-400">
                  {orders.filter((o) => o.status === 'Delivered').length} fulfilled ·{' '}
                  {orders.filter((o) => o.status === 'Processing').length} in processing
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Average Order Value</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {StorageService.formatPrice(avgOrderValue, currency)}
                </div>
                <div className="text-[11px] text-slate-400">
                  Across all active enterprise tiers
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Active Support Queue</span>
                  <LifeBuoy className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {activeTicketsCount}
                </div>
                <div className="text-[11px] text-slate-400">
                  Average response SLA &lt; 4 hours
                </div>
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Orders Overview */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderView(order)}
                      className="p-3 bg-slate-800 rounded-lg border border-slate-700/50 flex items-center justify-between text-xs hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-mono font-semibold text-white">{order.id}</div>
                        <div className="text-slate-400 mt-0.5">{order.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-300">
                          {StorageService.formatPrice(order.total, currency)}
                        </div>
                        <div className="text-[11px] text-slate-400">{order.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System & Catalog Health */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Catalog & Operations Health</h3>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Manage Inventory
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <span>Catalog Items Registered</span>
                    <strong className="font-mono text-white">{products.length} Items</strong>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <span>Items Currently In Stock</span>
                    <strong className="font-mono text-emerald-400">
                      {products.filter((p) => p.inStock && p.stock > 0).length} Items
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <span>Store Broadcast Banner</span>
                    <strong className="font-mono text-amber-400">
                      {announcement.isActive ? 'ACTIVE & DISPLAYING' : 'OFFLINE'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <span>Master Access Key Status</span>
                    <strong className="font-mono text-slate-300">Password Enforced</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CATALOG & INVENTORY ================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header with Search and Add Product Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search product titles or tags..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                  <option value="Design & Design Systems">Design Systems</option>
                  <option value="Executive Advisory">Executive Advisory</option>
                  <option value="Security & Compliance">Security</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="p-4">Item & Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/90 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-700 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-semibold text-white line-clamp-1">
                                {prod.title}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                ID: {prod.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-300 whitespace-nowrap">
                          {prod.category}
                        </td>

                        <td className="p-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                          {StorageService.formatPrice(prod.price, currency)}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-mono">
                            <span className={prod.stock <= 5 ? 'text-amber-400' : 'text-slate-200'}>
                              {prod.stock} units
                            </span>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStock(prod)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                              prod.inStock && prod.stock > 0
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            }`}
                            title="Click to toggle in-stock status"
                          >
                            {prod.inStock && prod.stock > 0 ? 'Active / In Stock' : 'Out of Stock'}
                          </button>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS & FULFILLMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Filter by Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Status:</span>
                {['All', 'Processing', 'Delivered', 'Shipped', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      orderStatusFilter === status
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Showing {filteredOrders.length} Orders
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Items Count</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Fulfillment Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/90 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-white">{ord.id}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-200">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-400">{ord.email}</div>
                          {ord.company && (
                            <div className="text-[11px] text-amber-300">{ord.company}</div>
                          )}
                        </td>

                        <td className="p-4 text-slate-300 font-mono">
                          {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                        </td>

                        <td className="p-4 font-mono font-bold text-amber-300">
                          {StorageService.formatPrice(ord.total, currency)}
                        </td>

                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])
                            }
                            className={`text-xs px-2.5 py-1 rounded font-semibold focus:outline-none cursor-pointer ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ord.status === 'Processing'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : ord.status === 'Shipped'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedOrderView(ord)}
                            className="px-3 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer"
                          >
                            View Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUPPORT TICKETS ================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Queue:</span>
                {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      ticketStatusFilter === st
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {filteredTickets.length} Support Inquiries
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {ticket.id}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-300 font-semibold">
                          {ticket.category}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            ticket.priority === 'Urgent'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : ticket.priority === 'High'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {ticket.priority} PRIORITY
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{ticket.subject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                          ticket.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : ticket.status === 'In Progress'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {ticket.message}
                  </p>

                  {/* Previous Replies */}
                  {ticket.replies.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-amber-500/50">
                      <div className="text-[11px] font-bold text-amber-400">Recorded Replies:</div>
                      {ticket.replies.map((rep) => (
                        <div key={rep.id} className="text-xs text-slate-300 bg-slate-800/90 p-2.5 rounded">
                          <span className="text-amber-300 font-semibold">Admin: </span>
                          {rep.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400">
                      Submitted by {ticket.customerName} ({ticket.email}) on{' '}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>

                    <button
                      onClick={() => setReplyingTicket(ticket)}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply & Resolve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: ANNOUNCEMENT BROADCAST ================= */}
        {activeTab === 'announcement' && (
          <div className="max-w-2xl mx-auto bg-slate-800/60 border border-slate-700 rounded-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span>Store Broadcast & Top Banner Manager</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure the dynamic announcement banner shown at the very top of the customer storefront.
              </p>
            </div>

            {announcementSavedToast && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Announcement updated! Visible immediately on the storefront.</span>
              </div>
            )}

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Banner Text Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Banner Visual Theme
                  </label>
                  <select
                    value={announcementType}
                    onChange={(e) =>
                      setAnnouncementType(e.target.value as Announcement['type'])
                    }
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="sale">Promotion / Flash Sale (Amber highlight)</option>
                    <option value="info">System Info / Notice (Slate neutral)</option>
                    <option value="alert">Critical Update / Alert (Crimson notice)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Display Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setAnnouncementActive(!announcementActive)}
                    className={`w-full p-2.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      announcementActive
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {announcementActive ? 'ACTIVE (DISPLAYED ON STORE)' : 'MUTED / HIDDEN'}
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-semibold uppercase text-slate-400">
                  Live Preview:
                </div>
                <div
                  className={`p-3 rounded-lg text-xs font-medium text-center ${
                    announcementType === 'sale'
                      ? 'bg-amber-500 text-slate-950'
                      : announcementType === 'alert'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-white'
                  }`}
                >
                  {announcementText || 'Banner text will appear here...'}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Save & Publish Announcement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 6: SECURITY & LOGS ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Backup & System Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Export Database JSON</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Download a full JSON snapshot of all products, customer orders, tickets, and logs.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="w-full py-2 px-3 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Restore from JSON</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Upload and restore catalog and database state from a previous exported backup.
                </p>
                <label className="w-full py-2 px-3 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <RefreshCw className="w-4 h-4 text-rose-400" />
                  <span>Reset Factory Data</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Reset the catalog, default sample orders, and tickets back to the original clean state.
                </p>
                <button
                  onClick={handleResetData}
                  className="w-full py-2 px-3 text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded-lg border border-rose-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Factory Reset</span>
                </button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Security & Compliance Audit Log</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Records every login event, status update, inventory edit, and security trigger.
                  </p>
                </div>
                <button
                  onClick={() => {
                    StorageService.clearAuditLogs();
                    refreshData();
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-700 sticky top-0">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Event Action</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">IP / Host</th>
                      <th className="p-3">Event Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800">
                        <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3 text-amber-400 font-bold whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-300'
                                : log.status === 'FAILED'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 whitespace-nowrap">{log.ipAddress}</td>
                        <td className="p-3 text-slate-200">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD PRODUCT ================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create New Catalog Product</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed In-Memory Cache Cluster"
                  value={newProductForm.title}
                  onChange={(e) =>
                    setNewProductForm({ ...newProductForm, title: e.target.value })
                  }
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        category: e.target.value as Product['category'],
                      })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white cursor-pointer"
                  >
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Design & Design Systems">Design Systems</option>
                    <option value="Executive Advisory">Executive Advisory</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, New Release"
                    value={newProductForm.badge}
                    onChange={(e) =>
                      setNewProductForm({ ...newProductForm, badge: e.target.value })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProductForm.price}
                    onChange={(e) =>
                      setNewProductForm({ ...newProductForm, price: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={newProductForm.originalPrice}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        originalPrice: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProductForm.stock}
                    onChange={(e) =>
                      setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Overview of the product features..."
                  value={newProductForm.description}
                  onChange={(e) =>
                    setNewProductForm({ ...newProductForm, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Deliverables (1 line per item)
                </label>
                <textarea
                  rows={3}
                  value={newProductForm.deliverables}
                  onChange={(e) =>
                    setNewProductForm({ ...newProductForm, deliverables: e.target.value })
                  }
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PRODUCT ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Product: {editingProduct.title}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, title: e.target.value })
                  }
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded cursor-pointer"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER VIEW ================= */}
      {selectedOrderView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-amber-400">
                  {selectedOrderView.id}
                </h3>
                <div className="text-[11px] text-slate-400">
                  Placed on {new Date(selectedOrderView.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderView(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-800 p-3 rounded-lg space-y-1">
                <div className="font-bold text-white">{selectedOrderView.customerName}</div>
                {selectedOrderView.company && <div>{selectedOrderView.company}</div>}
                <div className="text-slate-400">{selectedOrderView.email} · {selectedOrderView.phone}</div>
                <div className="text-slate-400">{selectedOrderView.address}</div>
              </div>

              <div className="space-y-1 border border-slate-800 rounded-lg p-3">
                <div className="font-semibold text-slate-300">Ordered Deliverables:</div>
                {selectedOrderView.items.map((it) => (
                  <div key={it.product.id} className="flex justify-between py-1 border-b border-slate-800 last:border-0">
                    <span>{it.product.title} × {it.quantity}</span>
                    <span className="font-mono text-amber-300">
                      {StorageService.formatPrice(it.product.price * it.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-white text-sm pt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-amber-300">
                  {StorageService.formatPrice(selectedOrderView.total, currency)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Update Status:</label>
                <select
                  value={selectedOrderView.status}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrderView.id, e.target.value as Order['status'])
                  }
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-semibold cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderView(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded cursor-pointer text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REPLY TO TICKET ================= */}
      {replyingTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Reply to Ticket {replyingTicket.id}
                </h3>
                <div className="text-[11px] text-slate-400">
                  To: {replyingTicket.customerName} ({replyingTicket.email})
                </div>
              </div>
              <button
                onClick={() => setReplyingTicket(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-300">
              <div className="font-semibold text-amber-300 mb-1">Client Subject: {replyingTicket.subject}</div>
              <p className="line-clamp-3 italic">"{replyingTicket.message}"</p>
            </div>

            <form onSubmit={handleSendTicketReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Official Technical Response
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your official administrative solution or deployment instructions here..."
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingTicket(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response & Mark Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
