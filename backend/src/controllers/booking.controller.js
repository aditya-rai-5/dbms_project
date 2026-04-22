const bookingService = require('../services/booking.service');
const { success, paginated } = require('../utils/response.utils');

const getUserBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await bookingService.getUserBookings(req.user.id, { page, limit, status });
    paginated(res, result.bookings, page, limit, result.total);
  } catch (err) { next(err); }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    success(res, booking);
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
    success(res, booking, 'Booking cancelled');
  } catch (err) { next(err); }
};

module.exports = { getUserBookings, getBookingById, cancelBooking };
