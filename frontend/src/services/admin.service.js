import api from './api.service';

export const getStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getMovies = async () => {
  const res = await api.get('/admin/movies');
  return res.data;
};

export const addMovieFromTmdb = async (tmdbId) => {
  const res = await api.post('/admin/movies/tmdb', { tmdbId });
  return res.data;
};

export const getShows = async () => {
  const res = await api.get('/admin/shows');
  return res.data;
};

export const createShow = async (data) => {
  const res = await api.post('/admin/shows', data);
  return res.data;
};

export const getTheatres = async () => {
  const res = await api.get('/admin/theatres');
  return res.data;
};

// Reuse existing search functionality via regular movies API for TMDB search
export const searchTmdbMovies = async (query) => {
  const res = await api.get(`/movies/search?q=${query}`);
  return res.data;
};
