import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';

const InventoryForm = ({ isOpen, onClose, onSubmit, editingItem, categories }) => {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Piece');
    const [price, setPrice] = useState('');
    const [minStockLevel, setMinStockLevel] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setName(editingItem.name || '');
                setSku(editingItem.sku || '');
                setCategoryId(editingItem.categoryId || '');
                setQuantity(editingItem.quantity || '');
                setUnit(editingItem.unit || 'Piece');
                setPrice(editingItem.price || '');
                setMinStockLevel(editingItem.minStockLevel || '');
            } else {
                setName('');
                setSku('');
                setCategoryId(categories.length > 0 ? categories[0].id : '');
                setQuantity('');
                setUnit('Piece');
                setPrice('');
                setMinStockLevel('');
            }
        }
    }, [isOpen, editingItem, categories]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name,
            sku,
            categoryId,
            quantity: quantity || 0,
            unit,
            price: price || 0,
            minStockLevel: minStockLevel || 0
        });
    };

    return (
        <div className="rooms-modal-overlay" onClick={onClose}>
            <div className="rooms-modal-container animate-slide-up !max-w-[500px]" onClick={(e) => e.stopPropagation()}>
                <div className="rooms-modal-header">
                    <div className="rooms-modal-header-left">
                        <span className="rooms-modal-header-icon-wrapper">
                            <Package size={16} />
                        </span>
                        <h3 className="rooms-modal-title">
                            {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="rooms-modal-close-btn">
                        <X size={18} />
                    </button>
                </div>

                <div className="rooms-modal-body">
                    <form id="inventoryForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="rooms-form-label">Item Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rooms-form-input"
                                placeholder="e.g. Towels, Tomatoes, Light Bulbs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="rooms-form-label">SKU</label>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    className="rooms-form-input"
                                    placeholder="Optional SKU"
                                />
                            </div>
                            <div>
                                <label className="rooms-form-label">Category <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="rooms-form-select"
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
                                <label className="rooms-form-label">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="rooms-form-input"
                                />
                            </div>
                            <div>
                                <label className="rooms-form-label">Unit <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="rooms-form-select"
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
                                <label className="rooms-form-label">Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="rooms-form-input !pl-8"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="rooms-form-label">Min Stock Level</label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={minStockLevel}
                                    onChange={(e) => setMinStockLevel(e.target.value)}
                                    className="rooms-form-input"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="rooms-modal-footer">
                    <button type="button" onClick={onClose} className="rooms-btn-cancel">Cancel</button>
                    <button type="submit" form="inventoryForm" className="rooms-btn-save">
                        {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryForm;
