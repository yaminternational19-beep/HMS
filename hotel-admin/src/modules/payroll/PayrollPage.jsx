import React, { useState, useEffect } from 'react';
import { fetchPayrollConfigs, fetchSalarySlips, generateSalarySlips, updateSalarySlipStatus } from '../../api/payroll';
import { fetchStaffDirectory } from '../../api/staff';
import { FiDollarSign, FiCheckCircle, FiClock, FiSettings, FiX } from 'react-icons/fi';

const PayrollPage = () => {
    const [staff, setStaff] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [slips, setSlips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [activeTab, setActiveTab] = useState('slips'); // 'slips' or 'config'

    // Form states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [staffRes, payrollRes, slipRes] = await Promise.all([
                fetchStaffDirectory(),
                fetchPayrollConfigs(),
                fetchSalarySlips(selectedMonth, selectedYear)
            ]);
            setStaff(staffRes?.data || []);
            setPayrolls(payrollRes?.data || []);
            setSlips(slipRes?.data || []);
        } catch (error) {
            showToast("Failed to load payroll data", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const handleGenerateSlips = async () => {
        try {
            await generateSalarySlips(selectedMonth, selectedYear);
            showToast(`Salary slips generated for ${selectedMonth}/${selectedYear}`, "success");
            loadData();
        } catch (error) {
            showToast("Failed to generate salary slips", "error");
        }
    };

    const handleMarkPaid = async (slipId) => {
        try {
            await updateSalarySlipStatus(slipId, 'Paid');
            showToast("Salary slip marked as Paid", "success");
            loadData();
        } catch (error) {
            showToast("Failed to update status", "error");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Payroll & Salary</h1>
                    <p className="text-sm text-slate-500">Manage employee salaries, allowances, and generate monthly slips.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('slips')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'slips' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
                    >
                        Salary Slips
                    </button>
                    <button 
                        onClick={() => setActiveTab('config')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'config' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
                    >
                        Payroll Configuration
                    </button>
                </div>
            </div>

            {activeTab === 'slips' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Month</label>
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                                >
                                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                                <input 
                                    type="number" 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-24 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleGenerateSlips}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                        >
                            <FiDollarSign /> Generate Slips for Month
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <th className="p-4 font-semibold">Employee</th>
                                    <th className="p-4 font-semibold">Staff Code</th>
                                    <th className="p-4 font-semibold">Period</th>
                                    <th className="p-4 font-semibold text-right">Total Payable</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading slips...</td></tr>
                                ) : slips.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">No salary slips generated for this period.</td></tr>
                                ) : (
                                    slips.map(slip => (
                                        <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4 font-medium text-slate-800">{slip.staffName}</td>
                                            <td className="p-4 text-slate-600">{slip.staffCode}</td>
                                            <td className="p-4 text-slate-600">{slip.month}/{slip.year}</td>
                                            <td className="p-4 text-right font-bold text-slate-800">₹{slip.totalPaid}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${slip.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 border' : 'bg-amber-50 text-amber-700 border-amber-200 border'}`}>
                                                    {slip.status === 'Paid' ? <FiCheckCircle /> : <FiClock />}
                                                    {slip.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {slip.status !== 'Paid' && (
                                                    <button 
                                                        onClick={() => handleMarkPaid(slip.id)}
                                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Department</th>
                                <th className="p-4 font-semibold text-right">Basic Salary</th>
                                <th className="p-4 font-semibold text-right">Allowances</th>
                                <th className="p-4 font-semibold text-right">Deductions</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => {
                                const config = payrolls.find(p => p.staff === member.id) || { basicSalary: 0, allowances: 0, deductions: 0 };
                                return (
                                    <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800">{member.name}</td>
                                        <td className="p-4 text-slate-600">{member.dept}</td>
                                        <td className="p-4 text-right font-medium">₹{config.basicSalary}</td>
                                        <td className="p-4 text-right text-emerald-600">+₹{config.allowances}</td>
                                        <td className="p-4 text-right text-rose-600">-₹{config.deductions}</td>
                                        <td className="p-4 text-center">
                                            <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors">
                                                <FiSettings size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Toasts */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast-alert toast-alert-${toast.type}`}>
                        <span className="toast-message">{toast.message}</span>
                        <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="toast-close"><FiX size={14} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PayrollPage;
