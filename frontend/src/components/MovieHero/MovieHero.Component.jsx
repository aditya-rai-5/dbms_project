import React, { useContext } from "react";
import { MovieContext } from "../../context/Movie.context";
import MovieInfo from "./MovieInfo.Component";

const MovieHero = ({ onBookTickets }) => {
  const { movie } = useContext(MovieContext);
  const genres = movie.genres?.map(({ name }) => name).join(", ");

  return (
    <>
      <div>
        {/* Mobile */}
        <div className="lg:hidden w-full">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            alt="cover"
            className="w-full object-cover"
            style={{ maxHeight: '280px', objectPosition: 'top' }}
          />
        </div>
        <div className="flex flex-col gap-3 lg:hidden px-4 my-4">
          <h1 className="text-2xl font-bold text-gray-900">{movie.original_title}</h1>
          <div className="text-gray-600 text-sm space-y-1">
            <p>{movie.runtime ? `${movie.runtime} min` : ''}{genres ? ` | ${genres}` : ''}</p>
          </div>
          <button
            onClick={onBookTickets}
            className="bg-red-600 hover:bg-red-700 text-white py-3 font-bold rounded-lg transition text-lg"
          >
            Book Tickets
          </button>
        </div>

        {/* Desktop */}
        <div className="relative hidden w-full lg:block" style={{ height: '30rem' }}>
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt="Backdrop"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.1) 100%)' }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="flex items-start gap-8 px-20 w-full">
              <div className="w-52 h-80 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt="Movie Poster"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 max-w-xl">
                <MovieInfo onBookTickets={onBookTickets} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieHero;
