const router = require('express').Router();
const waitlistController = require('../controllers/waitlist.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', waitlistController.getUserWaitlist);

module.exports = router;
