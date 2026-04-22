import api from './api.service';

export const lockSeats = async (showId, seatIds) => {
  const res = await api.post(`/shows/${showId}/lock-seats`, { seatIds });
  return res.data;
};

export const unlockSeats = async (showId, seatIds) => {
  const res = await api.delete(`/shows/${showId}/lock-seats`, { data: { seatIds } });
  return res.data;
};

export const getShowSeats = async (showId) => {
  const res = await api.get(`/shows/${showId}/seats`);
  return res.data;
};

export const getShowById = async (showId) => {
  const res = await api.get(`/shows/${showId}`);
  return res.data;
};

export const getUserBookings = async (page = 1) => {
  const res = await api.get(`/bookings?page=${page}`);
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/cancel`);
  return res.data;
};

export const simulatePayment = async ({ showId, seatIds }) => {
  const res = await api.post('/payments/simulate', { showId, seatIds });
  return res.data;
};

export const joinWaitlist = async (showId, seatsWanted = 1) => {
  const res = await api.post(`/shows/${showId}/waitlist`, { seatsWanted });
  return res.data;
};

export const leaveWaitlist = async (showId) => {
  const res = await api.delete(`/shows/${showId}/waitlist`);
  return res.data;
};

export const getUserWaitlist = async () => {
  const res = await api.get('/waitlist');
  return res.data;
};
