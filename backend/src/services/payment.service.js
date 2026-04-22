
const { NotFoundError, ConflictError } = require('../utils/errors');

const prisma = require('../config/prisma');

/**
 * Simulate payment: validates seat locks, creates a CONFIRMED booking + SUCCESS payment
 * in one atomic transaction. This replaces the Razorpay two-step flow.
 */
const simulatePayment = async (userId, { showId, seatIds }) => {
  const show = await prisma.show.findUnique({
    where: { id: Number(showId) },
    include: {
      screen: { include: { seats: { where: { id: { in: seatIds } } } } },
    },
  });
  if (!show) throw new NotFoundError('Show');

  const now = new Date();

  // Validate all requested seats have active locks by THIS user
  const locks = await prisma.seatLock.findMany({
    where: {
      showId: Number(showId),
      seatId: { in: seatIds },
      userId,
      expiresAt: { gt: now },
    },
  });

  if (locks.length !== seatIds.length) {
    throw new ConflictError('Seat locks have expired. Please go back and re-select your seats.');
  }

  // Check seats not already in a confirmed/pending booking
  const alreadyBooked = await prisma.bookingSeat.findMany({
    where: {
      seatId: { in: seatIds },
      booking: { showId: Number(showId), status: { in: ['CONFIRMED', 'PENDING'] } },
    },
  });
  if (alreadyBooked.length > 0) throw new ConflictError('One or more seats are already booked');

  const seats = show.screen.seats;
  const totalAmount = seats.reduce((sum, seat) => sum + (seat.price || show.basePrice), 0);

  // Single transaction: create booking (CONFIRMED) + payment (SUCCESS) + update show + release locks
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        userId,
        showId: Number(showId),
        totalAmount,
        status: 'CONFIRMED',
        seats: {
          create: seats.map(seat => ({
            seatId: seat.id,
            price: seat.price || show.basePrice,
          })),
        },
      },
      include: {
        seats: { include: { seat: true } },
        show: {
          include: {
            movie: { select: { id: true, title: true, posterPath: true } },
            screen: { include: { theatre: { select: { id: true, name: true, city: true, state: true } } } },
          },
        },
      },
    });

    await tx.payment.create({
      data: {
        bookingId: newBooking.id,
        amount: totalAmount,
        status: 'SUCCESS',
      },
    });

    await tx.show.update({
      where: { id: Number(showId) },
      data: { bookedSeats: { increment: seatIds.length } },
    });

    await tx.seatLock.deleteMany({
      where: { showId: Number(showId), seatId: { in: seatIds }, userId },
    });

    return newBooking;
  });

  return booking;
};

module.exports = { simulatePayment };
