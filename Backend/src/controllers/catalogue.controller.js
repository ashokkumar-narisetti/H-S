import { prisma } from '../lib/prisma.js';
import { supabase } from '../lib/supabase.js';
import { uploadBase64ToSupabase } from '../utils/imageHelper.js';
import fs from 'fs';
import crypto from 'crypto';

// @desc    Upload product photo, mockup image, or design file
// @route   POST /api/catalogue/upload or /api/products/upload
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  try {
    // 1. Handle Multer file upload
    if (req.file) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const extension = req.file.originalname.split('.').pop() || 'png';
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, fileBuffer, {
            contentType: req.file.mimetype || `image/${extension}`,
            upsert: false
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        // Optional: delete local file to save disk space
        fs.unlinkSync(req.file.path);

        return res.status(201).json({ url: publicUrlData.publicUrl, message: 'Image uploaded to Supabase successfully' });
      } catch (err) {
        console.error('Supabase raw file upload error:', err);
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(201).json({ url: fileUrl, message: 'Image uploaded locally (Supabase fallback)' });
      }
    }

    // 2. Handle Base64 JSON upload
    const { file, image } = req.body || {};
    if (file || image) {
      const publicUrl = await uploadBase64ToSupabase(file || image);
      return res.status(201).json({ url: publicUrl, message: 'Image uploaded to Supabase successfully' });
    }

    res.status(400).json({ message: 'No file uploaded' });
  } catch (error) {
    console.error('Error in uploadImage:', error.message);
    res.status(500).json({ message: 'Server error handling image upload' });
  }
};

// @desc    Get product categories
// @route   GET /api/catalogue/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    
    // Extract category strings and remove nulls/empty/Apparel, sort alphabetically
    const categories = products
      .map(p => p.category)
      .filter(c => c && c.trim() !== '' && c.toLowerCase() !== 'apparel')
      .sort();
      
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// @desc    Get print type options
// @route   GET /api/catalogue/print-types
// @access  Public
export const getPrintTypes = async (req, res) => {
  res.json(['DTF', 'DTG', 'Embroidery']);
};

// @desc    Get print position options
// @route   GET /api/catalogue/print-positions
// @access  Public
export const getPrintPositions = async (req, res) => {
  res.json([
    'Front Center',
    'Back Center',
    'Left Chest',
    'Right Chest',
    'Sleeve',
    'Full Front',
    'Full Back'
  ]);
};
