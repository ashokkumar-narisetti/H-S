import { prisma } from '../lib/prisma.js';

let initialized = false;

export const initCustomTables = async () => {
  if (initialized) return;
  try {
    // 1. Initialize Coupon table in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "type" TEXT DEFAULT 'Public',
        "discountValue" DOUBLE PRECISION DEFAULT 10,
        "discountType" TEXT DEFAULT 'Percentage',
        "minSpend" DOUBLE PRECISION DEFAULT 0,
        "usageLimit" INTEGER DEFAULT 0,
        "usageCount" INTEGER DEFAULT 0,
        "expiryDate" TEXT DEFAULT '2026-12-31',
        "status" TEXT DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default coupon if empty
    const couponCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Coupon"`);
    if (couponCount[0]?.count === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Coupon" ("id", "code", "type", "discountValue", "discountType", "minSpend", "usageLimit", "usageCount", "expiryDate", "status")
        VALUES 
        ('CPN-101', 'SUMMER20', 'Public', 20, 'Percentage', 999, 500, 42, '2026-12-31', 'Active'),
        ('CPN-102', 'WELCOME10', 'Public', 10, 'Percentage', 499, 1000, 150, '2026-12-31', 'Active'),
        ('CPN-103', 'VIP500', 'Private', 500, 'Fixed Amount', 2499, 50, 12, '2026-12-31', 'Active')
        ON CONFLICT ("code") DO NOTHING;
      `);
    }

    // 2. Initialize Setting table in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" TEXT PRIMARY KEY,
        "value" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Hotfix: Drop the username column from the User table to sync with schema.prisma
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" DROP COLUMN IF EXISTS "username" CASCADE;
    `);

    // Seed default settings if empty
    const taxSetting = await prisma.$queryRawUnsafe(`SELECT * FROM "Setting" WHERE "key" = 'tax'`);
    if (taxSetting.length === 0) {
      const defaultTax = JSON.stringify({
        indianThreshold: 1000,
        indianLowRate: 5,
        indianHighRate: 18,
        nonIndianRate: 0,
        gstin: '29ABCDE1234F1Z5',
        compositionScheme: false
      });
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Setting" ("key", "value") VALUES ('tax', $1::jsonb) ON CONFLICT DO NOTHING`,
        defaultTax
      );
    }

    const storeSetting = await prisma.$queryRawUnsafe(`SELECT * FROM "Setting" WHERE "key" = 'store'`);
    if (storeSetting.length === 0) {
      const defaultStore = JSON.stringify({
        storeName: 'H&S Collective - Activewear',
        supportEmail: 'support@hscollective.com',
        supportPhone: '+91 98765 43210',
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        address: 'Plot 42, Industrial Area Phase II, Bengaluru, Karnataka 560100'
      });
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Setting" ("key", "value") VALUES ('store', $1::jsonb) ON CONFLICT DO NOTHING`,
        defaultStore
      );
    }

    initialized = true;
    console.log('✓ PostgreSQL Custom Database Tables (Coupon, Setting) initialized successfully');
  } catch (err) {
    console.error('Warning initializing custom tables:', err.message);
  }
};
