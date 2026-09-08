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

    initialized = true;
    console.log('✓ PostgreSQL Custom Database Tables (Category, Coupon, Setting) initialized successfully');
  } catch (err) {
    console.error('Warning initializing custom tables:', err.message);
  }
};
