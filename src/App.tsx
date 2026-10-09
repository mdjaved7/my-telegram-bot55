/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Announcement, Currency } from './types';
import { StorageService } from './services/storage';

// Storefront Components
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { SupportCenter } from './components/SupportCenter';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';

// Admin Components
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

import { Search, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'catalog' | 'tracker' | 'support' | 'reviews'>('catalog');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Store data states
  const [products, setProducts] = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement>(StorageService.getAnnouncement());
  const [currency, setCurrency] = useState<Currency>(StorageService.getCurrency());

  // Catalog filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Shopping Cart & Modals
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Tracker state
  const [targetTrackingOrderId, setTargetTrackingOrderId] = useState<string | undefined>(undefined);

  // Load dynamic data on mount
  const refreshAppData = () => {
    setProducts(StorageService.getProducts());
    setAnnouncement(StorageService.getAnnouncement());
  };

  useEffect(() => {
    refreshAppData();

    // Check if URL contains #admin
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      if (StorageService.isAdminAuthenticated()) {
        setIsAdminView(true);
      } else {
        setIsAdminLoginOpen(true);
      }
    }

    // Global Key Listener: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (StorageService.isAdminAuthenticated()) {
          setIsAdminView(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    StorageService.setCurrency(c);
  };

  // Cart Management
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckout = (promo: string, discount: number) => {
    setAppliedPromo(promo);
    setDiscountAmount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    refreshAppData();
  };

  const handleNavigateToTracker = (orderId: string) => {
    setTargetTrackingOrderId(orderId);
    setActiveTab('tracker');
  };

  // Admin Gate Handlers
  const handleAdminAuthenticated = () => {
    setIsAdminLoginOpen(false);
    setIsAdminView(true);
    refreshAppData();
  };

  const handleAdminLogout = () => {
    StorageService.setAdminAuthenticated(false);
    setIsAdminView(false);
    refreshAppData();
  };

  // Filtered & Sorted Catalog Products
  const categories = [
    'All',
    'Cloud & Infrastructure',
    'Design & Design Systems',
    'Executive Advisory',
    'Security & Compliance',
  ];

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // If Admin View is active, display the full secure Admin Console
  if (isAdminView) {
    return (
      <AdminDashboard
        currency={currency}
        onReturnToStore={() => {
          setIsAdminView(false);
          refreshAppData();
        }}
        onLogout={handleAdminLogout}
      />
    );
  }

  // Regular User Portal
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      {/* Top Announcement Banner (Dynamic from Admin) */}
      <AnnouncementBar
        announcement={announcement}
        onNavigateCatalog={() => setActiveTab('catalog')}
      />

      {/* Main Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        currency={currency}
        setCurrency={handleCurrencyChange}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        onStaffAccessClick={() => setIsAdminLoginOpen(true)}
      />

      {/* Viewport Content based on active tab */}
      <div className="flex-1">
        {activeTab === 'catalog' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              onExplore={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onTrackOrder={() => setActiveTab('tracker')}
            />

            {/* Catalog Grid Section */}
            <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              {/* Filter Controls & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                {/* Category Filter segmented tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search deliverables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-44 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-xs text-slate-700">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="featured">Featured First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your category filter or search query to find available blueprints and advisory services.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      currency={currency}
                      onQuickView={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Testimonials */}
            <ReviewsSection />
          </div>
        )}

        {/* View: Order Tracker */}
        {activeTab === 'tracker' && (
          <OrderTracker
            initialOrderId={targetTrackingOrderId}
            currency={currency}
          />
        )}

        {/* View: Support & Inquiries */}
        {activeTab === 'support' && <SupportCenter />}

        {/* View: Client Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-6">
            <ReviewsSection />
          </div>
        )}
      </div>

      {/* Global Footer */}
      <Footer
        onOpenAdminGate={() => setIsAdminLoginOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        promoCode={appliedPromo}
        discountAmount={discountAmount}
        onOrderSuccess={handleOrderSuccess}
        onNavigateToTracker={handleNavigateToTracker}
      />

      {/* Hidden Admin Security Gate Modal (Protected by password 8294991057) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
      />
    </div>
  );
}
