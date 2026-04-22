import api from './api.service';

export const getMovies = async (page = 1) => {
  const res = await api.get(`/movies?page=${page}`);
  return res.data;
};

export const getTopRated = async (page = 1) => {
  const res = await api.get(`/movie/top_rated?page=${page}`);
  return res.data;
};

export const getPopular = async (page = 1) => {
  const res = await api.get(`/movie/popular?page=${page}`);
  return res.data;
};

export const getUpcoming = async (page = 1) => {
  const res = await api.get(`/movie/now-playing?page=${page}`);
  return res.data;
};

export const getNowPlaying = async (page = 1) => {
  const res = await api.get(`/movie/now-playing?page=${page}`);
  return res.data;
};

export const getMovieById = async (id) => {
  const res = await api.get(`/movies/${id}`);
  return res.data;
};

export const getMovieCast = async (id) => {
  const res = await api.get(`/movies/${id}/credits`);
  return res.data;
};

export const getSimilarMovies = async (id) => {
  const res = await api.get(`/movies/${id}/similar`);
  return res.data;
};

export const getRecommendedMovies = async (id) => {
  const res = await api.get(`/movies/${id}/recommendations`);
  return res.data;
};

export const searchMovies = async (q, page = 1) => {
  const res = await api.get(`/movie/search?q=${encodeURIComponent(q)}&page=${page}`);
  return res.data;
};

export const getMovieShows = async (id, { date, city } = {}) => {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (city) params.set('city', city);
  const res = await api.get(`/movies/${id}/shows?${params}`);
  return res.data;
};
