
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

const prisma = require('../config/prisma');

const joinWaitlist = async (userId, showId, seatsWanted = 1) => {
  const show = await prisma.show.findUnique({ where: { id: Number(showId) } });
  if (!show) throw new NotFoundError('Show');

  if (show.bookedSeats < show.totalSeats) {
    throw new ValidationError('Seats are still available — no need to join waitlist');
  }

  if (seatsWanted < 1 || seatsWanted > 10) throw new ValidationError('seatsWanted must be 1–10');

  const existing = await prisma.waitlistEntry.findUnique({
    where: { userId_showId: { userId, showId: Number(showId) } },
  });
  if (existing) throw new ConflictError('You are already on the waitlist for this show');

  const entry = await prisma.waitlistEntry.create({
    data: { userId, showId: Number(showId), seatsWanted },
    include: {
      show: {
        include: {
          movie: { select: { id: true, title: true } },
          screen: { include: { theatre: { select: { name: true } } } },
        },
      },
    },
  });

  const position = await prisma.waitlistEntry.count({
    where: { showId: Number(showId), createdAt: { lte: entry.createdAt } },
  });

  return { ...entry, position };
};

const leaveWaitlist = async (userId, showId) => {
  const entry = await prisma.waitlistEntry.findUnique({
    where: { userId_showId: { userId, showId: Number(showId) } },
  });
  if (!entry) throw new NotFoundError('Waitlist entry');

  await prisma.waitlistEntry.delete({
    where: { userId_showId: { userId, showId: Number(showId) } },
  });

  return { removed: true };
};

const getUserWaitlist = async (userId) => {
  const entries = await prisma.waitlistEntry.findMany({
    where: { userId },
    include: {
      show: {
        include: {
          movie: { select: { id: true, title: true, posterPath: true } },
          screen: { include: { theatre: { select: { name: true, city: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return entries;
};

const getShowWaitlist = async (showId) => {
  const entries = await prisma.waitlistEntry.findMany({
    where: { showId: Number(showId) },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return entries;
};

const notifyWaitlist = async (showId, availableSeats) => {
  if (availableSeats <= 0) return;

  const entries = await prisma.waitlistEntry.findMany({
    where: { showId: Number(showId), notified: false, seatsWanted: { lte: availableSeats } },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (entries.length === 0) return;

  // In production, send email/push notifications here.
  // For now, mark them as notified.
  const idsToNotify = entries.slice(0, 3).map(e => e.id);

  await prisma.waitlistEntry.updateMany({
    where: { id: { in: idsToNotify } },
    data: { notified: true },
  });

  console.log(`📢 Notified ${idsToNotify.length} waitlist users for show ${showId}`);
  return entries.slice(0, 3);
};

module.exports = { joinWaitlist, leaveWaitlist, getUserWaitlist, getShowWaitlist, notifyWaitlist };
