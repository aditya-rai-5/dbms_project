import { BiMenu, BiSearch, BiX, BiChevronRight } from "react-icons/bi";
import { MdConfirmationNumber } from "react-icons/md";
import AuthModal from "../Modal/Modal.Component";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth.context";
import * as movieService from "../../services/movie.service";

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await movieService.searchMovies(query);
        setResults((res.data || []).slice(0, 5));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="w-full flex items-center gap-2 bg-white px-3 py-1.5 rounded-md">
        <BiSearch className="text-gray-400 flex-shrink-0" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none text-gray-800 text-sm"
          placeholder="Search movies, events, plays..."
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }}>
            <BiX className="text-gray-400" />
          </button>
        )}
      </div>
      {(results.length > 0 || searching) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl rounded-md z-50 border border-gray-100 overflow-hidden">
          {searching && <div className="px-4 py-2 text-gray-500 text-sm">Searching...</div>}
          {results.map(movie => (
            <button
              key={movie.id}
              onClick={() => { navigate(`/movie/${movie.id}`); setQuery(''); setResults([]); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
            >
              <img
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                alt={movie.title}
                className="w-8 h-12 object-cover rounded"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div>
                <p className="text-gray-800 text-sm font-medium">{movie.title}</p>
                <p className="text-gray-400 text-xs">{movie.release_date?.split('-')[0]}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavLg({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <div className="container flex mx-auto px-4 items-center justify-between">
      <div className="flex items-center w-3/5 gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <MdConfirmationNumber className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ShowsNow</span>
        </Link>
        <SearchBar />
      </div>
      <div className="flex items-center gap-3 relative">
        {user && (
          <Link
            to="/bookings"
            className="text-gray-300 hover:text-white text-sm flex items-center gap-1 transition"
          >
            <MdConfirmationNumber />
            My Bookings
          </Link>
        )}
        <AuthModal />

        <button onClick={onMenuClick} className="w-7 h-7 text-white hover:text-gray-300 transition">
          <BiMenu className="w-full h-full" />
        </button>
      </div>
    </div>
  );
}

function NavSm({ onMenuClick }) {
  const { user } = useAuth();
  return (
    <div className="text-white flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
          <MdConfirmationNumber className="text-white" />
        </div>
        <h3 className="text-lg font-bold">ShowsNow</h3>
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <Link to="/bookings" className="text-gray-300 hover:text-white mt-1">
            <MdConfirmationNumber className="text-xl" />
          </Link>
        )}
        <button onClick={onMenuClick}>
          <BiMenu className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <nav className="bg-darkBackground-700 px-4 py-3 relative z-40 shadow-md">
        <div className="md:hidden">
          <NavSm onMenuClick={() => setIsMenuOpen(true)} />
        </div>
        <div className="hidden md:flex">
          <NavLg onMenuClick={() => setIsMenuOpen(true)} />
        </div>
      </nav>

      {/* Side Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-50 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-darkBackground-700 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">{user ? `Hey, ${user.name || user.email.split('@')[0]}` : "Hey!"}</h2>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="hover:bg-red-600 p-1 rounded-full transition"
              >
                <BiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 flex flex-col">
              <Link to="/notifications" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Notifications</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
              <Link to="/bookings" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Your Orders</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
              <Link to="/coming-soon" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Stream Library</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
              <Link to="/coming-soon" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Play Credit Card</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
              <Link to="/coming-soon" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Help & Support</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Account & Settings</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
              <Link to="/coming-soon" onClick={() => setIsMenuOpen(false)} className="py-3 border-b border-gray-100 group cursor-pointer flex justify-between items-center">
                <span className="text-gray-700 group-hover:text-red-500 font-medium">Rewards</span>
                <BiChevronRight className="text-gray-400 group-hover:text-red-500" />
              </Link>
            </div>
            
            <div className="bg-gray-50 mt-auto p-4 flex justify-center text-gray-400 text-xs text-center border-t border-gray-200">
              ShowsNow Inc. © 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
