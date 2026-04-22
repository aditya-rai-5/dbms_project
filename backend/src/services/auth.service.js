const bcrypt = require('bcryptjs');

const { sign } = require('../utils/jwt.utils');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

const prisma = require('../config/prisma');

const register = async ({ email, name, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const token = sign({ id: user.id, email: user.email, role: user.role });
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const token = sign({ id: user.id, email: user.email, role: user.role });
  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
};

module.exports = { register, login, getMe };
