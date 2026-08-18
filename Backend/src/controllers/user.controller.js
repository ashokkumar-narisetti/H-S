import { prisma } from '../lib/prisma.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        mobile: true,
        countryCode: true,
        country: true,
        gender: true,
        dob: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      let age = null;
      if (user.dob) {
        const diff = Date.now() - user.dob.getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      }
      res.json({ ...user, age });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (user) {
      const { fullName, email, mobile, countryCode, country, gender, dob } = req.body;

      // Optional: Check if email is being updated and if it's already taken by another user
      if (email && email !== user.email) {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use by another account' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          fullName: fullName || user.fullName,
          email: email || user.email,
          mobile: mobile || user.mobile,
          countryCode: countryCode || user.countryCode,
          country: country || user.country,
          gender: gender || user.gender,
          dob: dob ? new Date(dob) : user.dob,
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          mobile: true,
          countryCode: true,
          country: true,
          gender: true,
          dob: true,
          role: true,
        },
      });

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users and count
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const count = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        mobile: true,
        countryCode: true,
        country: true,
        gender: true,
        dob: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const usersWithAge = users.map(u => {
      let age = null;
      if (u.dob) {
        const diff = Date.now() - u.dob.getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      }
      return { ...u, age };
    });

    res.json({ count, users: usersWithAge });
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};
