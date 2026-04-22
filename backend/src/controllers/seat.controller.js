const seatService = require('../services/seat.service');
const { success } = require('../utils/response.utils');

const lockSeats = async (req, res, next) => {
  try {
    const { id: showId } = req.params;
    const { seatIds } = req.body;
    const result = await seatService.lockSeats(showId, seatIds, req.user.id);
    success(res, result, 'Seats locked successfully');
  } catch (err) { next(err); }
};

const unlockSeats = async (req, res, next) => {
  try {
    const { id: showId } = req.params;
    const { seatIds } = req.body;
    const result = await seatService.unlockSeats(showId, seatIds, req.user.id);
    success(res, result, 'Seats unlocked');
  } catch (err) { next(err); }
};

module.exports = { lockSeats, unlockSeats };
