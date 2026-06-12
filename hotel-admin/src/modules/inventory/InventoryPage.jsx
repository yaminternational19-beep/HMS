import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { fetchInventoryItems, fetchInventoryCategories, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../api/inventory';
import InventoryForm from './components/InventoryForm';

const InventoryPage = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const showToast = (message, type = 'info') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const [itemsRes, catsRes] = await Promise.all([
                fetchInventoryItems(),
                fetchInventoryCategories()
            ]);
            setItems(itemsRes?.data || []);
            setCategories(catsRes?.data || []);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch inventory", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingItem) {
                await updateInventoryItem(editingItem.id, formData);
                showToast("Item updated successfully", "success");
            } else {
                await createInventoryItem(formData);
                showToast("Item created successfully", "success");
            }
            setIsFormOpen(false);
            fetchInventory();
        } catch (error) {
            const msg = error.response?.data?.message || "Operation failed";
            showToast(msg, "error");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
            try {
                await deleteInventoryItem(item.id);
                showToast("Item deleted successfully", "success");
                fetchInventory();
            } catch (error) {
                const msg = error.response?.data?.message || "Failed to delete item";
                showToast(msg, "error");
            }
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchInventory();
    }, []);

    // Pagination Logic
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                <button 
                    onClick={() => {
                        setEditingItem(null);
                        setIsFormOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <FiPlus /> Add Item
                </button>
            </div>

            <div className="space-y-0 shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="table-container !shadow-none !border-none !rounded-none">
                    <table className="table-element">
                        <thead>
                            <tr>
                                <th className="text-left">Name</th>
                                <th className="text-left">SKU</th>
                                <th className="text-left">Category</th>
                                <th className="text-center">Quantity</th>
                                <th className="text-left">Unit</th>
                                <th className="text-left">Price</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-4 text-center text-slate-500">Loading...</td>
                                </tr>
                            ) : paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-4 text-center text-slate-500 font-medium italic">No inventory items found.</td>
                                </tr>
                            ) : (
                                paginatedItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="font-medium text-slate-800">{item.name}</td>
                                        <td className="text-slate-600">{item.sku || '-'}</td>
                                        <td className="text-slate-600">{item.categoryName || '-'}</td>
                                        <td className="text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${item.quantity <= item.minStockLevel ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="text-slate-600">{item.unit}</td>
                                        <td className="text-slate-600">₹{item.price}</td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button 
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Item"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete Item"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                    <div className="table-pagination !border-t border-slate-200 !rounded-none">
                        <div className="pagination-text text-xs">
                            Showing <span>{startIndex + 1}</span> to <span>{Math.min(endIndex, totalItems)}</span> of <span>{totalItems}</span> items
                        </div>
                        <div className="pagination-btn-group">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pg-btn text-[10px] font-bold py-1 px-2 cursor-pointer select-none"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`pg-btn text-[10px] font-bold py-1 px-2 cursor-pointer select-none ${currentPage === page ? 'pg-active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="pg-btn text-[10px] font-bold py-1 px-2 cursor-pointer select-none"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <InventoryForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSubmit={handleFormSubmit}
                editingItem={editingItem}
                categories={categories}
            />

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-alert ${
                            toast.type === 'success' ? 'toast-alert-success' :
                            toast.type === 'warning' ? 'toast-alert-warning' :
                            toast.type === 'error' ? 'toast-alert-error' :
                            'toast-alert-info'
                        }`}
                    >
                        <span className="toast-message">{toast.message}</span>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            className="toast-close"
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryPage;
