# H&S Unisex Streetwear E-commerce Website

A complete, professional, production-ready frontend for **H&S (Hi & Shi)** — a unisex Gen-Z streetwear collective.

This project implements a strict black, white, and grayscale aesthetic with high-impact typography, modern micro-animations, and a fully functional (mocked) e-commerce flow.

## Tech Stack
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM
- **Global State**: Zustand
- **Styling**: Tailwind CSS (v4)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Folder Structure
```text
src/
├── assets/          # Images, fonts (e.g., hero-banner.jpg)
├── components/      # Reusable UI elements (Navbar, Footer, ProductCard, CartDrawer, HeroBanner)
├── pages/           # Route-level components (Home, CategoryPage, ProductDetailPage, etc.)
├── data/            # Mock product database (products.js)
├── store/           # Zustand state management (useCartStore.js, useWishlistStore.js)
├── index.css        # Global CSS and Tailwind variables
├── App.jsx          # Main application routing
└── main.jsx         # React application entry point
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Adding New Products

All product data is centralized in `src/data/products.js`. To add a new product, simply append a new object to the `products` array with the following structure:

```javascript
{
  id: "unique-id",
  name: "Product Name",
  category: "tshirts", // Matches routing and filters
  price: 50.00,
  images: ["url-1.jpg", "url-2.jpg"],
  description: "Product description goes here.",
  fit: "Oversized",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black", "White"],
  isNew: true, // Shows "New" badge and adds to New Arrivals
  isBestSeller: true, // Shows "Best Seller" badge and adds to Trending Now
}
```

## State Management (Cart & Wishlist)

State management is handled via **Zustand** stores located in `src/store/`:
- `useCartStore`: Manages the cart array, adding/removing items, adjusting quantities, and toggling the Cart Drawer UI.
- `useWishlistStore`: Manages saved items and persists them across the session.

You can import these hooks into any component to read or mutate state:
```javascript
import { useCartStore } from '../store/useCartStore';

// Inside component:
const addToCart = useCartStore(state => state.addToCart);
```

## Application Routes

- `/` - Homepage (Hero, New Arrivals, Best Sellers, Categories)
- `/category/:categoryName` - Category listing with filters (Size, Fit) and Sorting.
- `/product/:id` - Detailed product view with image gallery and cart integration.
- `/wishlist` - View saved items.
- `/checkout` - Mock checkout process and order summary.
- `/login` / `/signup` - Authentication pages.
- `/account` - User profile and order history.
