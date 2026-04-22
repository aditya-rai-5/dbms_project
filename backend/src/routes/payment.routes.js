const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

router.post('/simulate',
  authenticate,
  [
    body('showId').isInt({ min: 1 }),
    body('seatIds').isArray({ min: 1, max: 10 }),
  ],
  validate,
  paymentController.simulatePayment
);

module.exports = router;
