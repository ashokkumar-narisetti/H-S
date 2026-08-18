import { prisma } from '../lib/prisma.js';

// @desc    Get all drops
// @route   GET /api/drops
// @access  Public
export const getDrops = async (req, res) => {
  try {
    const drops = await prisma.drop.findMany({
      orderBy: { releaseDate: 'desc' },
      include: {
        products: true,
      },
    });
    res.json(drops);
  } catch (error) {
    console.error('Error fetching drops:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single drop
// @route   GET /api/drops/:id
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
      res.json(drop);
    } else {
      res.status(404).json({ message: 'Drop not found' });
    }
  } catch (error) {
    console.error('Error fetching drop:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a drop
// @route   POST /api/drops
// @access  Private/Admin
export const createDrop = async (req, res) => {
  try {
    const { title, isActive, releaseDate } = req.body;

    const drop = await prisma.drop.create({
      data: {
        title,
        isActive: isActive === undefined ? true : isActive,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      },
    });

    res.status(201).json(drop);
  } catch (error) {
    console.error('Error creating drop:', error.message);
    res.status(500).json({ message: 'Server error while creating drop' });
  }
};

// @desc    Update a drop
// @route   PUT /api/drops/:id
// @access  Private/Admin
export const updateDrop = async (req, res) => {
  try {
    const dropId = req.params.id;
    const { title, isActive, releaseDate } = req.body;

    const drop = await prisma.drop.findUnique({ where: { id: dropId } });

    if (!drop) {
      return res.status(404).json({ message: 'Drop not found' });
    }

    const updatedDrop = await prisma.drop.update({
      where: { id: dropId },
      data: {
        title,
        isActive,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      },
    });

    res.json(updatedDrop);
  } catch (error) {
    console.error('Error updating drop:', error.message);
    res.status(500).json({ message: 'Server error while updating drop' });
  }
};

// @desc    Delete a drop
// @route   DELETE /api/drops/:id
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
