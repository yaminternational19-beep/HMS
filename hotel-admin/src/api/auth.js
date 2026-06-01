import axiosInstance from './axiosInstance';


export const loginSuperAdmin = async (email, password) => {
  return axiosInstance.post('/auth/login/', { email, password });
};
