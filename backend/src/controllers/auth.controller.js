const authService = require('../services/auth.service');
const { success, created } = require('../utils/response.utils');

const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const result = await authService.register({ email, name, password });
    created(res, result, 'Registration successful');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    success(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    success(res, user);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
