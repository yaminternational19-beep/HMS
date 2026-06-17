import React, { useState, useEffect } from 'react';
import { recordWastage, fetchInventoryItems } from '../../../api/inventory';

const WastageTab = ({ onUpdate }) => {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ itemId: '', quantity: '', reason: '', recordedBy: '', date: new Date().toISOString().split('T')[0] });

    const loadData = async () => {
        try {
            const iRes = await fetchInventoryItems();
            setItems(iRes.data || []);
        } catch (error) { console.error(error); }
    };
    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await recordWastage(formData);
            setFormData({ itemId: '', quantity: '', reason: '', recordedBy: '', date: new Date().toISOString().split('T')[0] });
            alert("Wastage Recorded Successfully!");
            if(onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to record wastage");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Record Inventory Wastage</h2>
            <form onSubmit={handleSubmit} className="max-w-2xl bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Item *</label>
                        <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="">Select Item</option>
                            {items.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.currentStock} {i.unitName})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity *</label>
                        <input required type="number" step="0.01" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Reason *</label>
                        <select required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="">Select Reason</option>
                            <option value="Expired">Expired</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Broken">Broken</option>
                            <option value="Lost">Lost</option>
                            <option value="Spoiled">Spoiled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Recorded By</label>
                        <input type="text" value={formData.recordedBy} onChange={e => setFormData({...formData, recordedBy: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                        <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700">Record Wastage</button>
                </div>
            </form>
        </div>
    );
};

export default WastageTab;
