const { verify } = require('../utils/jwt.utils');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');


const prisma = require('../config/prisma');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verify(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new UnauthorizedError('User no longer exists');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { authenticate, requireAdmin, optionalAuth };
