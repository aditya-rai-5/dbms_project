import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth.context";
import * as movieService from "../../services/movie.service";

const ShowTimings = ({ movieId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    const date = selectedDate || dates[0].toISOString().split('T')[0];
    movieService.getMovieShows(movieId, { date })
      .then(res => setShows(res.data || []))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, selectedDate]);

  const handleBook = (showId) => {
    if (!user) {
      alert('Please sign in to book tickets');
      return;
    }
    navigate(`/show/${showId}/book`);
  };

  // Group by theatre
  const byTheatre = shows.reduce((acc, show) => {
    const key = show.screen.theatre.id;
    if (!acc[key]) acc[key] = { theatre: show.screen.theatre, shows: [] };
    acc[key].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Book Tickets</h2>

      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {dates.map((d, i) => {
          const dateStr = d.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr || (!selectedDate && i === 0);
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isSelected
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
              <div className="text-xs">{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading shows...</div>
      ) : Object.keys(byTheatre).length === 0 ? (
        <div className="text-center py-8 text-gray-500">No shows available for this date.</div>
      ) : (
        <div className="space-y-6">
          {Object.values(byTheatre).map(({ theatre, shows: theatreShows }) => (
            <div key={theatre.id} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800">{theatre.name}</h3>
                <p className="text-gray-500 text-sm">{theatre.address}, {theatre.city}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {theatreShows.map(show => (
                  <button
                    key={show.id}
                    onClick={() => handleBook(show.id)}
                    disabled={show.isFull}
                    className={`px-4 py-2 rounded border text-sm font-medium transition ${
                      show.isFull
                        ? 'border-red-300 text-red-400 cursor-not-allowed bg-red-50'
                        : 'border-green-500 text-green-700 hover:bg-green-50 bg-white'
                    }`}
                  >
                    <div>{new Date(show.showTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs">
                      {show.isFull ? 'Housefull' : `${show.availableSeats} left`}
                    </div>
                    <div className="text-xs text-gray-500">from ₹{show.basePrice}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowTimings;
