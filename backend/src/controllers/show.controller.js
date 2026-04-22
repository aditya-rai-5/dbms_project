const showService = require('../services/show.service');
const { success, created } = require('../utils/response.utils');

const getShowsByMovie = async (req, res, next) => {
  try {
    const { id: movieId } = req.params;
    const { date, city } = req.query;
    const shows = await showService.getShowsByMovie(movieId, { date, city });
    success(res, shows);
  } catch (err) { next(err); }
};

const getShowById = async (req, res, next) => {
  try {
    const show = await showService.getShowById(req.params.id);
    success(res, show);
  } catch (err) { next(err); }
};

const getShowSeats = async (req, res, next) => {
  try {
    const seatsByRow = await showService.getShowSeats(req.params.id);
    success(res, seatsByRow);
  } catch (err) { next(err); }
};

const createShow = async (req, res, next) => {
  try {
    const show = await showService.createShow(req.body);
    created(res, show, 'Show created');
  } catch (err) { next(err); }
};

module.exports = { getShowsByMovie, getShowById, getShowSeats, createShow };
