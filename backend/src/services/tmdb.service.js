const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '00ce4434ecb42ea6fe9649ab13ef3302';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const formatMovie = (movie) => ({
  id: movie.id,
  tmdb_id: movie.id,
  title: movie.title,
  original_title: movie.original_title,
  overview: movie.overview,
  backdrop_path: movie.backdrop_path,
  poster_path: movie.poster_path,
  runtime: movie.runtime || 0,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  popularity: movie.popularity,
  original_language: movie.original_language,
  adult: movie.adult,
  genres: movie.genres || [],
});

const formatCast = (castMember) => ({
  id: castMember.id,
  original_name: castMember.name || castMember.original_name,
  character: castMember.character,
  profile_path: castMember.profile_path,
  order: castMember.order,
});

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const getNowPlaying = async ({ page = 1 } = {}) => {
  const response = await tmdbApi.get('/movie/now_playing', { params: { page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

const getPopular = async ({ page = 1 } = {}) => {
  const response = await tmdbApi.get('/movie/popular', { params: { page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

const getUpcoming = async ({ page = 1 } = {}) => {
  const response = await tmdbApi.get('/movie/upcoming', { params: { page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

const getTopRated = async ({ page = 1 } = {}) => {
  const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

const getMovieById = async (id) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}`, { params: { append_to_response: 'credits' } });
    return formatMovie(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error('Movie not found');
    }
    throw err;
  }
};

const getMovieCast = async (id) => {
  const response = await tmdbApi.get(`/movie/${id}/credits`);
  return response.data.cast.map(formatCast);
};

const getSimilarMovies = async (id, { page = 1 } = {}) => {
  const response = await tmdbApi.get(`/movie/${id}/similar`, { params: { page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

const getRecommendedMovies = async (id, { page = 1 } = {}) => {
  const response = await tmdbApi.get(`/movie/${id}/recommendations`, { params: { page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

const searchMovies = async (query, { page = 1 } = {}) => {
  const response = await tmdbApi.get('/search/movie', { params: { query, page } });
  return {
    results: response.data.results.map(formatMovie),
    total: response.data.total_results,
    page: response.data.page,
    limit: 20,
  };
};

module.exports = {
  getNowPlaying,
  getPopular,
  getUpcoming,
  getTopRated,
  getMovieById,
  getMovieCast,
  getSimilarMovies,
  getRecommendedMovies,
  searchMovies,
};
