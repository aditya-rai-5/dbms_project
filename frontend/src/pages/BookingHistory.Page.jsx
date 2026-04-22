import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/Auth.context";
import * as bookingService from "../services/booking.service";
import Loader from "../components/Loader/Loader";

const statusColors = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  FAILED: 'bg-gray-100 text-gray-800',
};

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    bookingService.getUserBookings()
      .then(res => setBookings(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? This action cannot be undone.')) return;
    setCancelling(id);
    try {
      await bookingService.cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally { setCancelling(null); }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 md:px-12 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-6">Start booking tickets for your favourite movies!</p>
          <Link to="/" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-4">
              {/* Movie Poster */}
              <div className="w-16 h-24 flex-shrink-0">
                <img
                  src={`https://image.tmdb.org/t/p/w200${booking.show?.movie?.posterPath}`}
                  alt={booking.show?.movie?.title}
                  className="w-full h-full object-cover rounded"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Booking Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{booking.show?.movie?.title || booking.show?.movie?.originalTitle}</h3>
                    <p className="text-gray-500 text-sm">
                      {booking.show?.screen?.theatre?.name} • {booking.show?.screen?.theatre?.city}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {booking.show?.showTime && new Date(booking.show.showTime).toLocaleString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Seats:{" "}
                      <strong>
                        {booking.seats?.map(s => `${s.seat?.row}${s.seat?.number}`).join(', ')}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                    <p className="text-lg font-bold text-gray-800 mt-1">₹{booking.totalAmount}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/bookings/${booking.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                  {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {cancelling === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefaultlayoutHoc(BookingHistoryPage);
