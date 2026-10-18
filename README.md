# THE AFTAB — Premium Cafe Website & Smart Order Management System

> *"Every Sip, A Little Sunshine."*  
> **Freshly Brewed. Beautifully Served.**

---

## 1. Executive Product Overview

**THE AFTAB** is a full-stack, production-grade web application and live smart order management system engineered for a premium contemporary tea house and artisanal coffee roastery.

Unlike static landing pages or UI mockups, this platform is a **fully functional commercial solution** integrating:
- A responsive customer storefront with custom beverage configurations (Sizes, Milk choices, Sugar levels, Espresso shots, Add-ons).
- Interactive **Dine-In table selection** and **Takeaway** ordering.
- A live **Admin Operations Portal (`/admin`)** powered by **Socket.IO WebSockets** with automated sound chime alerts on incoming orders.
- A 6-stage order preparation pipeline:  
  `Order Received` ➔ `Order Accepted` ➔ `Brewing & Preparing` ➔ `Ready to Serve` ➔ `Delivered to Table` ➔ `Completed` (or `Cancelled`).
- Table-wise running bill consolidation and instant table settlement.
- A **Website Personalization Studio** allowing the cafe owner to update the brand headline, hero images, announcement ribbons, tax rates (GST), and contact details without editing code.
- Role-Based Access Control (**RBAC**) supporting Super Admin / Owner, Manager, Head Barista, and Service Staff.
- Financial reports (Gross Sales, Discounts, GST Taxes, Net Revenue, Payment Method breakdown, Category breakdown, Table-wise sales) with **RFC 4180 CSV export**.
- Raw ingredient inventory tracking with low-stock warnings and adjustment audit trails.

---

## 2. Technology Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8, React Router DOM 7 |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Backend Framework** | Node.js (v24), Express 5, TypeScript (`tsx`) |
| **Database & ORM** | SQLite / PostgreSQL compatible schema via **Prisma ORM 6.4** |
| **Real-time Protocol** | **Socket.IO** (bi-directional WebSockets with polling fallback) |
| **Audio Synthesis** | Browser Web Audio API dual-tone chime (no external MP3 dependencies) |
| **Security & Auth** | JSON Web Tokens (JWT), BCrypt password hashing, RBAC middleware |
| **Data Validation** | Zod, Strict Server-Side Financial & Price Integrity Verification |

---

## 3. Seed Menu & Indian Rupee Pricing

All initial products required by the specification are pre-seeded in the database:

| # | Item Name | Category | Base Price (INR) | Key Customizations |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Black Tea** | Tea | **₹30** | Sugar level, Regular/Large cup, Honey, Lemon |
| 2 | **Milk Tea** | Tea | **₹50** | Sugar level, Fresh dairy / Oat milk / Almond milk, Kulhad clay cup |
| 3 | **Ginger Tea** | Tea | **₹55** | Sugar level, Ginger intensity punch, Milk choice |
| 4 | **Masala Tea** | Tea | **₹60** | Sugar level, Spiced cardamom/clove blend, Cup size |
| 5 | **Green Tea** | Tea | **₹60** | Himalayan pure leaf, Lemon & honey, Jasmine mint |
| 6 | **Cappuccino** | Coffee | **₹100** | Small/Regular/Large, Extra shots, Oat milk, Vanilla, Cinnamon |
| 7 | **Signature Cold Brew** | Cold Coffee | **₹130** | Straight black, Vanilla sweet cream, Salted caramel cold foam |
| 8 | **Iced Caramel Macchiato** | Cold Coffee | **₹140** | Regular/Large, Full cream / Oat milk |
| 9 | **Wild Berry Hibiscus Cooler** | Iced Beverages | **₹110** | Balanced, Extra tart |
| 10 | **Aftab Royal Saffron Kahwa** | Special Drinks | **₹120** | Kashmiri Mogra saffron, green cardamom, honey |
| 11 | **Artisan Paneer Tikka Croissant** | Snacks | **₹140** | Warm toasted, crispy grilled, garlic mayo dip |
| 12 | **Belgium Dark Chocolate Pastry** | Desserts | **₹130** | 70% dark ganache, warm molten center, vanilla scoop |
| 13 | **Chai & Gourmet Samosa Combo** | Combos | **₹120** *(Orig ₹140)* | Masala/Ginger tea selection, artisanal samosas |

*Note: All prices, descriptions, availability toggles, and images can be updated in real time via the Admin Panel.*

---

## 4. Default Staff & Administrator Accounts

For evaluation and testing, the following role-based accounts are pre-seeded:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin (Owner)** | `admin@theaftab.com` | `admin123` | Universal access to all modules, website studio, staff roster, audit logs |
| **💼 Manager** | `manager@theaftab.com` | `manager123` | Menu CRUD, tables, sales reports, inventory, coupons, reviews moderation |
| **☕ Head Barista** | `barista@theaftab.com` | `barista123` | Kitchen prep board, order status (`Accepted`, `Preparing`, `Ready`), ingredient stock adjustments |
| **🍽️ Service Staff** | `staff@theaftab.com` | `staff123` | Table delivery, mark orders `Served` and `Completed`, floor table inspection |

*Quick login buttons are available directly on `/admin/login` for rapid testing.*

---

## 5. Getting Started & Local Reproduction

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v10+` or `v11+`

### Installation Steps

1. **Clone or enter project directory:**
   ```bash
   cd coffeeshop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm --prefix client install
   ```

3. **Initialize database & seed data:**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run seed
   ```

4. **Build the production client:**
   ```bash
   npm run build
   ```

5. **Start the application:**
   ```bash
   npm start
   ```
   The complete application (Frontend SPA + Backend API + WebSockets) will be live at:
   - **Customer Website:** `http://localhost:5000/`
   - **Order Tracking:** `http://localhost:5000/track`
   - **Staff & Admin Dashboard:** `http://localhost:5000/admin`

6. **Development Mode (Concurrent hot reload):**
   ```bash
   npm run dev
   ```
   - Vite Dev Server: `http://localhost:5173/` (proxies `/api` and `/socket.io` to `:5000`)
   - Backend Watcher: `http://localhost:5000/`

---

## 6. Running Automated Acceptance Tests

The test suite validates all 17 criteria required by Section 11 of the specification:
```bash
npm test
```

### Verified Test Workflows:
- [x] Initial menu items verification (Ginger Tea ₹55, Cappuccino ₹100, Black Tea ₹30, Milk Tea ₹50, Masala Tea ₹60, Green Tea ₹60).
- [x] Correct spelling of "Cappuccino".
- [x] Cart subtotal verification (Ginger Tea ₹55 + Cappuccino ₹100 = ₹155).
- [x] Table selection and Dine-in order submission.
- [x] Server-side price integrity (ignores client-manipulated prices).
- [x] Admin authentication & JWT token protection.
- [x] Live Order Board status pipeline (`ORDER_RECEIVED` ➔ `ORDER_ACCEPTED` ➔ `PREPARING` ➔ `READY_TO_SERVE` ➔ `SERVED` ➔ `COMPLETED`).
- [x] Customer live tracking sync via WebSockets.
- [x] Financial reports and GST calculation.
- [x] Dynamic menu price editing from the admin panel.
- [x] Website Personalization Studio tagline and hero update.
- [x] Edge-case rejection (empty carts, unavailable tables, expired coupons).

---

## 7. Key Features Walkthrough

### A. Contactless Dine-In Table Ordering
1. Each table has a unique QR code generated under `/admin/tables`.
2. Scanning the QR code opens the site with `?table=T1`.
3. The cart automatically assigns the selected table.
4. When the order is placed, Table 1 switches to `OCCUPIED`.
5. Multiple orders from the same table are accumulated under Table 1's running bill.
6. The cashier can settle the entire table with one click.

### B. Kitchen Order Ticket (KOT) & Receipt Printing
- From `/admin/orders`, clicking **"Receipt & KOT"** displays an 80mm thermal-friendly order ticket.
- Pressing **"Print Kitchen KOT / Receipt"** or using browser print triggers formatted ticket printing.

### C. Promotional Coupons
- Enter code `SUNSHINE10` during checkout for an instant 10% discount on orders above ₹100.
- Codes are verified on the server against expiration dates, usage limits, and minimum order requirements.

---

## 8. Environment Variables (`.env`)

```ini
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="the_aftab_super_secret_jwt_key_2026_cafe_management"
CLIENT_ORIGIN="http://localhost:5173"
NODE_ENV="production"
```

---

## 9. Production Deployment Checklist

1. **Database:** The default uses SQLite for local zero-dependency operation. For managed cloud deployments (e.g. AWS RDS, Neon, Supabase), change `provider = "postgresql"` in `prisma/schema.prisma` and supply `DATABASE_URL="postgresql://user:pass@host:5432/dbname"`.
2. **Secrets:** Replace `JWT_SECRET` with a cryptographically secure 64-character random string.
3. **SSL / Reverse Proxy:** Use Nginx or Caddy to terminate SSL (`https://theaftabcafe.com`) and reverse-proxy to Node.js port 5000 with WebSocket support:
   ```nginx
   location /socket.io/ {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
   }
   ```
4. **Process Manager:** Run via PM2 (`pm2 start npm --name "the-aftab" -- start`).
