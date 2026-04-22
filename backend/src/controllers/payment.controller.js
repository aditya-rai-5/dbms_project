const paymentService = require('../services/payment.service');
const { success } = require('../utils/response.utils');

const simulatePayment = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const booking = await paymentService.simulatePayment(req.user.id, { showId, seatIds });
    success(res, booking, 'Payment successful. Booking confirmed.');
  } catch (err) { next(err); }
};

module.exports = { simulatePayment };
