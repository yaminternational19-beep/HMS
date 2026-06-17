import React, { useState, useEffect } from 'react';
import { recordIssue, fetchInventoryItems } from '../../../api/inventory';

const IssueTab = ({ onUpdate }) => {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ department: 'Kitchen', issueDate: new Date().toISOString().split('T')[0], issuedBy: '', receivedBy: '', remarks: '', items: [] });

    const loadData = async () => {
        try {
            const iRes = await fetchInventoryItems();
            setItems(iRes.data || []);
        } catch (error) { console.error(error); }
    };
    useEffect(() => { loadData(); }, []);

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { itemId: '', quantity: '' }] });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await recordIssue(formData);
            setFormData({ department: 'Kitchen', issueDate: new Date().toISOString().split('T')[0], issuedBy: '', receivedBy: '', remarks: '', items: [] });
            alert("Issue Recorded Successfully!");
            if(onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to record issue");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Issue Stock to Department</h2>
            <form onSubmit={handleSubmit} className="max-w-4xl bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Department *</label>
                        <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="Kitchen">Kitchen</option>
                            <option value="Housekeeping">Housekeeping</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Front Office">Front Office</option>
                            <option value="Restaurant">Restaurant</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Date *</label>
                        <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Issued By</label>
                        <input type="text" value={formData.issuedBy} onChange={e => setFormData({...formData, issuedBy: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Received By</label>
                        <input type="text" value={formData.receivedBy} onChange={e => setFormData({...formData, receivedBy: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Remarks</label>
                        <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-700">Items to Issue</h3>
                        <button type="button" onClick={handleAddItem} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">+ Add Line Item</button>
                    </div>
                    {formData.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-end">
                            <div className="flex-1">
                                <select required value={item.itemId} onChange={e => handleItemChange(idx, 'itemId', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                                    <option value="">Select Item</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.currentStock} {i.unitName})</option>)}
                                </select>
                            </div>
                            <div className="w-32">
                                <input required type="number" step="0.01" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={formData.items.length === 0} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold disabled:opacity-50">Issue Stock</button>
                </div>
            </form>
        </div>
    );
};

export default IssueTab;
