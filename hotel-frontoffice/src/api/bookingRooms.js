import axiosInstance from './axiosInstance';

/**
 * Fetch available rooms and unique room types from the backend frontoffice rooms API for allocation in bookings.
 * 
 * @param {string} [includeRoom] - Optional room number to include in results (useful in edit mode).
 * @returns {Promise<Object>} - API success response containing rooms list and available types.
 */
export const getRoomsForBooking = async (includeRoom = '') => {
  const params = {};
  if (includeRoom) {
    params.include_room = includeRoom;
  }
  return axiosInstance.get('/frontoffice/rooms/available/', { params });
};
