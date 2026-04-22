import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/Auth.context";
import * as bookingService from "../services/booking.service";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state;


  const [step, setStep] = useState('summary'); // 'summary' | 'processing' | 'done'
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(null);

  // QR data: encode booking session info (dummy but realistic)
  const qrData = state
    ? JSON.stringify({
        app: 'ShowsNow',
        showId: state.showId,
        seats: state.selectedSeats?.map(s => `${s.row}${s.number}`).join(','),
        amount: state.totalAmount,
        user: user?.email,
        ts: Date.now(),
      })
    : 'ShowsNow Payment';

  // Live lock countdown
  useEffect(() => {
    if (!state?.lockExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(state.lockExpiry) - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Guard: redirect if no state (direct navigation)
  useEffect(() => {
    if (!state || !user) navigate('/');
  }, [state, user, navigate]);

  if (!state) return null;

  const { show, selectedSeats = [], totalAmount = 0, showId, seatIds } = state;
  const movie = show?.movie;
  const theatre = show?.screen?.theatre;

  const handleSimulatePayment = async () => {

    setStep('processing');
    setError('');

    // Simulate 2.5 second processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const res = await bookingService.simulatePayment({ showId, seatIds });
      const booking = res.data;
      setStep('done');
      setTimeout(() => navigate(`/bookings/${booking.id}`), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please go back and try again.');
      setStep('summary');

    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-full mb-3">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Complete Payment</h1>
          <p className="text-gray-500 text-sm mt-1">ShowsNow Secure Checkout</p>
        </div>

        {/* Lock timer warning */}
        {countdown !== null && countdown < 120 && countdown > 0 && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-2 rounded-lg mb-4 text-center">
            Seat lock expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </div>
        )}
        {countdown === 0 && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2 rounded-lg mb-4 text-center">
            Seat lock expired. Please go back and re-select your seats.
          </div>
        )}

        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="bg-gray-900 text-white px-6 py-4">
            <h2 className="font-semibold text-lg">{movie?.title}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {show?.showTime && new Date(show.showTime).toLocaleString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Theatre</span>
              <span className="text-gray-800 font-medium text-right">{theatre?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">City</span>
              <span className="text-gray-800">{theatre?.city}, {theatre?.state}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Screen</span>
              <span className="text-gray-800">{show?.screen?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Seats</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {selectedSeats.map(s => (
                  <span key={s.id} className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                    {s.row}{s.number}
                    <span className="ml-1 text-gray-400">({s.type})</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">&#8377;{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Scan the QR code below at the venue counter, or click <strong>Simulate Payment</strong> to confirm instantly.
          </p>
          <div className="flex justify-center">
            <div className="p-3 border-2 border-gray-200 rounded-xl inline-block bg-white">
              <QRCodeSVG
                value={qrData}
                size={180}
                fgColor="#1a1a2e"
                bgColor="#ffffff"
                level="M"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Valid for this session only &bull; Amount: &#8377;{totalAmount}
          </p>
        </div>

        {/* Payment Action */}
        {step === 'summary' && (
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleSimulatePayment}
              disabled={countdown === 0}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              Simulate Payment &bull; &#8377;{totalAmount}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full text-gray-500 hover:text-gray-700 py-3 text-sm transition mt-2"
            >
              &larr; Go Back
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">Processing Payment...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait, do not close this page.</p>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-green-700 font-bold text-xl">Payment Successful!</p>
            <p className="text-green-600 text-sm mt-2">Redirecting to your booking...</p>
          </div>
        )}

        {/* Security note */}
        <p className="text-center text-gray-400 text-xs mt-6">
          🔒 This is a demo payment — no real money is charged.
        </p>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(PaymentPage);
