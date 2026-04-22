const router = require('express').Router();
const showController = require('../controllers/show.controller');
const seatController = require('../controllers/seat.controller');
const waitlistController = require('../controllers/waitlist.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

router.get('/', showController.getAllShows);
router.get('/:id', showController.getShowById);
router.get('/:id/seats', showController.getShowSeats);

router.post('/:id/lock-seats',
  authenticate,
  [body('seatIds').isArray({ min: 1, max: 10 })],
  validate,
  seatController.lockSeats
);

router.delete('/:id/lock-seats',
  authenticate,
  [body('seatIds').isArray({ min: 1 })],
  validate,
  seatController.unlockSeats
);

router.post('/:showId/waitlist', authenticate, waitlistController.joinWaitlist);
router.delete('/:showId/waitlist', authenticate, waitlistController.leaveWaitlist);
router.get('/:showId/waitlist', authenticate, waitlistController.getShowWaitlist);

module.exports = router;
