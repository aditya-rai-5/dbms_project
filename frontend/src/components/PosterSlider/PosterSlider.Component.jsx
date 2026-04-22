import React from "react";
import Slider from "react-slick";
import Poster from "../Poster/Poster.Component";
import { Link } from "react-router-dom";
import { BiChevronRight } from "react-icons/bi";

const defaultSettings = {
  infinite: false,
  autoplay: false,
  slidesToShow: 5,
  slidesToScroll: 4,
  initialSlide: 0,
  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 3 } },
    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  ],
};

const SkeletonCard = () => (
  <div className="px-2 animate-pulse">
    <div className="bg-gray-200 rounded-md h-40 md:h-72 w-full" />
    <div className="bg-gray-200 rounded h-4 mt-2 w-3/4" />
  </div>
);

const PosterSlider = ({ title, subtitle, posters = [], isDark, config, loading = false, link }) => {
  const settings = { ...defaultSettings, ...(config || {}) };

  return (
    <>
      <div className="flex justify-between items-center my-2 mb-4 sm:px-3">
        <div className="flex flex-col items-start">
          <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
          {subtitle && <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-500"}`}>{subtitle}</p>}
        </div>
        {link && (
          <Link to={link} className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center transition">
            See All <BiChevronRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4">
          {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : posters.length === 0 ? (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No movies available.</p>
      ) : (
        <Slider {...settings}>
          {posters.map((movie, index) => (
            <Poster key={movie.id || index} {...movie} isDark={isDark} />
          ))}
        </Slider>
      )}
    </>
  );
};

export default PosterSlider;
