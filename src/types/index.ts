export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rate: number; // multiplier relative to USD
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: 'Cloud & Infrastructure' | 'Design & Design Systems' | 'Executive Advisory' | 'Security & Compliance';
  price: number; // in USD
  originalPrice?: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  deliverables: string[];
  image: string;
  badge?: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface TrackingEvent {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  tax: number;
  total: number;
  currency: Currency;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  trackingEvents: TrackingEvent[];
  adminNotes?: string;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TicketReply {
  id: string;
  sender: 'Customer' | 'Admin';
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  message: string;
  status: TicketStatus;
  createdAt: string;
  replies: TicketReply[];
}

export interface Announcement {
  id: string;
  text: string;
  type: 'info' | 'sale' | 'alert';
  isActive: boolean;
  actionText?: string;
  actionLink?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO';
}
