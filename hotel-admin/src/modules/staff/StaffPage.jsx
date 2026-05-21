import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Edit, 
  Trash2, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

const initialStaff = [
  { id: 'STF-01', name: 'Praveen Reddy', role: 'Corporate Director', dept: 'Administration', email: 'praveen@hms.com', phone: '+971 50 123 4567', status: 'active', joined: 'Oct 2021' },
  { id: 'STF-02', name: 'Sarah Connor', role: 'Front Desk Manager', dept: 'Front Office', email: 'sarah.c@hms.com', phone: '+971 50 234 5678', status: 'active', joined: 'Jan 2022' },
  { id: 'STF-03', name: 'John Doe', role: 'Concierge Clerk', dept: 'Front Office', email: 'john.doe@hms.com', phone: '+971 50 345 6789', status: 'active', joined: 'Jun 2023' },
  { id: 'STF-04', name: 'Maria Gonzalez', role: 'Executive Housekeeper', dept: 'Housekeeping', email: 'maria.g@hms.com', phone: '+971 50 456 7890', status: 'active', joined: 'Mar 2022' },
  { id: 'STF-05', name: 'David Smith', role: 'Maintenance Lead', dept: 'Maintenance', email: 'david.s@hms.com', phone: '+971 50 567 8901', status: 'on-leave', joined: 'Aug 2020' },
  { id: 'STF-06', name: 'Alex Wong', role: 'Head Chef', dept: 'Food & Beverage', email: 'alex.w@hms.com', phone: '+971 50 678 9012', status: 'active', joined: 'Nov 2022' },
];

const StaffPage = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || member.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Staff & Employee Directory</h2>
          <p className="text-xs text-slate-400">Manage employee rosters, departments, payroll profiles, and administrative permissions.</p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-amber-700 transition-all cursor-pointer shadow-md shadow-accent/15">
          <Plus size={14} />
          <span>Onboard New Staff</span>
        </button>
      </div>

      {/* Directory Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search employee name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        {/* Department Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'Administration', 'Front Office', 'Housekeeping', 'Maintenance', 'Food & Beverage'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all shrink-0 ${
                deptFilter === dept 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div 
            key={member.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-6"
          >
            {/* Header Details */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3.5">
                {/* Visual Avatar */}
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0 uppercase">
                  {member.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">{member.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                    <Shield size={10} className="text-slate-400" />
                    <span>{member.role}</span>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                member.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                <span>{member.status}</span>
              </span>
            </div>

            {/* Shift Contact Details */}
            <div className="space-y-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <a href={`mailto:${member.email}`} className="hover:text-accent truncate">{member.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-slate-400 shrink-0" />
                <a href={`tel:${member.phone}`} className="hover:text-accent">{member.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-slate-400 shrink-0" />
                <span>Joined: {member.joined}</span>
              </div>
            </div>

            {/* Action Group */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{member.id}</span>
              
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white transition-all cursor-pointer" title="Adjust Profile">
                  <Edit size={14} />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer" title="Offboard Agent">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default StaffPage;
