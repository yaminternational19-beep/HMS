import React, { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../../api/inventory';
import { FiBox, FiList, FiTruck, FiShoppingCart, FiMinusCircle, FiTrash2 } from 'react-icons/fi';
import ItemsTab from './components/ItemsTab';
import MastersTab from './components/MastersTab';
import VendorsTab from './components/VendorsTab';
import PurchaseTab from './components/PurchaseTab';
import IssueTab from './components/IssueTab';
import WastageTab from './components/WastageTab';

const InventoryPage = () => {
    const [activeTab, setActiveTab] = useState('items');
    const [stats, setStats] = useState(null);

    const loadStats = async () => {
        try {
            const res = await fetchDashboardStats();
            setStats(res.data);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const tabs = [
        { id: 'items', label: 'Items Master', icon: <FiBox /> },
        { id: 'masters', label: 'Categories & Units', icon: <FiList /> },
        { id: 'vendors', label: 'Vendors', icon: <FiTruck /> },
        { id: 'purchase', label: 'Record Purchase', icon: <FiShoppingCart /> },
        { id: 'issue', label: 'Issue Stock', icon: <FiMinusCircle /> },
        { id: 'wastage', label: 'Record Wastage', icon: <FiTrash2 /> },
    ];

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen pb-24">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Inventory Management</h1>
                    <p className="text-slate-500 font-medium">Manage stock, vendors, purchases, and distribution.</p>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-slate-900">{stats?.totalItems || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Categories</p>
                    <p className="text-2xl font-bold text-slate-900">{stats?.totalCategories || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Vendors</p>
                    <p className="text-2xl font-bold text-slate-900">{stats?.totalVendors || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/30">
                    <p className="text-sm font-semibold text-rose-600 mb-1">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-rose-700">{stats?.lowStockItems || 0}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content Rendering */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[500px]">
                {activeTab === 'items' && <ItemsTab onUpdate={loadStats} />}
                {activeTab === 'masters' && <MastersTab onUpdate={loadStats} />}
                {activeTab === 'vendors' && <VendorsTab onUpdate={loadStats} />}
                {activeTab === 'purchase' && <PurchaseTab onUpdate={loadStats} />}
                {activeTab === 'issue' && <IssueTab onUpdate={loadStats} />}
                {activeTab === 'wastage' && <WastageTab onUpdate={loadStats} />}
            </div>
        </div>
    );
};

export default InventoryPage;
