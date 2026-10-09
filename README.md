# ApexCommerce & Client Suite

A complete, production-ready Digital Commerce, Blueprint Store, and Client Management Portal with a hidden, high-security Administrative Console.

---

## 🚀 Quick Start / How to Run

### 1. Requirements
- Node.js (version 18 or higher)
- npm or pnpm or bun

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch at: **http://localhost:3000** (or your local Vite port).

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Admin Panel Access Details

The Admin Panel is **completely hidden** from standard customers and visitors.

### How to Open the Secret Admin Gate:
1. **Keyboard Shortcut**: Press `Ctrl + Shift + A` (or `Cmd + Shift + A` on macOS) anywhere on the page.
2. **URL Access**: Append `#admin` or `?admin=true` to your browser URL (e.g. `http://localhost:3000/#admin`).
3. **Subtle Footer Trigger**:
   - Triple-click the copyright dot in the footer, or
   - Click the discreet **"Staff Gateway"** link located in the footer's bottom-right corner.

### 🔑 Exact Master Admin Password:
```
8294991057
```

---

## 🛠️ Included Features

### 👤 Regular User Storefront
- **Dynamic Catalog**: Full filtering by categories (*Cloud & Infrastructure*, *Design Systems*, *Executive Advisory*, *Security & Compliance*), live search, and sorting.
- **Product Modal**: Deliverable manifests, technical specs, and quantity controls.
- **Shopping Cart & Checkout**: Slide-out cart drawer, discount coupon engine (`APEX20` for 20% off, `WELCOME10` for 10% off), VAT calculation, order checkout form, and printable receipts.
- **Live Order Tracker**: Enter any Order ID (e.g., `ORD-89241`) to view chronological fulfillment checkpoints and live delivery status.
- **Support & Ticketing Desk**: Submit inquiries with custom priority levels and look up existing ticket threads.
- **Multi-Currency Support**: Switch on-the-fly between USD ($), EUR (€), GBP (£), and INR (₹).
- **Broadcast Announcement Bar**: Dynamic top banner controlled directly from the Admin Panel.

### 🛡️ Administrative Console
- **Analytics & Revenue Dashboard**: Real-time sales, order volume, average order value, and open ticket metrics.
- **Inventory & Catalog Management (Full CRUD)**: Add new products, edit price/stock, delete items, and toggle in-stock availability.
- **Order Fulfillment Manager**: View all placed orders, inspect addresses and items, and update order statuses (*Pending*, *Processing*, *Shipped*, *Delivered*, *Cancelled*). Changes instantly reflect in the customer order tracker.
- **Support Helpdesk**: View inquiries, reply to clients, and mark tickets resolved.
- **Live Broadcast Editor**: Edit announcement text, toggle banner visibility, and change styling.
- **Security & Backup**: Audit logs of all logins and updates, JSON database backup export and restore, and factory reset option.
