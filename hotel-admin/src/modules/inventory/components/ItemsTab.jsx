import React, { useState, useEffect } from 'react';
import { fetchInventoryItems, deleteInventoryItem } from '../../../api/inventory';

const ItemsTab = ({ onUpdate }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadItems = async () => {
        try {
            setLoading(true);
            const res = await fetchInventoryItems();
            setItems(res.data || []);
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Inventory Items Master</h2>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                    + Add New Item
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Current Stock</th>
                            <th className="px-4 py-3">Unit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading items...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-slate-500">No items found. Please add categories and units first.</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.itemCode}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{item.categoryName}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{item.currentStock}</td>
                                    <td className="px-4 py-3 text-slate-500">{item.unitName}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemsTab;
