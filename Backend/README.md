# 🏋️ H&S Gym Backend API

> **Node.js, Express.js (ES Modules), Prisma ORM & PostgreSQL Authentication and User Management Service**

---

## 📌 Overview

The H&S Gym Backend provides RESTful APIs for user authentication, session security, profile management, and administrator user operations. It is designed to work seamlessly with frontend web applications (such as React / Vite SPAs) as well as mobile clients.

---

## 🛠️ Summary of Recent Changes & Rationale

> [!NOTE]
> Below is a breakdown of what was changed in the backend codebase and **why** each change was made.

### 1. **Authentication Token Support (`auth.middleware.js`)**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HTTP Request Received                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
         Cookie: jwt=token             Header: Authorization Bearer token
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
                           Verified by JWT
```

- **What Changed**: Updated `protectRoute` middleware to extract JWT tokens from either `req.cookies.jwt` or `req.headers.authorization` (`Bearer <token>`).
- **Why**: SPAs and mobile applications store tokens in `localStorage` or `sessionStorage` and attach `Authorization: Bearer <token>` HTTP headers. Previously, the backend only checked cookies, causing authentication failures for client apps sending header tokens.

---

### 2. **Authentication Responses (`auth.controller.js`)**

> [!IMPORTANT]
> **What Changed**: Updated `login` and `register` controllers to return `{ success, message, user, token }` in the JSON response payload.  
> **Why**: Frontend dashboards (like `MASTER-DASH-GYM`) store token strings upon login to authenticate subsequent API calls. Returning `token` in the response payload ensures frontend clients can immediately save the token without relying solely on cookie persistence.

---

### 3. **Environment-Driven CORS Configuration (`server.js` & `.env`)**

> [!TIP]
> **What Changed**: Configured CORS origins to be read dynamically from `process.env.CLIENT_URL` (supports single or comma-separated URLs). During development (`NODE_ENV !== 'production'`), local dev ports (`5173`, `5174`, `5175`, `3000`) are automatically allowed as fallbacks.  
> **Why Deployment-Ready**: When deploying to production (e.g. Render, Vercel, Netlify), you simply set `CLIENT_URL=https://your-production-app.vercel.app` in your environment variables. No code changes are required!

---

### 4. **User Admin CRUD Operations (`user.controller.js` & `user.routes.js`)**

- **What Changed**: Added endpoints for creating users (`POST /api/users`), toggling status (`PATCH /api/users/:id/status`), updating details (`PUT /api/users/:id`), and deleting users (`DELETE /api/users/:id`).
- **Why**: The admin dashboard requires full user management capabilities (viewing, searching, activating/blocking users, and editing member details).

---

### 5. **Prisma Database Schema (`prisma/schema.prisma`)**

- **What Changed**: Added `status String @default("Active")` to the `User` model.
- **Why**: Allows the application to track account status (`Active`, `Blocked`, `Live`) for user access control.

---

## 🚀 Environment & Setup

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
JWT_SECRET=supersecretjwtkey_hs_gym_2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hs_gym?schema=public"
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

---

## ⚙️ Directory Structure

```
Backend/
├── prisma/
│   └── schema.prisma        # Prisma Database Models
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
│   ├── lib/
│   │   └── prisma.js        # Prisma Client Instance
│   └── server.js            # Express App Entry Point
├── .env                     # Environment Variables
├── package.json
└── README.md
```
