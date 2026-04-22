import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/Auth.context";
import * as bookingService from "../services/booking.service";
import Loader from "../components/Loader/Loader";
import SeatSelector from "../components/SeatSelector/SeatSelector.Component";

const BookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [seatsByRow, setSeatsByRow] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  const [waitlistMode, setWaitlistMode] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const fetchSeats = useCallback(async () => {
    const [showRes, seatsRes] = await Promise.all([
      bookingService.getShowById(showId),
      bookingService.getShowSeats(showId),
    ]);
    setShow(showRes.data);
    setSeatsByRow(seatsRes.data || {});
    if (showRes.data?.isFull) setWaitlistMode(true);
  }, [showId]);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchSeats().catch(console.error).finally(() => setLoading(false));
  }, [user, fetchSeats, navigate]);

  // Countdown timer for seat lock
  useEffect(() => {
    if (!lockExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(lockExpiry) - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setSelectedSeats([]);
        setLockExpiry(null);
        setCountdown(null);
        fetchSeats();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiry, fetchSeats]);

  const toggleSeat = (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;
    if (lockExpiry) return; // seats already locked, don't allow changes
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= 10) { setError('Max 10 seats allowed'); return prev; }
      setError('');
      return [...prev, seat];
    });
  };

  const handleLockSeats = async () => {
    if (selectedSeats.length === 0) { setError('Please select at least one seat'); return; }
    setLocking(true); setError('');
    try {
      const res = await bookingService.lockSeats(showId, selectedSeats.map(s => s.id));
      setLockExpiry(res.data.expiresAt);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock seats. Please try again.');
    } finally { setLocking(false); }
  };

  const handleProceedToPayment = () => {
    if (!lockExpiry) return;
    const totalAmount = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    navigate('/payment', {
      state: {
        showId: Number(showId),
        seatIds: selectedSeats.map(s => s.id),
        selectedSeats,
        show,
        totalAmount,
        lockExpiry,
      },
    });
  };

  const handleJoinWaitlist = async () => {
    setJoiningWaitlist(true); setError('');
    try {
      await bookingService.joinWaitlist(showId, 1);
      setWaitlistSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join waitlist');
    } finally { setJoiningWaitlist(false); }
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Info Header */}
      <div className="bg-gray-900 text-white py-4 px-4 md:px-12">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{show?.movie?.title}</h1>
            <p className="text-gray-300 text-sm">
              {show?.screen?.theatre?.name} &bull; {show?.screen?.name} &bull;{" "}
              {show?.showTime && new Date(show.showTime).toLocaleString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          {countdown !== null && (
            <div className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              Seats locked: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 py-8">
        {waitlistMode ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Show is Housefull!</h2>
            <p className="text-gray-600 mb-6">All seats are booked. Join the waitlist and we'll notify you if seats become available.</p>
            {waitlistSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                You're on the waitlist! We'll notify you when seats open up.
              </div>
            ) : (
              <button
                onClick={handleJoinWaitlist}
                disabled={joiningWaitlist}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {joiningWaitlist ? 'Joining...' : 'Join Waitlist'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Seat Legend */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              {[
                { color: 'bg-gray-200', label: 'Standard (Available)' },
                { color: 'bg-purple-200', label: 'Premium (Available)' },
                { color: 'bg-yellow-200', label: 'VIP (Available)' },
                { color: 'bg-blue-600', label: 'Selected' },
                { color: 'bg-gray-500', label: 'Booked' },
                { color: 'bg-orange-400', label: 'Locked' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className={`w-5 h-5 rounded ${color}`} />
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Screen label */}
            <div className="relative mb-10">
              <div className="h-2 bg-gradient-to-b from-gray-400 to-gray-200 rounded-full mx-auto w-3/4 md:w-1/2" />
              <p className="text-center text-gray-500 text-sm mt-2 tracking-widest">SCREEN</p>
            </div>

            <SeatSelector
              seatsByRow={seatsByRow}
              selectedSeats={selectedSeats}
              onToggleSeat={toggleSeat}
            />

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
                {error}
              </div>
            )}

            {/* Sticky Booking Panel */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-50">
              <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  {selectedSeats.length > 0 ? (
                    <span>
                      <strong>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</strong> selected &bull;{" "}
                      <span className="font-semibold text-gray-800">&#8377;{totalAmount}</span>
                      <span className="ml-2 text-gray-500">
                        ({selectedSeats.map(s => `${s.row}${s.number}`).join(', ')})
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Select seats to continue</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {!lockExpiry ? (
                    <button
                      onClick={handleLockSeats}
                      disabled={selectedSeats.length === 0 || locking}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                    >
                      {locking ? 'Locking...' : 'Lock Seats'}
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedToPayment}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-bold transition"
                    >
                      Proceed to Payment &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="h-20" />
          </>
        )}
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(BookingPage);
