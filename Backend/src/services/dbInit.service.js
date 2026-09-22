import { prisma } from '../lib/prisma.js';

let initialized = false;
let initPromise = null;

export const initCustomTables = async () => {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
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

    // Remove any historical dummy seed coupons from database
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Coupon" WHERE "id" IN ('CPN-101', 'CPN-102', 'CPN-103') OR "code" IN ('SUMMER20', 'WELCOME10', 'VIP500');
    `);

    // 2. Initialize Setting table in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" TEXT PRIMARY KEY,
        "value" JSONB NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Initialize Category table in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "weightPerPiece" DOUBLE PRECISION DEFAULT 0.500,
        "conversionRule" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default categories if empty
    const catCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Category"`);
    if (catCount[0]?.count === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Category" ("id", "name", "description", "weightPerPiece", "conversionRule", "isActive")
        VALUES 
        ('CAT-001', 'T-Shirts', 'Premium performance & lifestyle gym t-shirts', 0.500, '1 kg = 2 T-Shirts', true),
        ('CAT-002', 'Hoodies', 'Heavyweight cotton & fleece gym hoodies', 1.000, '1 kg = 1 Hoodie', true),
        ('CAT-003', 'Pants', 'Athletic trackpants & sweatpants', 1.000, '1 kg = 1 Pant / SP', true),
        ('CAT-004', 'Shorts', 'Breathable athletic training shorts', 0.333, '1 kg = 3 Shorts', true),
        ('CAT-005', 'Accessories', 'Caps, wristbands, gym towels & straps', 0.250, '1 kg = 4 Accessories', true),
        ('CAT-006', 'Apparel', 'General gym & workout apparel', 0.500, '1 kg = 2 Items', true)
        ON CONFLICT ("name") DO NOTHING;
      `);
    }

    // 4. Hotfix: Drop the username column from the User table to sync with schema.prisma
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" DROP COLUMN IF EXISTS "username" CASCADE;
    `);

    // 5. Ensure Product.categoryId exists in PostgreSQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
    `);

    // 6. Ensure Order coupon columns exist in PostgreSQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponDiscount" DOUBLE PRECISION DEFAULT 0;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponApplied" BOOLEAN DEFAULT false;
    `);

    // Seed default settings if empty
    const taxSetting = await prisma.$queryRawUnsafe(`SELECT * FROM "Setting" WHERE "key" = 'tax'`);
    if (taxSetting.length === 0) {
      const defaultTax = JSON.stringify({
        indianThreshold: 2500,
        indianLowRate: 5,
        indianHighRate: 18,
        nonIndianRate: 0,
        gstinNumber: '29ABCDE1234F1Z5',
        registeredLegalName: 'H&S Apparel & Fitness Brands Private Limited',
        stateOfRegistration: 'Karnataka',
        enableGst: true
      });
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Setting" ("key", "value") VALUES ('tax', $1::jsonb) ON CONFLICT DO NOTHING`,
        defaultTax
      );
    }

    const storeSetting = await prisma.$queryRawUnsafe(`SELECT * FROM "Setting" WHERE "key" = 'store'`);
    if (storeSetting.length === 0) {
      const defaultStore = JSON.stringify({
        storeName: 'H&S Collective Store',
        storeEmail: 'contact@hscollective.com',
        supportEmail: 'support@hscollective.com',
        phone: '+91 98765 43210',
        currency: 'INR (₹)',
        timezone: 'Asia/Kolkata (IST)',
        address: 'Plot 42, Industrial Area Phase II, Bengaluru, Karnataka 560100'
      });
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Setting" ("key", "value") VALUES ('store', $1::jsonb) ON CONFLICT DO NOTHING`,
        defaultStore
      );
    }

    const shippingSetting = await prisma.$queryRawUnsafe(`SELECT * FROM "Setting" WHERE "key" = 'shipping'`);
    if (shippingSetting.length === 0) {
      const defaultShipping = JSON.stringify({
        blockStepKg: 5,
        ratePerBlock: 5000,
        domesticFlatRate: 0,
        currency: 'INR (₹)'
      });
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Setting" ("key", "value") VALUES ('shipping', $1::jsonb) ON CONFLICT DO NOTHING`,
        defaultShipping
      );
    }

    // 7. Ensure Performance Indexes exist in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
      CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
      CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");
      CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
      CREATE INDEX IF NOT EXISTS "Product_inStock_createdAt_idx" ON "Product"("inStock", "createdAt");
      CREATE INDEX IF NOT EXISTS "Drop_isActive_status_idx" ON "Drop"("isActive", "status");
      CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
      CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
      CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
      CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId");
      CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");
    `);

    initialized = true;
    console.log('✓ PostgreSQL Custom Database Tables & Performance Indexes initialized successfully');
  } catch (err) {
    console.error('Warning initializing custom tables:', err.message);
  } finally {
    initPromise = null;
  }
  })();

  return initPromise;
};

