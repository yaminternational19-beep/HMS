import axiosInstance from './axiosInstance';

export const getSuperadminDashboard = () => {
  return axiosInstance.get('/superadmin/dashboard/');
};
