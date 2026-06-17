import React, { useState, useEffect } from 'react';
import { recordPurchase, fetchInventoryVendors, fetchInventoryItems } from '../../../api/inventory';

const PurchaseTab = ({ onUpdate }) => {
    const [vendors, setVendors] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ vendorId: '', invoiceNumber: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '', items: [] });

    const loadData = async () => {
        try {
            const [vRes, iRes] = await Promise.all([fetchInventoryVendors(), fetchInventoryItems()]);
            setVendors(vRes.data || []);
            setItems(iRes.data || []);
        } catch (error) { console.error(error); }
    };
    useEffect(() => { loadData(); }, []);

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { itemId: '', quantity: '', unitPrice: '', totalAmount: '' }] });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'unitPrice') {
            const qty = parseFloat(newItems[index].quantity || 0);
            const price = parseFloat(newItems[index].unitPrice || 0);
            newItems[index].totalAmount = (qty * price).toFixed(2);
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const total = formData.items.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
            await recordPurchase({ ...formData, totalAmount: total });
            setFormData({ vendorId: '', invoiceNumber: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '', items: [] });
            alert("Purchase Recorded Successfully!");
            if(onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to record purchase");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Record New Purchase</h2>
            <form onSubmit={handleSubmit} className="max-w-4xl bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor *</label>
                        <select required value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="">Select Vendor</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Invoice Number</label>
                        <input type="text" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Purchase Date *</label>
                        <input required type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                        <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-700">Purchase Items</h3>
                        <button type="button" onClick={handleAddItem} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">+ Add Line Item</button>
                    </div>
                    {formData.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-end">
                            <div className="flex-1">
                                <select required value={item.itemId} onChange={e => handleItemChange(idx, 'itemId', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                                    <option value="">Select Item</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unitName})</option>)}
                                </select>
                            </div>
                            <div className="w-24">
                                <input required type="number" step="0.01" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                            </div>
                            <div className="w-32">
                                <input required type="number" step="0.01" placeholder="Unit Price" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                            </div>
                            <div className="w-32">
                                <input readOnly type="number" placeholder="Total" value={item.totalAmount} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={formData.items.length === 0} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold disabled:opacity-50">Record Purchase</button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseTab;
