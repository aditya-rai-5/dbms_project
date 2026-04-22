
const movieService = require('../services/movie.service');
const tmdbService = require('../services/tmdb.service');
const showService = require('../services/show.service');
const { success, created, paginated } = require('../utils/response.utils');

const prisma = require('../config/prisma');

// Movies
const adminGetMovies = async (req, res, next) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' }
    });
    success(res, movies);
  } catch (err) { next(err); }
};

const adminCreateMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);
    created(res, movie, 'Movie created');
  } catch (err) { next(err); }
};

const addMovieFromTmdb = async (req, res, next) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) {
      return res.status(400).json({ success: false, message: 'tmdbId is required' });
    }
    
    // Check if it already exists
    const existing = await prisma.movie.findUnique({ where: { tmdbId: Number(tmdbId) } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Movie already exists in database' });
    }

    // Fetch from TMDB
    const tmdbData = await tmdbService.getMovieById(tmdbId);
    
    // Format for Prisma creation using correct camelCase
    const dataToCreate = {
      tmdbId: Number(tmdbData.id),
      title: tmdbData.title,
      originalTitle: tmdbData.original_title,
      overview: tmdbData.overview,
      backdropPath: tmdbData.backdrop_path,
      posterPath: tmdbData.poster_path,
      runtime: tmdbData.runtime,
      releaseDate: tmdbData.release_date ? new Date(tmdbData.release_date) : null,
      voteAverage: tmdbData.vote_average,
      voteCount: tmdbData.vote_count,
      popularity: tmdbData.popularity,
      language: tmdbData.original_language || 'en',
      adult: tmdbData.adult || false,
    };

    const movie = await prisma.movie.create({
      data: dataToCreate
    });

    created(res, movie, 'Movie added from TMDB');
  } catch (err) {
    next(err);
  }
};

const adminUpdateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { genres, cast, ...data } = req.body;
    const movie = await prisma.movie.update({
      where: { id: Number(id) },
      data: {
        ...data,
        genres: genres ? { set: genres.map(gid => ({ id: gid })) } : undefined,
      },
    });
    success(res, movie, 'Movie updated');
  } catch (err) { next(err); }
};

const adminDeleteMovie = async (req, res, next) => {
  try {
    await prisma.movie.delete({ where: { id: Number(req.params.id) } });
    success(res, null, 'Movie deleted');
  } catch (err) { next(err); }
};

// Theatres
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await prisma.theatre.create({ data: req.body });
    created(res, theatre, 'Theatre created');
  } catch (err) { next(err); }
};

const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const theatres = await prisma.theatre.findMany({
      where: city ? { city: { contains: city, mode: 'insensitive' } } : {},
      include: { screens: { select: { id: true, name: true, totalSeats: true } } },
    });
    success(res, theatres);
  } catch (err) { next(err); }
};

const createScreen = async (req, res, next) => {
  try {
    const { name, totalSeats, theatreId, rows, seatsPerRow, seatTypes } = req.body;
    const screen = await prisma.$transaction(async (tx) => {
      const newScreen = await tx.screen.create({ data: { name, totalSeats, theatreId } });

      const rowLabels = rows || ['A','B','C','D','E','F','G','H'];
      const perRow = seatsPerRow || Math.floor(totalSeats / rowLabels.length);
      const seatData = [];

      for (const row of rowLabels) {
        for (let n = 1; n <= perRow; n++) {
          const type = seatTypes?.[row] || 'STANDARD';
          const price = type === 'VIP' ? 450 : type === 'PREMIUM' ? 280 : 180;
          seatData.push({ row, number: n, type, price, screenId: newScreen.id });
        }
      }
      await tx.seat.createMany({ data: seatData });
      return newScreen;
    });
    created(res, screen, 'Screen created with seats');
  } catch (err) { next(err); }
};

// Shows
const adminGetShows = async (req, res, next) => {
  try {
    const shows = await prisma.show.findMany({
      include: {
        movie: { select: { id: true, title: true } },
        screen: { include: { theatre: { select: { name: true, city: true } } } },
      },
      orderBy: { showTime: 'desc' },
    });
    success(res, shows);
  } catch (err) { next(err); }
};

const adminCreateShow = async (req, res, next) => {
  try {
    const show = await showService.createShow(req.body);
    created(res, show, 'Show created');
  } catch (err) { next(err); }
};

const adminGetAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          show: {
            include: {
              movie: { select: { id: true, title: true } },
              screen: { include: { theatre: { select: { name: true } } } },
            },
          },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.booking.count({ where }),
    ]);
    paginated(res, bookings, page, limit, total);
  } catch (err) { next(err); }
};

const adminGetStats = async (req, res, next) => {
  try {
    const [totalUsers, totalMovies, totalBookings, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
    ]);
    success(res, {
      totalUsers,
      totalMovies,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
    });
  } catch (err) { next(err); }
};

const getGenres = async (req, res, next) => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
    success(res, genres);
  } catch (err) { next(err); }
};

module.exports = {
  adminGetMovies, adminCreateMovie, addMovieFromTmdb, adminUpdateMovie, adminDeleteMovie,
  createTheatre, getTheatres, createScreen,
  adminGetShows, adminCreateShow, adminGetAllBookings, adminGetStats, getGenres,
};
