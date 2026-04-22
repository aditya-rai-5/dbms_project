import React, { useEffect, useState, useContext } from "react";
import MovieLayoutHoc from "../layout/Movie.layout";
import { useParams, useNavigate } from "react-router-dom";
import { MovieContext } from "../context/Movie.context";
import Slider from "react-slick";
import { FaCcVisa, FaCcApplePay } from "react-icons/fa";
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import MovieHero from "../components/MovieHero/MovieHero.Component";
import Cast from "../components/Cast/Cast.Component";
import Loader from "../components/Loader/Loader";
import Footer from "../components/Footer/Footer.Component";
import ShowTimings from "../components/Booking/ShowTimings.Component";
import * as movieService from "../services/movie.service";

const slickConfig = {
  arrows: true,
  slidesToShow: 4,
  infinite: true,
  dots: false,
  autoplay: true,
  speed: 2000,
  autoplaySpeed: 2000,
  cssEase: "linear",
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 600, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
};

const posterSlickConfig = {
  arrows: true,
  slidesToShow: 3,
  infinite: true,
  dots: true,
  autoplay: true,
  speed: 2000,
  autoplaySpeed: 2000,
  cssEase: "linear",
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 600, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
};

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setMovie } = useContext(MovieContext);

  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movieData, setMovieData] = useState(null);
  const [showTimings, setShowTimings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => window.scrollTo(0, 0), 100);

        const [castRes, similarRes, recommendedRes, movieRes] = await Promise.all([
          movieService.getMovieCast(id),
          movieService.getSimilarMovies(id),
          movieService.getRecommendedMovies(id),
          movieService.getMovieById(id),
        ]);

        const movie = movieRes.data;
        setCast(castRes.cast || []);
        setSimilarMovies(similarRes.results || []);
        setRecommendedMovies(recommendedRes.results || []);
        setMovieData(movie);
        setMovie(movie);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, setMovie]);

  if (isLoading) return <Loader />;

  return (
    <>
      <MovieHero onBookTickets={() => setShowTimings(true)} />

      {showTimings && (
        <div className="container mx-auto px-4 lg:px-20 my-8">
          <ShowTimings movieId={id} movieTitle={movieData?.title} />
        </div>
      )}

      <div className="my-12 container px-4 lg:ml-20 lg:w-2/1">
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-gray-800 font-bold text-2xl">About the movie</h1>
          <p className="text-gray-600 leading-relaxed">{movieData?.overview}</p>
        </div>

        <div className="my-8"><hr /></div>

        <div className="my-8">
          <h2 className="text-gray-800 font-bold text-2xl mb-3">Applicable Offers</h2>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex items-start gap-2 bg-yellow-100 p-3 border-yellow-400 border-dashed border-2 rounded-md">
              <div className="w-8 h-8"><FaCcVisa className="w-full h-full" /></div>
              <div className="flex flex-col items-start">
                <h3 className="text-gray-700 text-xl font-bold">Visa Stream Offer</h3>
                <p className="text-gray-600">Get 50% off up to INR 150 on all RuPay card* on ShowsNow Stream.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-yellow-100 p-3 border-yellow-400 border-dashed border-2 rounded-md">
              <div className="w-8 h-8"><FaCcApplePay className="w-full h-full" /></div>
              <div className="flex flex-col items-start">
                <h3 className="text-gray-700 text-xl font-bold">Film Pass</h3>
                <p className="text-gray-600">Get 50% off up to INR 150 on all RuPay card* on ShowsNow Stream.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="my-8"><hr /></div>

        <div className="my-8">
          <h2 className="text-gray-800 font-bold text-2xl mb-4">Cast and Crew</h2>
          {cast.length > 0 ? (
            <Slider {...slickConfig}>
              {cast.map((member) => (
                <Cast
                  key={member.id}
                  image={member.profile_path}
                  castName={member.original_name}
                  role={member.character}
                />
              ))}
            </Slider>
          ) : (
            <p className="text-gray-500">Cast information not available.</p>
          )}
        </div>

        <div className="my-8"><hr /></div>

        <div className="my-8">
          <PosterSlider
            config={posterSlickConfig}
            title="Recommended Movies"
            posters={recommendedMovies}
            isDark={false}
            onMovieClick={() => navigate(`/movie/${id}`)}
          />
        </div>

        <div className="my-8"><hr /></div>

        <div className="my-8">
          <PosterSlider
            config={posterSlickConfig}
            title="SHOWSNOW EXCLUSIVE"
            posters={similarMovies}
            isDark={false}
            onMovieClick={() => navigate(`/movie/${id}`)}
          />
        </div>

        <div className="my-8"><hr /></div>
      </div>
      <Footer />
    </>
  );
};

export default MovieLayoutHoc(MoviePage);
