
const { NotFoundError } = require('../utils/errors');

const prisma = require('../config/prisma');

const getShowsByMovie = async (movieId, { date, city } = {}) => {
  const where = { movieId: Number(movieId) };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.showTime = { gte: start, lte: end };
  } else {
    where.showTime = { gte: new Date() };
  }

  const shows = await prisma.show.findMany({
    where,
    include: {
      screen: {
        include: {
          theatre: { select: { id: true, name: true, address: true, city: true, state: true } },
        },
      },
      movie: { select: { id: true, title: true, originalTitle: true, posterPath: true, runtime: true } },
    },
    orderBy: { showTime: 'asc' },
  });

  // Filter by city if provided
  const filtered = city
    ? shows.filter(s => s.screen.theatre.city.toLowerCase().includes(city.toLowerCase()))
    : shows;

  return filtered.map(show => ({
    id: show.id,
    showTime: show.showTime,
    basePrice: show.basePrice,
    totalSeats: show.totalSeats,
    bookedSeats: show.bookedSeats,
    availableSeats: show.totalSeats - show.bookedSeats,
    isFull: show.bookedSeats >= show.totalSeats,
    movie: show.movie,
    screen: {
      id: show.screen.id,
      name: show.screen.name,
      theatre: show.screen.theatre,
    },
  }));
};

const getAllShows = async ({ date, city } = {}) => {
  const where = {};

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.showTime = { gte: start, lte: end };
  } else {
    where.showTime = { gte: new Date() };
  }

  // Filter directly at the database level for efficiency since there are 15,000 shows
  if (city) {
    where.screen = {
      theatre: {
        city: { contains: city, mode: 'insensitive' }
      }
    };
  }

  const shows = await prisma.show.findMany({
    where,
    include: {
      screen: {
        include: {
          theatre: { select: { id: true, name: true, address: true, city: true, state: true } },
        },
      },
      movie: { select: { id: true, title: true, originalTitle: true, posterPath: true, runtime: true } },
    },
    orderBy: { showTime: 'asc' },
  });

  return shows.map(show => ({
    id: show.id,
    showTime: show.showTime,
    basePrice: show.basePrice,
    totalSeats: show.totalSeats,
    bookedSeats: show.bookedSeats,
    availableSeats: show.totalSeats - show.bookedSeats,
    isFull: show.bookedSeats >= show.totalSeats,
    movie: show.movie,
    screen: {
      id: show.screen.id,
      name: show.screen.name,
      theatre: show.screen.theatre,
    },
  }));
};

const getShowById = async (showId) => {
  const show = await prisma.show.findUnique({
    where: { id: Number(showId) },
    include: {
      movie: { select: { id: true, title: true, originalTitle: true, posterPath: true, runtime: true, backdropPath: true } },
      screen: {
        include: {
          theatre: true,
          seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] },
        },
      },
    },
  });

  if (!show) throw new NotFoundError('Show');
  return show;
};

const getShowSeats = async (showId) => {
  const show = await prisma.show.findUnique({ where: { id: Number(showId) } });
  if (!show) throw new NotFoundError('Show');

  const now = new Date();

  const [seats, bookedSeatIds, lockedSeatIds] = await Promise.all([
    prisma.seat.findMany({
      where: { screenId: show.screenId },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    }),
    prisma.bookingSeat.findMany({
      where: { booking: { showId: Number(showId), status: { in: ['CONFIRMED', 'PENDING'] } } },
      select: { seatId: true },
    }),
    prisma.seatLock.findMany({
      where: { showId: Number(showId), expiresAt: { gt: now } },
      select: { seatId: true, userId: true, expiresAt: true },
    }),
  ]);

  const bookedSet = new Set(bookedSeatIds.map(b => b.seatId));
  const lockedMap = new Map(lockedSeatIds.map(l => [l.seatId, l]));

  const seatsByRow = {};
  for (const seat of seats) {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    const lock = lockedMap.get(seat.id);
    seatsByRow[seat.row].push({
      id: seat.id,
      row: seat.row,
      number: seat.number,
      type: seat.type,
      price: seat.price || show.basePrice,
      status: bookedSet.has(seat.id) ? 'BOOKED'
        : lock ? 'LOCKED'
        : 'AVAILABLE',
      lockedUntil: lock?.expiresAt || null,
    });
  }

  return seatsByRow;
};

const createShow = async (data) => {
  const screen = await prisma.screen.findUnique({ where: { id: data.screenId } });
  if (!screen) throw new NotFoundError('Screen');

  const show = await prisma.show.create({
    data: {
      movieId: data.movieId,
      screenId: data.screenId,
      showTime: new Date(data.showTime),
      basePrice: data.basePrice,
      totalSeats: screen.totalSeats,
    },
    include: {
      movie: { select: { id: true, title: true } },
      screen: { include: { theatre: { select: { id: true, name: true } } } },
    },
  });
  return show;
};

module.exports = { getShowsByMovie, getAllShows, getShowById, getShowSeats, createShow };
