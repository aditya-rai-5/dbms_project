const tmdbService = require('../services/tmdb.service');
const { success, paginated } = require('../utils/response.utils');


const prisma = require('../config/prisma');

const getMovies = async (req, res, next) => {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        shows: { some: {} }
      },
      include: {
        shows: true
      }
    });
    
    // Format to match TMDB response structure that frontend expects
    const formattedMovies = movies.map(m => ({
      id: m.tmdbId || m.id,
      title: m.title,
      original_title: m.originalTitle,
      poster_path: m.posterPath,
      backdrop_path: m.backdropPath,
      release_date: m.releaseDate,
      vote_average: m.voteAverage,
      isLocal: true // flag to indicate it's from local DB
    }));

    res.json({ success: true, results: formattedMovies, total: formattedMovies.length, page: 1, limit: 20 });
  } catch (err) {
    console.warn("⚠️ Failed to fetch local movies. Ensure Prisma DB is running:", err.message);
    res.json({ success: true, results: [], total: 0, page: 1, limit: 20 });
  }
};

const getTopRated = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await tmdbService.getTopRated({ page });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getPopular = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await tmdbService.getPopular({ page });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getUpcoming = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await tmdbService.getUpcoming({ page });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getNowPlaying = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await tmdbService.getNowPlaying({ page });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getMovieById = async (req, res, next) => {
  try {
    const movie = await tmdbService.getMovieById(req.params.id);
    success(res, movie);
  } catch (err) { next(err); }
};

const getMovieCast = async (req, res, next) => {
  try {
    const cast = await tmdbService.getMovieCast(req.params.id);
    res.json({ success: true, cast });
  } catch (err) { next(err); }
};

const getSimilarMovies = async (req, res, next) => {
  try {
    const result = await tmdbService.getSimilarMovies(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getRecommendedMovies = async (req, res, next) => {
  try {
    const result = await tmdbService.getRecommendedMovies(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const searchMovies = async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    const result = await tmdbService.searchMovies(q || '', { page });
    paginated(res, result.results, page, result.limit, result.total);
  } catch (err) { next(err); }
};

// Keeping createMovie so router doesn't crash if it was somehow wired elsewhere
const createMovie = async (req, res, next) => {
  res.status(405).json({ success: false, message: "Create movie not supported via TMDB" });
};

module.exports = {
  getMovies, getTopRated, getPopular, getUpcoming, getNowPlaying, getMovieById,
  getMovieCast, getSimilarMovies, getRecommendedMovies, searchMovies, createMovie,
};
