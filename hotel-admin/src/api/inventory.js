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
