import React, { useEffect, useState } from "react";
import DefaultlayoutHoc from "../layout/Default.layout";
import Poster from "../components/Poster/Poster.Component";
import * as movieService from "../services/movie.service";

const PlayPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch local database movies
        const localMovies = await movieService.getMovies();
        
        // If no local movies present, fall back to TMDB Now Playing generic
        if (localMovies?.results?.length > 0) {
          setMovies(localMovies.results);
        } else {
          const tmdb = await movieService.getNowPlaying();
          setMovies(tmdb?.results || []);
        }
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] pt-12 pb-24 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="w-full flex flex-col items-center justify-center text-center gap-4 mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
            <span className="text-red-400 font-semibold tracking-wider text-xs uppercase">Curated Catalog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-300 to-purple-400 drop-shadow-sm">
            Movies in Theatres
          </h1>
          <p className="text-gray-300/80 text-base md:text-lg max-w-xl mx-auto font-light">
            Explore breathtaking blockbusters and critically acclaimed independent films currently dominating the big screen.
          </p>
        </div>

        <div className="flex flex-wrap -mx-2 mt-8">
          <div className="w-full px-2">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-12">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                  <div key={item} className="flex flex-col gap-3 animate-pulse">
                    <div className="h-64 md:h-[340px] w-full bg-white/5 border border-white/5 rounded-xl shadow-lg"></div>
                    <div className="h-4 w-3/4 bg-white/10 mt-2 rounded"></div>
                    <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                  </div>
                ))}
              </div>
            ) : movies.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-gray-400 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <span className="text-5xl mb-4">🎬</span>
                <p className="text-xl font-medium text-white">No movies currently playing.</p>
                <p className="text-sm text-gray-400 mt-2">Check back later for new releases</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-12">
                {movies.map((movie) => (
                  <div key={movie.id} className="w-full transform transition duration-500 hover:scale-[1.03]">
                    <Poster {...movie} isDark={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(PlayPage);