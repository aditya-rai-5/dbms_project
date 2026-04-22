const waitlistService = require('../services/waitlist.service');
const { success, created } = require('../utils/response.utils');

const joinWaitlist = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const { seatsWanted = 1 } = req.body;
    const entry = await waitlistService.joinWaitlist(req.user.id, showId, seatsWanted);
    created(res, entry, 'Added to waitlist');
  } catch (err) { next(err); }
};

const leaveWaitlist = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const result = await waitlistService.leaveWaitlist(req.user.id, showId);
    success(res, result, 'Removed from waitlist');
  } catch (err) { next(err); }
};

const getUserWaitlist = async (req, res, next) => {
  try {
    const entries = await waitlistService.getUserWaitlist(req.user.id);
    success(res, entries);
  } catch (err) { next(err); }
};

const getShowWaitlist = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const entries = await waitlistService.getShowWaitlist(showId);
    success(res, entries);
  } catch (err) { next(err); }
};

module.exports = { joinWaitlist, leaveWaitlist, getUserWaitlist, getShowWaitlist };
