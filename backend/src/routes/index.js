const router = require('express').Router();

const authRoutes = require('./auth.routes');
const movieRoutes = require('./movie.routes');
const showRoutes = require('./show.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const waitlistRoutes = require('./waitlist.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/movie', movieRoutes);   // /api/movie/top_rated etc (TMDB-compatible)
router.use('/movies', movieRoutes);  // also /api/movies/:id
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'ShowsNow API is running', timestamp: new Date() });
});

module.exports = router;
