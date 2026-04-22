import api from './api.service';

export const register = async ({ email, name, password }) => {
  const res = await api.post('/auth/register', { email, name, password });
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
