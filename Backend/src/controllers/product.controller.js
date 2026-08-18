import { prisma } from '../lib/prisma.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, isBestSeller, dropId } = req.query;
    
    // Build filter dynamically
    const filter = {};
    if (category) filter.category = { equals: category, mode: 'insensitive' };
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (dropId) filter.dropId = dropId;

    const products = await prisma.product.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        drop: { select: { title: true } }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        drop: { select: { title: true } },
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
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, images, category, 
      fit, isNew, isBestSeller, stock, sizes, colors, dropId 
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        images,
        category,
        fit,
        isNew: isNew === undefined ? true : isNew,
        isBestSeller: isBestSeller || false,
        stock: parseInt(stock) || 0,
        sizes,
        colors,
        dropId
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { 
      name, description, price, images, category, 
      fit, isNew, isBestSeller, stock, sizes, colors, dropId 
    } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        images,
        category,
        fit,
        isNew,
        isBestSeller,
        stock: stock ? parseInt(stock) : undefined,
        sizes,
        colors,
        dropId
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
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
