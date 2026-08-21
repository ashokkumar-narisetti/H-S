import { prisma } from '../lib/prisma.js';
import { sanitizeProductImageFields } from '../utils/imageHelper.js';

const safeParseFloat = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

const safeParseInt = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
};

// @desc    Get all products with filters
// @route   GET /api/products or /api/catalogue/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, isBestSeller, dropId, inStock } = req.query;
    
    // Build filter dynamically
    const filter = {};
    if (category && category !== 'All Categories') filter.category = { equals: category, mode: 'insensitive' };
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (dropId) filter.dropId = dropId;
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    const products = await prisma.product.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        drop: { select: { title: true, dropName: true, status: true } }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id or /api/catalogue/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        drop: { select: { title: true, dropName: true } },
        reviews: {
          include: {
            user: { select: { fullName: true } }
          }
        }
      }
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product
// @route   POST /api/products or /api/catalogue/drops/:dropId/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const dropIdFromParams = req.params.dropId;
    const body = sanitizeProductImageFields(req.body);

    const { 
      name, manufactureName, description, price, userPrice, manufacturePrice,
      images, coverPhoto, category, gender, fit, isNew, isBestSeller, stock, inStock,
      sizes, colors, sizeChart, washCare, shippingNote, priceBreakdown, manufactureSpec, dropId
    } = body;

    const targetDropId = dropIdFromParams || dropId;
    const finalPrice = price !== undefined ? safeParseFloat(price) : (userPrice ? safeParseFloat(userPrice) : 0);

    const createPayload = {
      name: name || 'Untitled Product',
      manufactureName: manufactureName || null,
      description: description || '',
      price: finalPrice ?? 0,
      userPrice: userPrice ? safeParseFloat(userPrice) : (finalPrice ?? 0),
      manufacturePrice: safeParseFloat(manufacturePrice),
      images: Array.isArray(images) && images.length > 0 ? images : (coverPhoto ? [coverPhoto] : []),
      coverPhoto: coverPhoto || (Array.isArray(images) && images[0] ? images[0] : ''),
      category: category || 'T-Shirts',
      gender: gender || 'Unisex',
      fit: fit || null,
      isNew: isNew === undefined ? true : isNew,
      isBestSeller: isBestSeller || false,
      stock: stock ? (safeParseInt(stock) ?? 0) : 0,
      inStock: inStock !== undefined ? inStock : true,
      sizes: sizes || [],
      colors: colors || [],
      sizeChart: sizeChart || null,
      washCare: washCare || null,
      shippingNote: shippingNote || null,
      priceBreakdown: priceBreakdown || null,
      manufactureSpec: manufactureSpec || null,
      dropId: targetDropId || null
    };

    const product = await prisma.product.create({
      data: createPayload
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id or /api/catalogue/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const body = sanitizeProductImageFields(req.body);

    const { 
      name, manufactureName, description, price, userPrice, manufacturePrice,
      images, coverPhoto, category, gender, fit, isNew, isBestSeller, stock, inStock,
      sizes, colors, sizeChart, washCare, shippingNote, priceBreakdown, manufactureSpec, dropId
    } = body;

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name }),
        ...(manufactureName !== undefined && { manufactureName: manufactureName || null }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: safeParseFloat(price) ?? product.price }),
        ...(userPrice !== undefined && { userPrice: safeParseFloat(userPrice) }),
        ...(manufacturePrice !== undefined && { manufacturePrice: safeParseFloat(manufacturePrice) }),
        ...(images !== undefined && { images: Array.isArray(images) ? images : [] }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(category !== undefined && { category }),
        ...(gender !== undefined && { gender }),
        ...(fit !== undefined && { fit }),
        ...(isNew !== undefined && { isNew }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(stock !== undefined && { stock: safeParseInt(stock) ?? product.stock }),
        ...(inStock !== undefined && { inStock }),
        ...(sizes !== undefined && { sizes }),
        ...(colors !== undefined && { colors }),
        ...(sizeChart !== undefined && { sizeChart }),
        ...(washCare !== undefined && { washCare }),
        ...(shippingNote !== undefined && { shippingNote }),
        ...(priceBreakdown !== undefined && { priceBreakdown }),
        ...(manufactureSpec !== undefined && { manufactureSpec }),
        ...(dropId !== undefined && { dropId })
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product', error: error.message });
  }
};

// @desc    Toggle product inStock availability
// @route   PATCH /api/products/:id/stock or /api/catalogue/products/:id/stock
// @access  Private/Admin
export const toggleProductStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { inStock } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        inStock: inStock !== undefined ? inStock : !product.inStock
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling product stock:', error.message);
    res.status(500).json({ message: 'Server error toggling product stock' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id or /api/catalogue/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
