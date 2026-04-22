
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const config = require('../config/config');

const prisma = require('../config/prisma');

const lockSeats = async (showId, seatIds, userId) => {
  const show = await prisma.show.findUnique({ where: { id: Number(showId) } });
  if (!show) throw new NotFoundError('Show');

  if (!seatIds || seatIds.length === 0) throw new ValidationError('No seats specified');
  if (seatIds.length > 10) throw new ValidationError('Cannot lock more than 10 seats at once');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.seatLockMinutes * 60 * 1000);

  // Expire stale locks
  await prisma.seatLock.deleteMany({
    where: { showId: Number(showId), expiresAt: { lt: now } },
  });

  // Check seats belong to this show's screen
  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds }, screenId: show.screenId },
  });
  if (seats.length !== seatIds.length) throw new ValidationError('Invalid seat selection');

  // Check for already booked
  const booked = await prisma.bookingSeat.findMany({
    where: {
      seatId: { in: seatIds },
      booking: { showId: Number(showId), status: { in: ['CONFIRMED', 'PENDING'] } },
    },
  });
  if (booked.length > 0) throw new ConflictError('One or more seats are already booked');

  // Check for active locks by OTHER users
  const activeLocks = await prisma.seatLock.findMany({
    where: {
      seatId: { in: seatIds },
      showId: Number(showId),
      expiresAt: { gt: now },
      userId: { not: userId },
    },
  });
  if (activeLocks.length > 0) throw new ConflictError('One or more seats are currently locked by another user');

  // Upsert locks (idempotent — same user re-locks same seats)
  const lockData = seatIds.map(seatId => ({
    seatId,
    showId: Number(showId),
    userId,
    expiresAt,
  }));

  await prisma.$transaction(
    lockData.map(lock =>
      prisma.seatLock.upsert({
        where: { seatId_showId: { seatId: lock.seatId, showId: lock.showId } },
        update: { userId, expiresAt },
        create: lock,
      })
    )
  );

  return { lockedSeats: seatIds, expiresAt, lockMinutes: config.seatLockMinutes };
};

const unlockSeats = async (showId, seatIds, userId) => {
  await prisma.seatLock.deleteMany({
    where: {
      showId: Number(showId),
      seatId: { in: seatIds },
      userId,
    },
  });
  return { unlockedSeats: seatIds };
};

const unlockAllUserSeats = async (showId, userId) => {
  await prisma.seatLock.deleteMany({
    where: { showId: Number(showId), userId },
  });
};

module.exports = { lockSeats, unlockSeats, unlockAllUserSeats };
