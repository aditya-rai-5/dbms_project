import React, { useContext } from "react";
import { MovieContext } from "../../context/Movie.context";
import { FaStar } from "react-icons/fa";

const MovieInfo = ({ onBookTickets }) => {
  const { movie } = useContext(MovieContext);
  const genres = movie.genres?.map(({ name }) => name).join(", ");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-extrabold text-white leading-tight">{movie.original_title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-yellow-500 text-black px-2 py-0.5 rounded text-sm font-bold">
          <FaStar className="text-xs" />
          {movie.vote_average?.toFixed(1)}
        </div>
        <span className="text-gray-300 text-sm">{movie.vote_count?.toLocaleString()} ratings</span>
      </div>

      <div className="text-gray-300 space-y-1 text-sm">
        {movie.runtime && <p>{movie.runtime} min</p>}
        {genres && <p>{genres}</p>}
        {movie.release_date && (
          <p>{new Date(movie.release_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        )}
        <p>{movie.original_language?.toUpperCase()}</p>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBookTickets}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg"
        >
          Book Tickets
        </button>
      </div>
    </div>
  );
};

export default MovieInfo;
