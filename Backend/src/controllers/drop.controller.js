import { prisma } from '../lib/prisma.js';

// @desc    Get catalog summary metrics
// @route   GET /api/drops/summary or /api/catalogue/summary
// @access  Public
export const getCatalogSummary = async (req, res) => {
  try {
    const totalDrops = await prisma.drop.count();
    const allProducts = await prisma.product.findMany({
      include: {
        drop: {
          select: { status: true, isActive: true }
        }
      }
    });

    const totalProducts = allProducts.length;

    let liveProducts = 0;
    let draftProducts = 0;

    for (const p of allProducts) {
      const dropStatus = p.drop?.status;
      const isDropLive = dropStatus === 'Live' || p.drop?.isActive === true;

      // A product is ONLY Live if its parent Drop is Live AND product is inStock
      if (isDropLive && p.inStock) {
        liveProducts++;
      } else {
        draftProducts++;
      }
    }

    res.json({
      totalDrops,
      totalProducts,
      liveProducts,
      draftProducts
    });
  } catch (error) {
    console.error('Error fetching catalog summary:', error.message);
    res.status(500).json({ message: 'Server error fetching catalog summary' });
  }
};

// @desc    Get all drops with products
// @route   GET /api/drops or /api/catalogue/drops
// @access  Public
export const getDrops = async (req, res) => {
  try {
    const drops = await prisma.drop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: true,
      },
    });

    const formattedDrops = drops.map(d => ({
      ...d,
      dropName: d.dropName || d.title || 'Untitled Drop',
      title: d.title || d.dropName || 'Untitled Drop',
      status: d.status || (d.isActive ? 'Live' : 'Draft'),
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: d.updatedAt ? d.updatedAt.toISOString() : new Date().toISOString()
    }));

    res.json(formattedDrops);
  } catch (error) {
    console.error('Error fetching drops:', error.message);
    res.status(500).json({ message: 'Server error fetching drops' });
  }
};

// @desc    Get single drop
// @route   GET /api/drops/:id or /api/catalogue/drops/:id
// @access  Public
export const getDropById = async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({
      where: { id: req.params.id },
      include: {
        products: true,
      },
    });

    if (drop) {
      res.json({
        ...drop,
        dropName: drop.dropName || drop.title || 'Untitled Drop',
        title: drop.title || drop.dropName || 'Untitled Drop',
        status: drop.status || (drop.isActive ? 'Live' : 'Draft'),
        createdAt: drop.createdAt ? drop.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: drop.updatedAt ? drop.updatedAt.toISOString() : new Date().toISOString()
      });
    } else {
      res.status(404).json({ message: 'Drop not found' });
    }
  } catch (error) {
    console.error('Error fetching drop:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a drop
// @route   POST /api/drops or /api/catalogue/drops
// @access  Private/Admin
export const createDrop = async (req, res) => {
  try {
    const { dropName, title, status, isActive, releaseDate } = req.body;
    const nameToUse = dropName || title || 'New Drop';
    const statusToUse = status || (isActive ? 'Live' : 'Draft');

    const drop = await prisma.drop.create({
      data: {
        dropName: nameToUse,
        title: nameToUse,
        status: statusToUse,
        isActive: statusToUse === 'Live',
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      },
      include: {
        products: true
      }
    });

    res.status(201).json({
      ...drop,
      dropName: drop.dropName || drop.title,
      status: drop.status,
      products: drop.products || []
    });
  } catch (error) {
    console.error('Error creating drop:', error.message);
    res.status(500).json({ message: 'Server error while creating drop' });
  }
};

// @desc    Update a drop
// @route   PUT /api/drops/:id or /api/catalogue/drops/:id
// @access  Private/Admin
export const updateDrop = async (req, res) => {
  try {
    const dropId = req.params.id;
    const { dropName, title, status, isActive, releaseDate } = req.body;

    const existingDrop = await prisma.drop.findUnique({ where: { id: dropId } });

    if (!existingDrop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    const nameToUse = dropName || title || existingDrop.dropName || existingDrop.title;
    const statusToUse = status || (isActive !== undefined ? (isActive ? 'Live' : 'Draft') : existingDrop.status);

    const updatedDrop = await prisma.drop.update({
      where: { id: dropId },
      data: {
        dropName: nameToUse,
        title: nameToUse,
        status: statusToUse,
        isActive: statusToUse === 'Live',
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      },
      include: {
        products: true
      }
    });

    res.json({
      ...updatedDrop,
      dropName: updatedDrop.dropName || updatedDrop.title,
      status: updatedDrop.status,
      products: updatedDrop.products || []
    });
  } catch (error) {
    console.error('Error updating drop:', error.message);
    res.status(500).json({ message: 'Server error while updating drop' });
  }
};

// @desc    Update drop status
// @route   PATCH /api/drops/:id/status or /api/catalogue/drops/:id/status
// @access  Private/Admin
export const updateDropStatus = async (req, res) => {
  try {
    const dropId = req.params.id;
    const { status } = req.body;

    const existingDrop = await prisma.drop.findUnique({ where: { id: dropId } });
    if (!existingDrop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    const updatedDrop = await prisma.drop.update({
      where: { id: dropId },
      data: {
        status: status || existingDrop.status,
        isActive: status === 'Live'
      },
      include: {
        products: true
      }
    });

    res.json(updatedDrop);
  } catch (error) {
    console.error('Error updating drop status:', error.message);
    res.status(500).json({ message: 'Server error while updating drop status' });
  }
};

// @desc    Delete a drop
// @route   DELETE /api/drops/:id or /api/catalogue/drops/:id
// @access  Private/Admin
export const deleteDrop = async (req, res) => {
  try {
    const drop = await prisma.drop.findUnique({ where: { id: req.params.id } });

    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    await prisma.drop.delete({ where: { id: req.params.id } });
    res.json({ message: 'Drop removed successfully' });
  } catch (error) {
    console.error('Error deleting drop:', error.message);
    res.status(500).json({ message: 'Server error while deleting drop' });
  }
};
