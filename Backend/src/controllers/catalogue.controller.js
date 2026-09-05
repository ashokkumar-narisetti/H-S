import { prisma } from '../lib/prisma.js';

// @desc    Upload product photo, mockup image, or design file
// @route   POST /api/catalogue/upload or /api/products/upload
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  try {
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.status(201).json({ url: fileUrl, message: 'Image uploaded successfully' });
    }

    const { file, image } = req.body || {};
    if (file || image) {
      return res.status(201).json({ url: file || image, message: 'Image uploaded successfully' });
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
    
    // Extract category strings and remove nulls/empty, sort alphabetically
    const categories = products
      .map(p => p.category)
      .filter(c => c && c.trim() !== '')
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
