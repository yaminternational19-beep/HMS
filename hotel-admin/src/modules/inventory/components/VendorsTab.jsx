import React, { useState, useEffect } from 'react';
import { fetchInventoryVendors, createInventoryVendor } from '../../../api/inventory';

const VendorsTab = ({ onUpdate }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contactPerson: '', phoneNumber: '', email: '', address: '', gstNumber: '' });

    const loadVendors = async () => {
        try {
            setLoading(true);
            const res = await fetchInventoryVendors();
            setVendors(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadVendors(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInventoryVendor(formData);
            setIsFormOpen(false);
            setFormData({ name: '', contactPerson: '', phoneNumber: '', email: '', address: '', gstNumber: '' });
            loadVendors();
            if(onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to create vendor");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Vendors Management</h2>
                <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                    + Add Vendor
                </button>
            </div>

            {isFormOpen && (
                <div className="mb-6 p-5 border border-slate-200 rounded-xl bg-slate-50">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor Name *</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Person</label>
                            <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                            <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">GST Number</label>
                            <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold">Save Vendor</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Vendor Name</th>
                            <th className="px-4 py-3">Contact Person</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">GST Number</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : vendors.map(v => (
                            <tr key={v.id}>
                                <td className="px-4 py-3 font-medium text-slate-900">{v.name}</td>
                                <td className="px-4 py-3 text-slate-700">{v.contactPerson || '-'}</td>
                                <td className="px-4 py-3 text-slate-700">{v.phoneNumber || '-'}</td>
                                <td className="px-4 py-3 text-slate-700">{v.gstNumber || '-'}</td>
                                <td className="px-4 py-3 text-emerald-600 font-semibold">{v.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorsTab;
