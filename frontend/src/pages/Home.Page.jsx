import React, { useEffect, useState } from "react";
import DefaultlayoutHoc from "../layout/Default.layout";
import HeroCarousel from "../components/HeroCarousel/HeroCarousel.Component";
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import * as movieService from "../services/movie.service";

const HomePage = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [premierMovies, setPremierMovies] = useState([]);
  const [onlineStreamEvents, setOnlineStreamEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [localMovies, tmdbNowPlaying, topRated, popular, upcoming] = await Promise.all([
          movieService.getMovies(),
          movieService.getNowPlaying(),
          movieService.getTopRated(),
          movieService.getPopular(),
          movieService.getUpcoming(),
        ]);
        
        // Prioritize local movies with shows. If empty or DB offline, fallback to TMDB.
        const nowShowingData = localMovies?.results?.length > 0 ? localMovies.results : tmdbNowPlaying.results;
        
        setNowShowing(nowShowingData || []);
        setRecommendedMovies(topRated.results || []);
        setPremierMovies(popular.results || []);
        setOnlineStreamEvents(upcoming.results || []);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative pb-12">
      {/* Decorative Vibrant Orbs based on reference image */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-fuchsia-600/30 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute top-1/2 left-1/2 w-[60vw] h-[30vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Hero Carousel */}
      <div className="relative z-10 w-full mb-12 shadow-2xl">
        <HeroCarousel movies={premierMovies.slice(0, 6)} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-12 flex flex-col gap-16">
        
        {/* Now Showing Section */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl hover:bg-white/10 transition duration-500">
          <PosterSlider
            title="Now Showing in Theatres"
            subtitle="Book tickets for the latest movies hitting the big screen"
            posters={nowShowing}
            isDark={true}
            loading={loading}
            link="/plays"
          />
        </section>

        {/* Recommended Section */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl hover:bg-white/10 transition duration-500">
          <PosterSlider
            title="Recommended Movies"
            subtitle="Top rated picks just for you"
            posters={recommendedMovies}
            isDark={true}
            loading={loading}
          />
        </section>

        {/* Premiers Section */}
        <section className="bg-gradient-to-r from-red-900/40 via-transparent to-transparent backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="hidden md:flex mb-8 rounded-xl overflow-hidden shadow-lg border border-white/10">
            <img
              src="https://in.bmscdn.com/discovery-catalog/collections/tr:w-1440,h-120/premiere-rupay-banner-web-collection-202104230555.png"
              alt="Rupay"
              className="w-full object-cover transform hover:scale-105 transition duration-700"
            />
          </div>
          <PosterSlider
            title="Premiers"
            subtitle="Brand new release every Friday"
            posters={premierMovies}
            isDark={true}
            loading={loading}
          />
        </section>

        {/* Online Streaming Section */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl hover:bg-white/10 transition duration-500">
          <PosterSlider
            title="Online Streaming Events"
            subtitle="Watch anytime, anywhere"
            posters={onlineStreamEvents}
            isDark={true}
            loading={loading}
          />
        </section>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(HomePage);
