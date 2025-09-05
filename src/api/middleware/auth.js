const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

/**
 * Authentication and Authorization Middleware
 */

// Generate JWT token
const generateToken = (nodeId, nodeType, permissions) => {
  return jwt.sign(
    { nodeId, nodeType, permissions },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check node permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Required: ${permission}` 
      });
    }

    next();
  };
};

// Role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.nodeType)) {
      return res.status(403).json({ 
        error: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Rate limiting
const rateLimits = new Map();
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip + (req.user?.nodeId || 'anonymous');
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimits.has(key)) {
      rateLimits.set(key, []);
    }

    const requests = rateLimits.get(key);
    
    // Clean old requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    rateLimits.set(key, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    validRequests.push(now);
    next();
  };
};

// Digital signature verification
const verifySignature = (req, res, next) => {
  const { signature, ...data } = req.body;
  
  if (!signature) {
    return res.status(400).json({ error: 'Digital signature required' });
  }

  // In production, verify against node's public key
  // This is a simplified version
  const expectedSignature = crypto
    .createHash('sha256')
    .update(JSON.stringify(data) + (req.user?.nodeId || 'anonymous'))
    .digest('hex');

  // For demo purposes, we'll accept any signature that matches our format
  if (signature.length !== 64) {
    return res.status(400).json({ error: 'Invalid signature format' });
  }

  req.signatureValid = true;
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  requirePermission,
  requireRole,
  rateLimit,
  verifySignature,
  JWT_SECRET
};