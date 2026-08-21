# 🏋️ H&S Gym Backend API

> **Node.js, Express.js (ES Modules), Prisma ORM & PostgreSQL Authentication and User Management Service**

---

## 📌 Overview

The H&S Gym Backend provides RESTful APIs for user authentication, session security, profile management, catalog drop management, product operations, and administrator dashboard features. It is designed to work seamlessly with frontend web applications (such as React / Vite SPAs) as well as mobile clients.

---

## 🛠️ Summary of Recent Changes & Rationale

> [!NOTE]
> Below is a comprehensive breakdown of all updates made to the backend codebase and **why** each change was made.

### 1. **Catalog & Drop Management Endpoints (`drop.controller.js` & `product.controller.js`)**

- **What Changed**: Added full CRUD REST API endpoints for catalog drops (`/api/drops`, `/api/catalogue/drops`), product creation/editing/deletion (`/api/products`, `/api/catalogue/products`), and real-time catalog summary statistics (`/api/drops/summary`).
- **Why**: Connected the frontend Admin Catalog interface (`gym-outfit-website-master`) directly to real database persistence, enabling live drop creation, status toggling, product addition, editing, and deletion.

---

### 2. **Direct Database Storage for Product Images (`server.js` & `utils/imageHelper.js`)**

- **What Changed**:
  - Configured `express.json({ limit: '50mb' })` and `express.urlencoded({ limit: '50mb', extended: true })` in `server.js`.
  - Updated [`src/utils/imageHelper.js`](file:///c:/Users/prasanna%20kumar/Desktop/Evores_WorkSpace/H-S/Backend/src/utils/imageHelper.js) to store image base64 Data URIs (`data:image/...;base64,...`) directly inside PostgreSQL database columns (`coverPhoto`, `images`, and `colors` JSONB column) rather than saving static files to `./uploads/`.
- **Why**: Storing image data directly inside database columns keeps all product metadata and high-res photos self-contained within Supabase PostgreSQL.

---

### 3. **Supabase Direct Connection & JSONB Column Alignment (`.env` & `schema.prisma`)**

- **What Changed**:
  - Updated `DATABASE_URL` in `.env` to connect directly to Supabase direct PostgreSQL port `5432` (`db.edszptikpdazholbpscs.supabase.co:5432`) instead of the PgBouncer pooler (`6543`).
  - Converted `sizes` and `colors` columns in Supabase PostgreSQL table `Product` to `JSONB` format matching Prisma's `Json?` schema definition.
- **Why**: PgBouncer transaction pooler mode truncates query parameter messages on large JSON payloads (`PostgresError 08P01`). Connecting directly via port 5432 allows full-length queries. Converting `sizes` and `colors` to `JSONB` allows rich nested color objects (with manufacture prices, user prices, print specifications, and multiple photo URLs).

---

### 4. **Interactive Drop Status Toggle & Summary Metrics Calculation (`drop.controller.js`)**

- **What Changed**:
  - Added `PATCH /api/drops/:id/status` controller endpoint to update drop status (`Draft` / `Live` / `Archived`) and toggle `isActive` (`status === 'Live'`).
  - Updated `getCatalogSummary` so products inside `Draft` (or `Archived`) drops are counted as **Draft Products** instead of Live Products.
- **Why**: Products inside a draft drop are not published or live on the storefront until the parent drop itself is set to `Live`. Toggling a drop to `Live` automatically updates dashboard summary metrics cards in real-time.

---

### 5. **Authentication Token Support (`auth.middleware.js` & `auth.controller.js`)**

- **What Changed**:
  - Updated `protectRoute` middleware to extract JWT tokens from either `req.cookies.jwt` or `req.headers.authorization` (`Bearer <token>`).
  - Updated `login` and `register` controllers to return `{ success, message, user, token }` in JSON payloads.
- **Why**: Frontend SPAs store tokens in `localStorage` and send `Authorization: Bearer <token>` HTTP headers. Returning `token` in the response payload ensures frontend clients can authenticate immediately.

---

### 6. **Environment-Driven CORS Configuration (`server.js` & `.env`)**

- **What Changed**: Configured CORS origins to be read dynamically from `process.env.CLIENT_URL` with automatic local dev port fallbacks (`5173`, `5174`, `5175`, `3000`).
- **Why**: Allows seamless local development and easy deployment to production platforms (Render, Vercel, Netlify) by setting `CLIENT_URL` in environment variables.

---

## 🚀 Environment & Setup

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
JWT_SECRET=supersecretjwtkey_hs_gym_2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@db.edszptikpdazholbpscs.supabase.co:5432/postgres?schema=public"
```

### Install Dependencies
```bash
npm install
```

### Run Database Migrations
```bash
npx prisma db push
```

### Start Development Server
```bash
npm run dev
```

---

## 📡 API Reference Table

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/auth/logout` | Public | Clear authentication cookie |
| `GET` | `/api/auth/check` | Private | Verify active token & return user profile |

### 👤 User Routes (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | Fetch all users list with total count |
| `POST` | `/api/users` | Admin | Create a new user account |
| `GET` | `/api/users/profile` | Private | Get currently authenticated user profile |
| `PUT` | `/api/users/profile` | Private | Update logged-in user profile details |
| `PATCH` | `/api/users/:id/status` | Admin | Update user status (`Active`/`Blocked`/`Live`) |
| `PUT` | `/api/users/:id` | Admin | Edit user details |
| `DELETE` | `/api/users/:id` | Admin | Delete a user account |

### 📦 Drop / Catalog Routes (`/api/drops` or `/api/catalogue/drops`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/drops/summary` | Public | Fetch catalog metrics (Total Drops, Total Products, Live, Draft) |
| `GET` | `/api/drops` | Public | Get all drops with products |
| `GET` | `/api/drops/:id` | Public | Get single drop details by ID |
| `POST` | `/api/drops` | Admin | Create a new drop (Draft / Live) |
| `PUT` | `/api/drops/:id` | Admin | Update drop name, status, or release date |
| `PATCH` | `/api/drops/:id/status` | Admin | Update drop status (`Draft` / `Live` / `Archived`) |
| `DELETE` | `/api/drops/:id` | Admin | Delete a drop |

### 👕 Product Routes (`/api/products` or `/api/catalogue/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products` | Admin | Create product in drop with image auto-sanitization |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `PUT` | `/api/products/:id` | Admin | Update product details, images, and prices |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |

---

## ⚙️ Directory Structure

```
Backend/
├── prisma/
│   └── schema.prisma        # Prisma Database Models & JSONB types
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   ├── drop.controller.js
│   │   └── address.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── admin.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   ├── drop.routes.js
│   │   └── address.routes.js
│   ├── utils/
│   │   └── imageHelper.js   # Base64 Data URI to Static File Converter
│   ├── lib/
│   │   └── prisma.js        # Prisma Client Instance
│   └── server.js            # Express App Entry Point & 50MB Body Parser
├── .env                     # Environment Variables
├── package.json
└── README.md
```
