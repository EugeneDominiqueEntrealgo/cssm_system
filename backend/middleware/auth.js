const jwt = require('jsonwebtoken');
require('dotenv').config();

const normalizeRole = (role) => {
  const value = typeof role === 'string' ? role.trim().toLowerCase() : role;
  return value === 'user' ? 'client' : value;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      role: normalizeRole(decoded.role)
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    const normalizedUserRole = normalizeRole(req.user.role);
    const allowedRoles = new Set(roles.map(normalizeRole));

    if (!allowedRoles.has(normalizedUserRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };