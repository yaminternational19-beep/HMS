import { axiosInstance } from './axiosInstance';

export const fetchPayrollConfigs = async () => {
  return await axiosInstance.get('/superadmin/staff/payroll/config/');
};

export const updatePayrollConfig = async (payrollData) => {
  return await axiosInstance.post('/superadmin/staff/payroll/config/', payrollData);
};

export const fetchSalarySlips = async (month, year) => {
  let url = '/superadmin/staff/payroll/slips/';
  if (month && year) {
    url += `?month=${month}&year=${year}`;
  }
  return await axiosInstance.get(url);
};

export const generateSalarySlips = async (month, year, staffId = null) => {
  const data = { month, year };
  if (staffId) data.staff_id = staffId;
  return await axiosInstance.post('/superadmin/staff/payroll/slips/', data);
};

export const updateSalarySlipStatus = async (slipId, status) => {
  return await axiosInstance.patch(`/superadmin/staff/payroll/slips/${slipId}/`, { status });
};
