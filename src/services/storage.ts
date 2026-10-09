import { Product, Order, Ticket, Announcement, AuditLog, Currency } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
  INITIAL_ANNOUNCEMENT,
  INITIAL_LOGS,
  CURRENCIES,
} from './mockData';

export const ADMIN_SECRET_PASSWORD = '8294991057';

const STORAGE_KEYS = {
  PRODUCTS: 'apex_products_v1',
  ORDERS: 'apex_orders_v1',
  TICKETS: 'apex_tickets_v1',
  ANNOUNCEMENT: 'apex_announcement_v1',
  LOGS: 'apex_logs_v1',
  CURRENCY: 'apex_user_currency',
  ADMIN_SESSION: 'apex_admin_auth_active',
};

// Safe JSON get
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export const StorageService = {
  // PRODUCTS
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  saveProducts(products: Product[]): void {
    setStored(STORAGE_KEYS.PRODUCTS, products);
  },

  addProduct(newProduct: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const product: Product = {
      ...newProduct,
      id: `prod-${Date.now().toString(36)}`,
    };
    const updated = [product, ...products];
    this.saveProducts(updated);
    this.addAuditLog('PRODUCT_CREATED', `Added product: "${product.title}" ($${product.price})`, 'SUCCESS');
    return product;
  },

  updateProduct(updatedProduct: Product): void {
    const products = this.getProducts();
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    this.saveProducts(updated);
    this.addAuditLog('PRODUCT_UPDATED', `Updated product: "${updatedProduct.title}" (Stock: ${updatedProduct.stock})`, 'SUCCESS');
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts();
    const found = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    this.saveProducts(updated);
    this.addAuditLog('PRODUCT_DELETED', `Deleted product: "${found?.title || productId}"`, 'WARNING');
  },

  // ORDERS
  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  saveOrders(orders: Order[]): void {
    setStored(STORAGE_KEYS.ORDERS, orders);
  },

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'trackingEvents'>): Order {
    const orders = this.getOrders();
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowStr = new Date().toISOString();
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: nowStr,
      trackingEvents: [
        {
          title: 'Order Placed & Confirmed',
          description: 'Payment authorized and receipt emitted',
          timestamp: timeFormatted,
          completed: true,
        },
        {
          title: 'Inventory & License Allocation',
          description: 'Assigning digital asset licenses and package manifests',
          timestamp: 'In Progress',
          completed: false,
        },
        {
          title: 'Deployment & Quality Handover',
          description: 'Technical verification and client dispatch',
          timestamp: 'Scheduled',
          completed: false,
        },
      ],
    };

    const updated = [newOrder, ...orders];
    this.saveOrders(updated);

    // Also deduct stock from products
    const products = this.getProducts();
    const updatedProducts = products.map((prod) => {
      const purchased = orderData.items.find((item) => item.product.id === prod.id);
      if (purchased) {
        const remainingStock = Math.max(0, prod.stock - purchased.quantity);
        return {
          ...prod,
          stock: remainingStock,
          inStock: remainingStock > 0,
        };
      }
      return prod;
    });
    this.saveProducts(updatedProducts);

    this.addAuditLog('NEW_ORDER_PLACED', `Order ${orderId} placed by ${orderData.customerName} ($${orderData.total.toFixed(2)})`, 'SUCCESS');
    return newOrder;
  },

  updateOrderStatus(orderId: string, newStatus: Order['status'], note?: string): void {
    const orders = this.getOrders();
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const events = [...o.trackingEvents];
        // add checkpoint for status change
        events.push({
          title: `Status Updated to ${newStatus}`,
          description: note || `Administrative milestone update recorded by operations desk.`,
          timestamp: timeFormatted,
          completed: true,
        });

        return {
          ...o,
          status: newStatus,
          trackingEvents: events,
          adminNotes: note !== undefined ? note : o.adminNotes,
        };
      }
      return o;
    });

    this.saveOrders(updated);
    this.addAuditLog('ORDER_STATUS_MODIFIED', `Order ${orderId} changed to ${newStatus}`, 'SUCCESS');
  },

  // TICKETS
  getTickets(): Ticket[] {
    return getStored<Ticket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
  },

  saveTickets(tickets: Ticket[]): void {
    setStored(STORAGE_KEYS.TICKETS, tickets);
  },

  createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'replies' | 'status'>): Ticket {
    const tickets = this.getTickets();
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      ...ticketData,
      id: ticketId,
      status: 'Open',
      createdAt: new Date().toISOString(),
      replies: [],
    };
    const updated = [newTicket, ...tickets];
    this.saveTickets(updated);
    this.addAuditLog('TICKET_CREATED', `Ticket ${ticketId} created by ${ticketData.customerName}: "${ticketData.subject}"`, 'INFO');
    return newTicket;
  },

  replyToTicket(ticketId: string, replyMessage: string, newStatus?: Ticket['status']): void {
    const tickets = this.getTickets();
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus || t.status,
          replies: [
            ...t.replies,
            {
              id: `rep-${Date.now()}`,
              sender: 'Admin' as const,
              message: replyMessage,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return t;
    });
    this.saveTickets(updated);
    this.addAuditLog('TICKET_REPLIED', `Support response sent to ticket ${ticketId}`, 'SUCCESS');
  },

  // ANNOUNCEMENT
  getAnnouncement(): Announcement {
    return getStored<Announcement>(STORAGE_KEYS.ANNOUNCEMENT, INITIAL_ANNOUNCEMENT);
  },

  saveAnnouncement(announcement: Announcement): void {
    setStored(STORAGE_KEYS.ANNOUNCEMENT, announcement);
    this.addAuditLog('ANNOUNCEMENT_UPDATED', `Store announcement banner updated`, 'INFO');
  },

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  },

  addAuditLog(action: string, details: string, status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO'): void {
    const logs = this.getAuditLogs();
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      ipAddress: '192.168.1.104 (Authenticated Session)',
      timestamp: timeFormatted,
      status: status === 'INFO' ? 'SUCCESS' : status,
    };
    const updated = [newLog, ...logs].slice(0, 100); // keep 100 logs
    setStored(STORAGE_KEYS.LOGS, updated);
  },

  clearAuditLogs(): void {
    setStored(STORAGE_KEYS.LOGS, []);
  },

  // CURRENCY PREFERENCE
  getCurrency(): Currency {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency) || 'USD';
  },

  setCurrency(curr: Currency): void {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  },

  formatPrice(priceInUSD: number, currency: Currency): string {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = priceInUSD * config.rate;
    return `${config.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },

  // ADMIN AUTHENTICATION STATE
  isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  },

  setAdminAuthenticated(auth: boolean): void {
    if (auth) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
      this.addAuditLog('ADMIN_LOGIN_SUCCESS', `Master admin authentication authorized with security credentials`, 'SUCCESS');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      this.addAuditLog('ADMIN_LOGOUT', `Admin session ended and security locks restored`, 'INFO');
    }
  },

  // EXPORT / IMPORT BACKUP
  exportDatabaseJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      orders: this.getOrders(),
      tickets: this.getTickets(),
      announcement: this.getAnnouncement(),
      logs: this.getAuditLogs(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products) this.saveProducts(parsed.products);
      if (parsed.orders) this.saveOrders(parsed.orders);
      if (parsed.tickets) this.saveTickets(parsed.tickets);
      if (parsed.announcement) this.saveAnnouncement(parsed.announcement);
      this.addAuditLog('DATABASE_RESTORE', 'Full database restored from JSON backup', 'SUCCESS');
      return true;
    } catch {
      return false;
    }
  },

  resetToDefault(): void {
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveOrders(INITIAL_ORDERS);
    this.saveTickets(INITIAL_TICKETS);
    this.saveAnnouncement(INITIAL_ANNOUNCEMENT);
    setStored(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    this.addAuditLog('SYSTEM_RESET', 'Catalog, orders, and tickets reset to initial factory configuration', 'WARNING');
  },
};
