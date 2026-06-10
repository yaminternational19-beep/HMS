import axiosInstance from './axiosInstance';


export const getBookingsList = async (filters = {}) => {
  const params = {};
  
  if (filters.search) params.search = filters.search.trim();
  if (filters.roomType && filters.roomType !== 'All') params.roomType = filters.roomType;
  if (filters.status && filters.status !== 'All') params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return axiosInstance.get('/frontoffice/bookings/', { params });
};

/**
 * Creates a new guest registration booking.
 * 
 * @param {Object} bookingData - The flat booking registration structure.
 * @returns {Promise<Object>} - API success response containing the registered booking details.
 */
export const createBooking = async (bookingData) => {
  return axiosInstance.post('/frontoffice/bookings/', bookingData);
};

/**
 * Updates an existing booking.
 * 
 * @param {string} bookingCode - The unique booking identifier.
 * @param {Object} bookingData - The partial/full booking details to update.
 * @returns {Promise<Object>} - API success response containing the updated booking details.
 */
export const updateBooking = async (bookingCode, bookingData) => {
  return axiosInstance.put(`/frontoffice/bookings/${bookingCode}/`, bookingData);
};

/**
 * Generates and fetches structured payslip details for a booking.
 * 
 * @param {string} bookingCode - The unique booking identifier.
 * @returns {Promise<Object>} - API success response containing invoice/payslip details.
 */
export const getBookingPayslip = async (bookingCode) => {
  return axiosInstance.get(`/frontoffice/bookings/${bookingCode}/payslip/`);
};

/**
 * Uploads a reservation ID proof scan file to the backend.
 * 
 * @param {File} file - The file object to upload.
 * @returns {Promise<Object>} - API success response containing the URL and name of the uploaded file.
 */
export const uploadBookingDocument = async (file, bookingCode = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('booking_code', bookingCode);
  return axiosInstance.post('/frontoffice/bookings/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Fetches all invoices mapped from bookings.
 * 
 * @returns {Promise<Object>} - API success response containing the mapped invoices.
 */
export const getInvoicesList = async () => {
  return axiosInstance.get('/frontoffice/bookings/invoices/');
};

/**
 * Fetches dashboard KPIs, weekly occupancy, recent bookings, room status, and alerts.
 * 
 * @returns {Promise<Object>} - API success response containing dashboard metrics.
 */
export const getDashboardStats = async () => {
  return axiosInstance.get('/frontoffice/dashboard/stats/');
};

