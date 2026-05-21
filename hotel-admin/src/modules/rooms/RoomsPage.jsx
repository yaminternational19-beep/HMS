import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Bed, 
  PenSquare, 
  Trash2, 
  Wrench, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';

const initialRooms = [
  { id: '101', type: 'Classic Queen', floor: '1st Floor', status: 'available', price: '$120/night', lastCleaned: '2 hrs ago' },
  { id: '102', type: 'Classic Queen', floor: '1st Floor', status: 'occupied', price: '$120/night', lastCleaned: 'Yesterday' },
  { id: '201', type: 'Classic King', floor: '2nd Floor', status: 'dirty', price: '$180/night', lastCleaned: '5 hrs ago' },
  { id: '202', type: 'Classic King', floor: '2nd Floor', status: 'available', price: '$180/night', lastCleaned: '1 hr ago' },
  { id: '301', type: 'Deluxe Suite', floor: '3rd Floor', status: 'occupied', price: '$290/night', lastCleaned: '3 hrs ago' },
  { id: '304', type: 'Deluxe Suite', floor: '3rd Floor', status: 'maintenance', price: '$290/night', lastCleaned: '3 days ago' },
  { id: '401', type: 'Executive Suite', floor: '4th Floor', status: 'available', price: '$450/night', lastCleaned: '30 mins ago' },
  { id: '501', type: 'Presidential Penthouse', floor: '5th Floor', status: 'occupied', price: '$1,200/night', lastCleaned: '4 hrs ago' },
];

const RoomsPage = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.id.includes(searchTerm) || room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || room.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            <Sparkles size={10} />
            <span>Available</span>
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
            <Bed size={10} />
            <span>Occupied</span>
          </span>
        );
      case 'dirty':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
            <AlertTriangle size={10} />
            <span>Dirty / HK Needed</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
            <Wrench size={10} />
            <span>Maintenance</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Rooms & Suite Inventory</h2>
          <p className="text-xs text-slate-400">Add, edit, inspect, and configure lodging assets and real-time maintenance statuses.</p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-amber-700 transition-all cursor-pointer shadow-md shadow-accent/15">
          <Plus size={14} />
          <span>Register New Room</span>
        </button>
      </div>

      {/* Control Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search room number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-bold mr-2 uppercase flex items-center gap-1 shrink-0">
            <Filter size={12} />
            <span>Filter:</span>
          </span>
          {['all', 'available', 'occupied', 'dirty', 'maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all shrink-0 ${
                filter === st 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <div 
            key={room.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col group"
          >
            {/* Thumbnail Header Area */}
            <div className="h-32 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/5 -mr-4 -mt-4 rotate-12 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">{room.floor}</span>
                {getStatusBadge(room.status)}
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-extrabold text-white leading-none">Room {room.id}</h3>
              </div>
            </div>

            {/* Room Specs Info Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide">{room.type}</p>
                <p className="text-[10px] text-slate-400 font-medium">Last Cleaned: {room.lastCleaned}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Nightly Rate</p>
                  <p className="text-base font-extrabold text-slate-800 mt-1">{room.price}</p>
                </div>

                {/* Grid hover controls */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white transition-all cursor-pointer" title="Edit Properties">
                    <PenSquare size={14} />
                  </button>
                  <button className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer" title="Retire Asset">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default RoomsPage;
