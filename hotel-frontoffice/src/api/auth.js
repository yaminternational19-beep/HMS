import axiosInstance from './axiosInstance';

export const loginStaff = async (staffCode, password) => {
  return axiosInstance.post('/auth/staff/login/', { staffCode, password });
};

export const logoutStaff = async () => {
  return axiosInstance.post('/auth/staff/logout/');
};
