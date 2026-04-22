import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/Auth.context";
import * as bookingService from "../services/booking.service";
import Loader from "../components/Loader/Loader";

const statusColors = {
  CONFIRMED: 'text-green-600',
  PENDING: 'text-yellow-600',
  CANCELLED: 'text-red-600',
  FAILED: 'text-gray-600',
};

const BookingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    bookingService.getBookingById(id)
      .then(res => setBooking(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) return <Loader />;
  if (!booking) return <div className="text-center py-20 text-gray-500">Booking not found.</div>;

  const show = booking.show;
  const movie = show?.movie;
  const theatre = show?.screen?.theatre;

  return (
    <div className="container mx-auto px-4 md:px-12 py-8 max-w-2xl">
      <Link to="/bookings" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        &larr; Back to My Bookings
      </Link>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center gap-4">
            <img
              src={`https://image.tmdb.org/t/p/w200${movie?.posterPath}`}
              alt={movie?.title}
              className="w-16 h-24 object-cover rounded"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-2xl font-bold">{movie?.title || movie?.originalTitle}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {show?.showTime && new Date(show.showTime).toLocaleString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-0">
          <Row label="Status">
            <span className={`font-bold text-lg ${statusColors[booking.status]}`}>{booking.status}</span>
          </Row>
          <Row label="Booking ID">
            <span className="font-mono text-sm text-gray-800 break-all">{booking.id}</span>
          </Row>
          <Row label="Theatre">
            <span className="text-gray-800 font-medium">{theatre?.name}</span>
          </Row>
          <Row label="City">
            <span className="text-gray-800">{theatre?.city}, {theatre?.state}</span>
          </Row>
          <Row label="Screen">
            <span className="text-gray-800">{show?.screen?.name}</span>
          </Row>
          <Row label="Seats">
            <div className="flex flex-wrap gap-1 justify-end">
              {booking.seats?.map(s => (
                <span key={s.id} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {s.seat?.row}{s.seat?.number}
                  <span className="ml-1 text-xs text-gray-500">({s.seat?.type})</span>
                </span>
              ))}
            </div>
          </Row>
          <Row label="Total Amount">
            <span className="text-2xl font-bold text-gray-800">&#8377;{booking.totalAmount}</span>
          </Row>
          {booking.payment && (
            <Row label="Payment">
              <span className={`font-medium ${booking.payment.status === 'SUCCESS' ? 'text-green-600' : 'text-gray-600'}`}>
                {booking.payment.status} &bull; &#8377;{booking.payment.amount}
              </span>
            </Row>
          )}
          <Row label="Booked On" last>
            <span className="text-gray-800 text-sm">
              {new Date(booking.createdAt).toLocaleString('en-IN')}
            </span>
          </Row>
        </div>

        {booking.status === 'CONFIRMED' && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">Booking Confirmed! Enjoy your show.</p>
              <p className="text-green-600 text-sm mt-1">Please show this Booking ID at the counter: <strong>{booking.id}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, children, last }) => (
  <div className={`flex justify-between items-center py-3 ${!last ? 'border-b' : ''}`}>
    <span className="text-gray-500">{label}</span>
    <div className="text-right">{children}</div>
  </div>
);

export default DefaultlayoutHoc(BookingDetailPage);
