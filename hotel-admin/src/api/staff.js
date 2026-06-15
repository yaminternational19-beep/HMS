import axiosInstance from './axiosInstance';

/**
 * Fetches the staff directory, applying query filters (search, department/role, status, shiftId, and duty status).
 */
export const getStaff = (params = {}) => {
  return axiosInstance.get('/staff/', { params });
};

/**
 * Onboards and registers a new staff agent in the system.
 */
export const createStaff = (staffData) => {
  return axiosInstance.post('/staff/', staffData, {
    headers: {
      'Content-Type': undefined
    }
  });
};

/**
 * Updates an existing staff agent's details by their ID (e.g. STF-01).
 */
export const updateStaff = (staffId, staffData) => {
  return axiosInstance.put(`/staff/${staffId}/`, staffData, {
    headers: {
      'Content-Type': undefined
    }
  });
};

/**
 * Retires and deletes a staff agent's profile by their ID.
 */
export const deleteStaff = (staffId) => {
  return axiosInstance.delete(`/staff/${staffId}/`);
};

/**
 * Fetches staff attendance/session login/logout logs.
 */
export const getStaffLogs = (params = {}) => {
  return axiosInstance.get('/staff/logs/', { params });
};
