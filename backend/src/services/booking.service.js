
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const waitlistService = require('./waitlist.service');

const prisma = require('../config/prisma');

const cancelBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { seats: true },
  });

  if (!booking) throw new NotFoundError('Booking');
  if (booking.userId !== userId) throw new ForbiddenError();
  if (booking.status === 'CANCELLED') throw new ConflictError('Booking already cancelled');
  if (booking.status === 'FAILED') throw new ValidationError('Cannot cancel a failed booking');

  const seatCount = booking.seats.length;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    await tx.show.update({
      where: { id: booking.showId },
      data: { bookedSeats: { decrement: seatCount } },
    });

    return result;
  });

  try {
    await waitlistService.notifyWaitlist(booking.showId, seatCount);
  } catch (e) {
    console.error('Waitlist notification failed:', e.message);
  }

  return updated;
};

const getUserBookings = async (userId, { page = 1, limit = 10, status } = {}) => {
  const skip = (page - 1) * limit;
  const where = { userId, ...(status && { status }) };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        seats: { include: { seat: { select: { row: true, number: true, type: true } } } },
        show: {
          include: {
            movie: { select: { id: true, title: true, originalTitle: true, posterPath: true } },
            screen: { include: { theatre: { select: { name: true, city: true } } } },
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

  return { bookings, total, page: Number(page), limit: Number(limit) };
};

const getBookingById = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      seats: { include: { seat: true } },
      show: {
        include: {
          movie: true,
          screen: { include: { theatre: true } },
        },
      },
      payment: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!booking) throw new NotFoundError('Booking');
  if (booking.userId !== userId) throw new ForbiddenError();

  return booking;
};

module.exports = { cancelBooking, getUserBookings, getBookingById };
