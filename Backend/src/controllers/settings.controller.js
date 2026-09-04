import { prisma } from '../lib/prisma.js';
import { initCustomTables } from '../services/dbInit.service.js';

const defaultTaxSettings = {
  enableGst: true,
  nonIndianRate: 0,
  indianThreshold: 2500,
  indianLowRate: 5,
  indianHighRate: 18,
  gstinNumber: '29ABCDE1234F1Z5',
  registeredLegalName: 'H&S Apparel & Fitness Brands Private Limited',
  stateOfRegistration: 'Karnataka'
};

const defaultStoreSettings = {
  storeName: 'H&S Collective Store',
  storeEmail: 'contact@hscollective.com',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST)',
  address: 'Plot 42, Industrial Area Phase II, Bengaluru, Karnataka 560100',
  phone: '+91 98765 43210'
};

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    await initCustomTables();

    const taxRow = await prisma.$queryRawUnsafe(`SELECT "value" FROM "Setting" WHERE "key" = 'tax'`);
    const storeRow = await prisma.$queryRawUnsafe(`SELECT "value" FROM "Setting" WHERE "key" = 'store'`);

    const taxSettings = taxRow.length > 0 && taxRow[0].value
      ? (typeof taxRow[0].value === 'string' ? JSON.parse(taxRow[0].value) : taxRow[0].value)
      : defaultTaxSettings;

    const storeSettings = storeRow.length > 0 && storeRow[0].value
      ? (typeof storeRow[0].value === 'string' ? JSON.parse(storeRow[0].value) : storeRow[0].value)
      : defaultStoreSettings;

    res.json({
      taxSettings: { ...defaultTaxSettings, ...taxSettings },
      storeSettings: { ...defaultStoreSettings, ...storeSettings }
    });
  } catch (error) {
    console.error('Error getting settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings from database' });
  }
};

// @desc    Update Tax / GST settings
// @route   PUT /api/settings/tax
// @access  Private/Admin
export const updateTaxSettings = async (req, res) => {
  try {
    await initCustomTables();
    const updated = { ...defaultTaxSettings, ...req.body };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("key", "value", "updatedAt") 
       VALUES ('tax', $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key") DO UPDATE SET "value" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(updated)
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating tax settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update tax settings' });
  }
};

// @desc    Update Store Profile settings
// @route   PUT /api/settings/store
// @access  Private/Admin
export const updateStoreSettings = async (req, res) => {
  try {
    await initCustomTables();
    const updated = { ...defaultStoreSettings, ...req.body };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("key", "value", "updatedAt") 
       VALUES ('store', $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT ("key") DO UPDATE SET "value" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(updated)
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating store settings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update store settings' });
  }
};
