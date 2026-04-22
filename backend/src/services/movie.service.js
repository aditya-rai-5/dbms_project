
const { NotFoundError } = require('../utils/errors');

const prisma = require('../config/prisma');

const movieSelect = {
  id: true,
  title: true,
  originalTitle: true,
  overview: true,
  backdropPath: true,
  posterPath: true,
  runtime: true,
  releaseDate: true,
  voteAverage: true,
  voteCount: true,
  popularity: true,
  language: true,
  adult: true,
  tmdbId: true,
  genres: { select: { id: true, name: true } },
};

const formatMovie = (movie) => ({
  id: movie.id,
  tmdb_id: movie.tmdbId,
  title: movie.title,
  original_title: movie.originalTitle,
  overview: movie.overview,
  backdrop_path: movie.backdropPath,
  poster_path: movie.posterPath,
  runtime: movie.runtime,
  release_date: movie.releaseDate,
  vote_average: movie.voteAverage,
  vote_count: movie.voteCount,
  popularity: movie.popularity,
  original_language: movie.language,
  adult: movie.adult,
  genres: movie.genres || [],
});

const getMovies = async ({ page = 1, limit = 20, sort = 'popularity', genre } = {}) => {
  const skip = (page - 1) * limit;
  const orderBy = sort === 'rating' ? { voteAverage: 'desc' }
    : sort === 'newest' ? { releaseDate: 'desc' }
    : sort === 'title' ? { title: 'asc' }
    : { popularity: 'desc' };

  const where = genre ? { genres: { some: { name: genre } } } : {};

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({ where, select: movieSelect, orderBy, skip, take: Number(limit) }),
    prisma.movie.count({ where }),
  ]);

  return { results: movies.map(formatMovie), total, page: Number(page), limit: Number(limit) };
};

const getMovieById = async (id) => {
  const movie = await prisma.movie.findUnique({
    where: { id: Number(id) },
    select: {
      ...movieSelect,
      cast: {
        select: { id: true, name: true, character: true, profilePath: true, order: true },
        orderBy: { order: 'asc' },
        take: 20,
      },
    },
  });
  if (!movie) throw new NotFoundError('Movie');
  return formatMovie(movie);
};

const getMovieCast = async (id) => {
  const movie = await prisma.movie.findUnique({
    where: { id: Number(id) },
    select: {
      cast: {
        select: { id: true, name: true, character: true, profilePath: true, order: true },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!movie) throw new NotFoundError('Movie');

  return movie.cast.map(c => ({
    id: c.id,
    original_name: c.name,
    character: c.character,
    profile_path: c.profilePath,
    order: c.order,
  }));
};

const getSimilarMovies = async (id) => {
  const movie = await prisma.movie.findUnique({
    where: { id: Number(id) },
    select: { genres: { select: { id: true } } },
  });
  if (!movie) throw new NotFoundError('Movie');

  const genreIds = movie.genres.map(g => g.id);
  const movies = await prisma.movie.findMany({
    where: {
      genres: { some: { id: { in: genreIds } } },
      id: { not: Number(id) },
    },
    select: movieSelect,
    orderBy: { popularity: 'desc' },
    take: 10,
  });

  return { results: movies.map(formatMovie) };
};

const getRecommendedMovies = async (id) => {
  const movies = await prisma.movie.findMany({
    where: { id: { not: Number(id) } },
    select: movieSelect,
    orderBy: { voteAverage: 'desc' },
    take: 10,
  });
  return { results: movies.map(formatMovie) };
};

const searchMovies = async (query, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const where = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { originalTitle: { contains: query, mode: 'insensitive' } },
      { overview: { contains: query, mode: 'insensitive' } },
    ],
  };

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({ where, select: movieSelect, skip, take: Number(limit), orderBy: { popularity: 'desc' } }),
    prisma.movie.count({ where }),
  ]);

  return { results: movies.map(formatMovie), total, page: Number(page), limit: Number(limit) };
};

const getTopRated = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [movies, total] = await Promise.all([
    prisma.movie.findMany({ select: movieSelect, orderBy: { voteAverage: 'desc' }, skip, take: Number(limit) }),
    prisma.movie.count(),
  ]);
  return { results: movies.map(formatMovie), total };
};

const getPopular = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [movies, total] = await Promise.all([
    prisma.movie.findMany({ select: movieSelect, orderBy: { popularity: 'desc' }, skip, take: Number(limit) }),
    prisma.movie.count(),
  ]);
  return { results: movies.map(formatMovie), total };
};

const getUpcoming = async ({ page = 1, limit = 20 } = {}) => {
  const today = new Date();
  const skip = (page - 1) * limit;
  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where: { releaseDate: { gte: today } },
      select: movieSelect,
      orderBy: { releaseDate: 'asc' },
      skip,
      take: Number(limit),
    }),
    prisma.movie.count({ where: { releaseDate: { gte: today } } }),
  ]);
  // Fall back to all movies sorted by release date if none upcoming
  if (movies.length === 0) {
    const fallback = await prisma.movie.findMany({
      select: movieSelect,
      orderBy: { releaseDate: 'desc' },
      take: Number(limit),
    });
    return { results: fallback.map(formatMovie), total: fallback.length };
  }
  return { results: movies.map(formatMovie), total };
};

const createMovie = async (data) => {
  const { genres, cast, ...movieData } = data;
  const movie = await prisma.movie.create({
    data: {
      ...movieData,
      genres: genres ? { connect: genres.map(id => ({ id })) } : undefined,
      cast: cast ? { create: cast } : undefined,
    },
    select: movieSelect,
  });
  return formatMovie(movie);
};

module.exports = {
  getMovies, getMovieById, getMovieCast, getSimilarMovies, getRecommendedMovies,
  searchMovies, getTopRated, getPopular, getUpcoming, createMovie,
};
