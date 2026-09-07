import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import addressRoutes from './routes/address.routes.js';
import productRoutes from './routes/product.routes.js';
import dropRoutes from './routes/drop.routes.js';
import catalogueRoutes from './routes/catalogue.routes.js';
import orderRoutes from './routes/order.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { initCustomTables } from './services/dbInit.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the proxy (Render, Vercel, Heroku) so Express correctly identifies HTTPS connections and allows secure cookies
app.set('trust proxy', 1);

// Middlewares - 100mb payload limit for storing base64 image URIs directly in database columns
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

// Configurable CORS from process.env.CLIENT_URL (supports single or comma-separated origins, or '*' for all origins)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return true;
  }
  // Allow any localhost or 127.0.0.1 origin on any port in development
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/drops', dropRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);

// Initialize PostgreSQL custom tables in background
initCustomTables();

// Health check
app.get('/', (req, res) => {
  res.send('H&S Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
