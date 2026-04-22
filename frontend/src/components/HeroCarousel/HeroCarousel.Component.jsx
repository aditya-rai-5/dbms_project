import React from "react";
import HeroSlider from "react-slick";
import { NextArrow, PrevArrow } from "./Arrows.Component";
import { Link } from "react-router-dom";

const slickSettings = {
  arrows: true,
  slidesToShow: 3,
  infinite: true,
  dots: true,
  slidesToScroll: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  autoplay: true,
  speed: 600,
  autoplaySpeed: 3000,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 1 } },
  ],
};

const FALLBACK_IMAGES = [
  { id: 976573, backdrop_path: "/jZIYaISP3GBSrVOPfrp98AMa8Ng.jpg", title: "Elemental" },
  { id: 872585, backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg", title: "Oppenheimer" },
  { id: 678512, backdrop_path: "/waBWlJlMpyFb7STkFHfFvJKgwww.jpg", title: "Sound of Freedom" },
  { id: 864168, backdrop_path: "/fIQfdZ6fqf9mIbqBaexbgIEIk5K.jpg", title: "Joy Ride" },
];

const HeroCarousel = ({ movies = [] }) => {
  const displayMovies = movies.length > 0 ? movies : FALLBACK_IMAGES;

  return (
    <div className="bg-gray-100">
      <HeroSlider {...slickSettings}>
        {displayMovies.map((movie, index) => (
          <Link key={movie.id || index} to={`/movie/${movie.id}`}>
            <div className="w-full h-56 md:h-72 lg:h-80 px-1 py-2">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title || movie.original_title}
                className="w-full h-full rounded-xl object-cover shadow-md"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </HeroSlider>
    </div>
  );
};

export default HeroCarousel;
