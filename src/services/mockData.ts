import { Product, Order, Ticket, Announcement, AuditLog, CurrencyConfig } from '../types';

// Real generated image paths
import heroImg from '../assets/images/hero_product_hub_1791572417562.jpg';
import cloudImg from '../assets/images/product_cloud_api_1791572429637.jpg';
import designTokensImg from '../assets/images/product_design_tokens_1791572442155.jpg';
import consultingImg from '../assets/images/product_consulting_suite_1791572453087.jpg';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
  INR: { code: 'INR', symbol: '₹', rate: 86.5 },
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-cloud-01',
    title: 'Cloud Infrastructure & Microservice Gateway',
    category: 'Cloud & Infrastructure',
    price: 349,
    originalPrice: 420,
    stock: 18,
    inStock: true,
    rating: 4.9,
    reviewsCount: 38,
    description: 'Fully isolated serverless cluster deployment with zero-latency load balancer, telemetry hooks, and automated horizontal scaling.',
    deliverables: [
      'Terraform / OpenTofu deployment manifests',
      'Configured multi-region failover cluster',
      'Edge CDN & rate-limiting policies',
      '30-day technical handover support'
    ],
    image: cloudImg,
    badge: 'Enterprise Choice',
    featured: true,
  },
  {
    id: 'prod-design-02',
    title: 'Architectural Design System & Token Suite',
    category: 'Design & Design Systems',
    price: 189,
    originalPrice: 240,
    stock: 45,
    inStock: true,
    rating: 4.8,
    reviewsCount: 64,
    description: 'Production-ready component library tokens, typographic matrices, semantic color systems, and cross-framework Figma-to-code synchronization.',
    deliverables: [
      'Tailwind CSS v4 & CSS variable export packs',
      'Figma auto-layout variable library',
      'WCAG AA accessible contrast primitives',
      'Interactive component documentation site'
    ],
    image: designTokensImg,
    badge: 'Popular',
    featured: true,
  },
  {
    id: 'prod-consult-03',
    title: 'Strategic Architecture Advisory Sprint',
    category: 'Executive Advisory',
    price: 750,
    originalPrice: 900,
    stock: 6,
    inStock: true,
    rating: 5.0,
    reviewsCount: 22,
    description: 'Dedicated 5-day architectural evaluation with senior systems principals: code auditing, bottleneck remediation, and enterprise scaling roadmaps.',
    deliverables: [
      'Full codebase security and resilience audit report',
      'Executive roadmap with cost optimization projections',
      'Two 90-minute live leadership strategy briefings',
      'Direct priority Slack / Matrix engineering hotline'
    ],
    image: consultingImg,
    badge: 'High Impact',
    featured: true,
  },
  {
    id: 'prod-sec-04',
    title: 'Zero-Trust SOC2 & Compliance Kit',
    category: 'Security & Compliance',
    price: 499,
    originalPrice: 599,
    stock: 14,
    inStock: true,
    rating: 4.9,
    reviewsCount: 41,
    description: 'Pre-certified security architecture package for SaaS startups aiming for SOC2 Type II, HIPAA, and ISO 27001 readiness in weeks.',
    deliverables: [
      'Automated policy compliance check suite',
      'RBAC matrix with principle-of-least-privilege',
      'Data encryption & KMS key rotation workflows',
      'Audit log retention & SIEM ingestion templates'
    ],
    image: heroImg,
    badge: 'Verified',
    featured: false,
  },
  {
    id: 'prod-cloud-05',
    title: 'High-Throughput Event Streaming Node',
    category: 'Cloud & Infrastructure',
    price: 279,
    originalPrice: 320,
    stock: 25,
    inStock: true,
    rating: 4.7,
    reviewsCount: 19,
    description: 'Low-latency distributed message broker with built-in schema registry, persistent dead-letter queuing, and partitioned throughput.',
    deliverables: [
      'Kafka / Redpanda optimized configuration files',
      'Sub-millisecond latency tuning parameters',
      'Grafana / Prometheus dashboard metrics',
      'Reliability benchmark report'
    ],
    image: cloudImg,
    featured: false,
  },
  {
    id: 'prod-design-06',
    title: 'Spatial 3D & WebGL Canvas Core',
    category: 'Design & Design Systems',
    price: 219,
    originalPrice: 280,
    stock: 30,
    inStock: true,
    rating: 4.9,
    reviewsCount: 29,
    description: 'Ultra-performant GPU-accelerated graphics foundation with physics integration, realistic physically-based rendering, and touch controls.',
    deliverables: [
      'Three.js / WebGL high-performance shaders',
      'Mobile-optimized geometry lod pipeline',
      'Interactive orbit and free-cam controller',
      'Ready-to-use production lighting presets'
    ],
    image: designTokensImg,
    badge: 'New Release',
    featured: false,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-89241',
    customerName: 'Marcus Vance',
    email: 'marcus.v@hyperion-tech.io',
    phone: '+1 (415) 883-9120',
    company: 'Hyperion Technologies',
    address: '450 Mission St, Suite 1200, San Francisco, CA 94105',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
      },
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 2,
      }
    ],
    subtotal: 727,
    discount: 0,
    tax: 58.16,
    total: 785.16,
    currency: 'USD',
    paymentMethod: 'Corporate Credit Card (Mastercard ···· 4921)',
    status: 'Processing',
    createdAt: '2026-10-08T14:32:00Z',
    trackingEvents: [
      {
        title: 'Order Verified & Security Cleared',
        description: 'Payment captured and licenses provisioned',
        timestamp: 'Oct 08, 2026 · 14:32',
        completed: true,
      },
      {
        title: 'Package Manifest Assembled',
        description: 'Generating customized repository credentials & tokens',
        timestamp: 'Oct 08, 2026 · 15:10',
        completed: true,
      },
      {
        title: 'Deployment & Verification',
        description: 'Technical verification in staging environment',
        timestamp: 'Oct 09, 2026 · 09:15',
        completed: true,
      },
      {
        title: 'Final Handover Dispatch',
        description: 'Direct delivery to customer engineering dashboard',
        timestamp: 'Pending release',
        completed: false,
      }
    ],
    adminNotes: 'VIP enterprise client. Ensure priority Slack access invite is sent with license pack.'
  },
  {
    id: 'ORD-89240',
    customerName: 'Elena Rostova',
    email: 'elena@novasystems.de',
    phone: '+49 30 901820',
    company: 'Nova Systems Berlin',
    address: 'Friedrichstraße 180, 10117 Berlin, Germany',
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
      }
    ],
    subtotal: 750,
    discount: 150,
    promoCode: 'APEX20',
    tax: 114.00,
    total: 714.00,
    currency: 'EUR',
    paymentMethod: 'SEPA Direct Bank Transfer',
    status: 'Delivered',
    createdAt: '2026-10-07T11:20:00Z',
    trackingEvents: [
      {
        title: 'Order Verified',
        description: 'Payment confirmed via SEPA',
        timestamp: 'Oct 07, 2026 · 11:20',
        completed: true,
      },
      {
        title: 'Architecture Team Assigned',
        description: 'Lead engineer booked strategy session',
        timestamp: 'Oct 07, 2026 · 13:40',
        completed: true,
      },
      {
        title: 'Deliverables Transferred',
        description: 'Full documentation and audit handover completed',
        timestamp: 'Oct 08, 2026 · 17:00',
        completed: true,
      }
    ],
    adminNotes: 'Strategy session conducted successfully with CEO & CTO.'
  },
  {
    id: 'ORD-89239',
    customerName: 'David Chen',
    email: 'd.chen@apexstudio.co',
    phone: '+1 (206) 555-0199',
    company: 'Apex Studio Seattle',
    address: '1201 3rd Ave, Seattle, WA 98101',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
      }
    ],
    subtotal: 189,
    discount: 18.9,
    promoCode: 'WELCOME10',
    tax: 15.12,
    total: 185.22,
    currency: 'USD',
    paymentMethod: 'Instant Apple Pay',
    status: 'Delivered',
    createdAt: '2026-10-06T09:12:00Z',
    trackingEvents: [
      {
        title: 'Order Placed',
        description: 'Digital asset download link generated',
        timestamp: 'Oct 06, 2026 · 09:12',
        completed: true,
      },
      {
        title: 'License Activated',
        description: 'Figma token library access granted',
        timestamp: 'Oct 06, 2026 · 09:13',
        completed: true,
      }
    ]
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-1048',
    customerName: 'Sarah Jenkins',
    email: 'sjenkins@orbitaldata.net',
    subject: 'Requesting staging cluster domain customization for Cloud Gateway',
    category: 'Technical Integration',
    priority: 'High',
    message: 'We purchased the Cloud Infrastructure package and would like to configure a custom wildcard sub-domain (*.orbitaldata.net) during cluster deployment.',
    status: 'In Progress',
    createdAt: '2026-10-09T08:14:00Z',
    replies: [
      {
        id: 'rep-1',
        sender: 'Admin',
        message: 'Hello Sarah, our engineering team has verified your SSL wildcard cert. We have uploaded the domain routing manifest to your dashboard portal.',
        timestamp: '2026-10-09T09:30:00Z'
      }
    ]
  },
  {
    id: 'TKT-1047',
    customerName: 'Kenji Sato',
    email: 'kenji@tokyodesign.jp',
    subject: 'Question on Figma auto-layout variable sync',
    category: 'Design Systems',
    priority: 'Medium',
    message: 'Does the token suite support bidirectional token updates when modifying color primitives directly in Figma variables?',
    status: 'Resolved',
    createdAt: '2026-10-08T16:22:00Z',
    replies: [
      {
        id: 'rep-2',
        sender: 'Admin',
        message: 'Hi Kenji! Yes, using the included GitHub Actions sync workflow, any published Figma library changes emit a Webhook that automatically regenerates Tailwind v4 definitions.',
        timestamp: '2026-10-08T17:05:00Z'
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENT: Announcement = {
  id: 'ann-01',
  text: '🚀 Autumn Engineering Release: Use code APEX20 for 20% off all architectural licenses and advisory sprints.',
  type: 'sale',
  isActive: true,
  actionText: 'Browse Releases',
  actionLink: '#catalog',
};

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    action: 'ADMIN_SESSION_START',
    details: 'System initial session active. Master security profile operational.',
    ipAddress: '192.168.1.1 (Internal Gateway)',
    timestamp: '2026-10-09 · 11:45:10',
    status: 'SUCCESS'
  },
  {
    id: 'log-102',
    action: 'CATALOG_SYNC',
    details: 'Synced 6 master products and inventory state.',
    ipAddress: '127.0.0.1 (Local Daemon)',
    timestamp: '2026-10-09 · 11:45:12',
    status: 'INFO'
  }
];
