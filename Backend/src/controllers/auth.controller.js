import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in MS
    httpOnly: true, // prevents XSS attacks
    sameSite: process.env.NODE_ENV === 'development' ? 'strict' : 'none',
    secure: process.env.NODE_ENV !== 'development', // must be true for sameSite 'none'
  });

  return token;
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password, mobile, countryCode, country, gender, dob } = req.body;

    // Validate inputs
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        mobile,
        countryCode,
        country,
        gender,
        dob: dob ? new Date(dob) : null,
      },
    });

    if (newUser) {
      // Generate token and send response
      const token = generateToken(newUser.id, res);

      const userObj = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
      };

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: userObj,
        token,
        ...userObj
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in register controller: ', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Role-specific check if role is passed in body
    if (role) {
      const requestedRoleUpper = role.toUpperCase();
      const userRoleUpper = (user.role || '').toUpperCase();

      if (requestedRoleUpper === 'MANUFACTURER' && userRoleUpper !== 'MANUFACTURER' && userRoleUpper !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: `Access denied. Account '${user.email}' is not registered as a Manufacturer.`
        });
      }

      if (requestedRoleUpper === 'ADMIN' && userRoleUpper !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: `Access denied. Account '${user.email}' is not an Admin.`
        });
      }
    }

    const token = generateToken(user.id, res);

    const userObj = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userObj,
      token,
      ...userObj
    });
  } catch (error) {
    console.error('Error in login controller: ', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        companyName: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in checkAuth controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
