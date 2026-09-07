import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // 1. Prioritize Bearer token from headers (Frontend uses this)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Fall back to cookie if no header is provided
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    // Attach userId and role to the request for the next middleware/controller
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
