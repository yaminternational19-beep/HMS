import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';

const InventoryForm = ({ isOpen, onClose, onSubmit, editingItem, categories }) => {
    const [name, setName] = useState('');
    const [vendor, setVendor] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [department, setDepartment] = useState('General');
    const [categoryId, setCategoryId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Piece');
    const [minStockLevel, setMinStockLevel] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setName(editingItem.name || '');
                setVendor(editingItem.vendor || '');
                setExpiryDate(editingItem.expiryDate || '');
                setDepartment(editingItem.department || 'General');
                setCategoryId(editingItem.categoryId || '');
                setQuantity(editingItem.quantity || '');
                setUnit(editingItem.unit || 'Piece');
                setMinStockLevel(editingItem.minStockLevel || '');
            } else {
                setName('');
                setVendor('');
                setExpiryDate('');
                setDepartment('General');
                setCategoryId(categories.length > 0 ? categories[0].id : '');
                setQuantity('');
                setUnit('Piece');
                setMinStockLevel('');
            }
        }
    }, [isOpen, editingItem, categories]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name,
            vendor,
            expiryDate,
            department,
            categoryId,
            quantity: quantity || 0,
            unit,
            minStockLevel: minStockLevel || 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-900 text-white">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                            <Package size={16} />
                        </span>
                        <h3 className="text-lg font-bold text-white">
                            {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50/50">
                    <form id="inventoryForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                placeholder="e.g. Towels, Tomatoes, Light Bulbs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                >
                                    <option value="General">General</option>
                                    <option value="Kitchen">Kitchen</option>
                                    <option value="Housekeeping">Housekeeping</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                >
                                    <option value="Piece">Piece</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Litre">Litre</option>
                                    <option value="Box">Box</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vendor / Supplier</label>
                                <input
                                    type="text"
                                    value={vendor}
                                    onChange={(e) => setVendor(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                    placeholder="e.g. Metro Wholesale"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date</label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min Stock Level</label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={minStockLevel}
                                    onChange={(e) => setMinStockLevel(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-900 font-medium shadow-sm"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" form="inventoryForm" className="px-4 py-2 rounded-lg font-semibold bg-accent text-white hover:bg-amber-700 shadow-md transition-colors">
                        {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryForm;
