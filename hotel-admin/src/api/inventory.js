import axiosInstance from './axiosInstance';

export const fetchInventoryItems = async (searchQuery = '') => {
  const params = searchQuery ? { search: searchQuery } : {};
  return await axiosInstance.get('/superadmin/inventory/items/', { params });
};
export const createInventoryItem = async (itemData) => {
  return await axiosInstance.post('/superadmin/inventory/items/', itemData);
};
export const updateInventoryItem = async (itemId, itemData) => {
  return await axiosInstance.put(`/superadmin/inventory/items/${itemId}/`, itemData);
};
export const deleteInventoryItem = async (itemId) => {
  return await axiosInstance.delete(`/superadmin/inventory/items/${itemId}/`);
};

export const fetchInventoryCategories = async () => {
  return await axiosInstance.get('/superadmin/inventory/categories/');
};
export const createInventoryCategory = async (categoryData) => {
  return await axiosInstance.post('/superadmin/inventory/categories/', categoryData);
};

export const fetchInventoryUnits = async () => {
  return await axiosInstance.get('/superadmin/inventory/units/');
};
export const createInventoryUnit = async (unitData) => {
  return await axiosInstance.post('/superadmin/inventory/units/', unitData);
};

export const fetchInventoryVendors = async () => {
  return await axiosInstance.get('/superadmin/inventory/vendors/');
};
export const createInventoryVendor = async (vendorData) => {
  return await axiosInstance.post('/superadmin/inventory/vendors/', vendorData);
};

export const recordPurchase = async (purchaseData) => {
  return await axiosInstance.post('/superadmin/inventory/purchase/', purchaseData);
};

export const recordIssue = async (issueData) => {
  return await axiosInstance.post('/superadmin/inventory/issue/', issueData);
};

export const recordWastage = async (wastageData) => {
  return await axiosInstance.post('/superadmin/inventory/wastage/', wastageData);
};

export const fetchDashboardStats = async () => {
  return await axiosInstance.get('/superadmin/inventory/dashboard/');
};
