const router = require('express').Router();
const movieController = require('../controllers/movie.controller');
const showController = require('../controllers/show.controller');

// TMDB-compatible endpoints (used by frontend)
router.get('/top_rated', movieController.getTopRated);
router.get('/popular', movieController.getPopular);
router.get('/upcoming', movieController.getUpcoming);
router.get('/now-playing', movieController.getNowPlaying);
router.get('/search', movieController.searchMovies);

// Movie endpoints
router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieById);
router.get('/:id/credits', movieController.getMovieCast);
router.get('/:id/similar', movieController.getSimilarMovies);
router.get('/:id/recommendations', movieController.getRecommendedMovies);
router.get('/:id/shows', showController.getShowsByMovie);

module.exports = router;
