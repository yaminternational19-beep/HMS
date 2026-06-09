import axiosInstance from './axiosInstance';


export const getRoomsAndStats = async (filters = {}) => {
  const params = {};
  
  if (filters.search) params.search = filters.search.trim();
  if (filters.status && filters.status !== 'All') params.status = filters.status;
  if (filters.type && filters.type !== 'All') params.type = filters.type;
  if (filters.floor && filters.floor !== 'All') params.floor = filters.floor;

  return axiosInstance.get('/frontoffice/rooms/', { params });
};


export const updateRoomStatus = async (roomNumber, status) => {
  return axiosInstance.put(`/frontoffice/rooms/${roomNumber}/status/`, { status });
};
