import React, { useState, useEffect } from 'react';
import { fetchInventoryCategories, fetchInventoryUnits, createInventoryCategory, createInventoryUnit } from '../../../api/inventory';

const MastersTab = ({ onUpdate }) => {
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [unitForm, setUnitForm] = useState({ name: '', shortName: '' });

    const loadMasters = async () => {
        try {
            setLoading(true);
            const [catRes, unitRes] = await Promise.all([
                fetchInventoryCategories(),
                fetchInventoryUnits()
            ]);
            setCategories(catRes.data || []);
            setUnits(unitRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMasters(); }, []);

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInventoryCategory(catForm);
            setCatForm({ name: '', description: '' });
            loadMasters();
            if(onUpdate) onUpdate();
        } catch (error) { console.error(error); }
    };

    const handleUnitSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInventoryUnit(unitForm);
            setUnitForm({ name: '', shortName: '' });
            loadMasters();
            if(onUpdate) onUpdate();
        } catch (error) { console.error(error); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Categories */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Categories Master</h2>
                <div className="mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <form onSubmit={handleCatSubmit} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                            <input required type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                            <input type="text" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-semibold">Add</button>
                    </form>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.map(c => (
                                <tr key={c.id}>
                                    <td className="px-4 py-2 text-slate-900 font-medium">{c.name}</td>
                                    <td className="px-4 py-2 text-emerald-600">{c.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Units */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Units Master</h2>
                <div className="mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <form onSubmit={handleUnitSubmit} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                            <input required type="text" value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} placeholder="e.g. Kilogram" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Name</label>
                            <input required type="text" value={unitForm.shortName} onChange={e => setUnitForm({...unitForm, shortName: e.target.value})} placeholder="e.g. KG" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-semibold">Add</button>
                    </form>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Short</th><th className="px-4 py-2">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {units.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-2 text-slate-900 font-medium">{u.name}</td>
                                    <td className="px-4 py-2 text-slate-600">{u.shortName}</td>
                                    <td className="px-4 py-2 text-emerald-600">{u.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MastersTab;
