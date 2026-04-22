const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.adminGetStats);
router.get('/genres', adminController.getGenres);

// Movies
router.get('/movies', adminController.adminGetMovies);
router.post('/movies', adminController.adminCreateMovie);
router.post('/movies/tmdb', adminController.addMovieFromTmdb);
router.put('/movies/:id', adminController.adminUpdateMovie);
router.delete('/movies/:id', adminController.adminDeleteMovie);

// Theatres & Screens
router.get('/theatres', adminController.getTheatres);
router.post('/theatres', adminController.createTheatre);
router.post('/screens', adminController.createScreen);

// Shows
router.get('/shows', adminController.adminGetShows);
router.post('/shows', adminController.adminCreateShow);

// Bookings
router.get('/bookings', adminController.adminGetAllBookings);

module.exports = router;
