import axiosInstance from './axiosInstance';

export const getSuperadminBookings = (params = {}) => {
  return axiosInstance.get('/superadmin/bookings/', { params });
};
