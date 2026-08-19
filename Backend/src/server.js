import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import addressRoutes from './routes/address.routes.js';
import productRoutes from './routes/product.routes.js';
import dropRoutes from './routes/drop.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Configurable CORS from process.env.CLIENT_URL (supports single or comma-separated origins)
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = Array.from(new Set([
  ...envOrigins,
  ...(isDev ? [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ] : [])
]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || (isDev && origin.startsWith('http://localhost:'))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy error: Origin ${origin} not allowed.`));
  },
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/drops', dropRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('H&S Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
