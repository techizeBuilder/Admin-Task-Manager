import { storage } from "./mongodb-storage.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided for:', req.path);
      return res.status(401).json({ message: 'Access token required' });
    }

    console.log('Authenticating token for request:', req.path);
    console.log('Token received:', token.substring(0, 20) + '...');
    
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed - invalid or expired for:', req.path);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log('Token decoded successfully for', req.path, ':', { id: decoded.id, email: decoded.email });

    // Verify user still exists and is active
    const user = await storage.getUser(decoded.id);
    if (!user) {
      console.log('User not found for ID:', decoded.id, 'on path:', req.path);
      return res.status(403).json({ message: 'User not found' });
    }

    console.log('User found:', { id: user._id, email: user.email, organization: user.organization });

    req.user = {
      id: decoded.id,
      email: decoded.email,
      organizationId: decoded.organizationId || user.organization?.toString() || user.organizationId,
      role: decoded.role,
    };

    console.log('Authentication successful for user:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Authentication failed' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireOrganization(req, res, next) {
  if (!req.user?.organizationId) {
    return res.status(403).json({ message: 'Organization membership required' });
  }
  next();
}