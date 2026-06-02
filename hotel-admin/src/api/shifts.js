import axiosInstance from './axiosInstance';

/**
 * Fetches all shifts from backend database, applying any search or filter keys.
 */
export const getShifts = () => {
  return axiosInstance.get('/shifts/');
};

/**
 * Persists a newly created custom Shift timing.
 */
export const createShift = (shiftData) => {
  return axiosInstance.post('/shifts/', shiftData);
};

/**
 * Updates specifications of an existing Shift timing by ID.
 */
export const updateShift = (shiftId, shiftData) => {
  return axiosInstance.put(`/shifts/${shiftId}/`, shiftData);
};

/**
 * Retires / Deletes a Shift timing from operational roster.
 */
export const deleteShift = (shiftId) => {
  return axiosInstance.delete(`/shifts/${shiftId}/`);
};
