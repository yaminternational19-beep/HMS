import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import StaffFilters from './components/StaffFilters';
import StaffStats from './components/StaffStats';
import StaffTable from './components/StaffTable';
import ShiftTimings from './components/ShiftTimings';
import OnboardStaffForm from './components/OnboardStaffForm';
import StaffLogModal from './components/StaffLogModal';
import './styles/staff.css';

// Rich Mock data for Staff with pre-populated checkin logs
const initialStaff = [
  { 
    id: 'STF-01', 
    name: 'Praveen Reddy', 
    role: 'Corporate Director', 
    dept: 'Administration', 
    email: 'praveen@hms.com', 
    phone: '+971 50 123 4567', 
    status: 'active', 
    joined: 'Oct 2021',
    isCheckedIn: true,
    lastCheckIn: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours ago
    details: 'Senior executive managing HMS hotel operations, property integrations, and compliance architectures.',
    address: 'Villa 12, Palm Jumeirah, Dubai, UAE',
    govtProofType: 'Passport',
    govtProofId: 'DXB-983726-P',
    govtProofFileName: 'passport_scan_praveen.pdf',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop',
    shiftId: 'SHF-04',
    logs: [
      { id: 101, date: 'May 22, 2026', checkIn: '08:30 AM', checkOut: '06:00 PM', duration: '9h 30m' },
      { id: 102, date: 'May 21, 2026', checkIn: '08:45 AM', checkOut: '05:45 PM', duration: '9h 00m' }
    ]
  },
  { 
    id: 'STF-02', 
    name: 'Sarah Connor', 
    role: 'Front Desk Manager', 
    dept: 'Front Office', 
    email: 'sarah.c@hms.com', 
    phone: '+971 50 234 5678', 
    status: 'active', 
    joined: 'Jan 2022',
    isCheckedIn: false,
    lastCheckIn: null,
    details: 'Expert front-office liaison supervisor specialized in guest satisfaction and VIP check-in pipelines.',
    address: 'Apt 204, Downtown Boulevard, Dubai, UAE',
    govtProofType: 'National ID',
    govtProofId: '784-1995-1234567-1',
    govtProofFileName: 'emirates_id_front_sarah.jpg',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
    shiftId: 'SHF-01',
    logs: [
      { id: 201, date: 'May 22, 2026', checkIn: '09:00 AM', checkOut: '05:00 PM', duration: '8h 00m' },
      { id: 202, date: 'May 21, 2026', checkIn: '08:50 AM', checkOut: '05:10 PM', duration: '8h 20m' }
    ]
  },
  { 
    id: 'STF-03', 
    name: 'John Doe', 
    role: 'Concierge Clerk', 
    dept: 'Front Office', 
    email: 'john.doe@hms.com', 
    phone: '+971 50 345 6789', 
    status: 'active', 
    joined: 'Jun 2023',
    isCheckedIn: false,
    lastCheckIn: null,
    details: 'Dedicated concierge assistant with multilingual capabilities providing guest assistance.',
    address: 'Building A-1, Al Barsha Heights, Dubai, UAE',
    govtProofType: 'Driver License',
    govtProofId: 'DL-2023-887162',
    govtProofFileName: 'uae_license_johndoe.png',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    shiftId: 'SHF-02',
    logs: [
      { id: 301, date: 'May 22, 2026', checkIn: '10:00 AM', checkOut: '06:00 PM', duration: '8h 00m' }
    ]
  },
  { 
    id: 'STF-04', 
    name: 'Maria Gonzalez', 
    role: 'Executive Housekeeper', 
    dept: 'Housekeeping', 
    email: 'maria.g@hms.com', 
    phone: '+971 50 456 7890', 
    status: 'active', 
    joined: 'Mar 2022',
    isCheckedIn: true,
    lastCheckIn: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    details: 'Executive housekeeping professional leading room staging and standards compliance.',
    address: 'Flat 10, Jumeirah Village Circle, Dubai, UAE',
    govtProofType: 'National ID',
    govtProofId: '784-1988-7654321-2',
    govtProofFileName: 'emirates_id_front_maria.png',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop',
    shiftId: 'SHF-01',
    logs: [
      { id: 401, date: 'May 22, 2026', checkIn: '08:00 AM', checkOut: '04:00 PM', duration: '8h 00m' }
    ]
  },
  { 
    id: 'STF-05', 
    name: 'David Smith', 
    role: 'Maintenance Lead', 
    dept: 'Maintenance', 
    email: 'david.s@hms.com', 
    phone: '+971 50 567 8901', 
    status: 'on-leave', 
    joined: 'Aug 2020',
    isCheckedIn: false,
    lastCheckIn: null,
    details: 'Certified facilities maintenance manager, leading plumbing, electrical and safety systems.',
    address: 'Street 4B, Al Quoz Industrial Area, Dubai, UAE',
    govtProofType: 'Driver License',
    govtProofId: 'DL-2019-992019',
    govtProofFileName: 'driver_license_david.jpg',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop',
    shiftId: 'SHF-03',
    logs: [
      { id: 501, date: 'May 15, 2026', checkIn: '08:30 AM', checkOut: '05:30 PM', duration: '9h 00m' }
    ]
  },
  { 
    id: 'STF-06', 
    name: 'Alex Wong', 
    role: 'Head Chef', 
    dept: 'Food & Beverage', 
    email: 'alex.w@hms.com', 
    phone: '+971 50 678 9012', 
    status: 'active', 
    joined: 'Nov 2022',
    isCheckedIn: false,
    lastCheckIn: null,
    details: 'Head chef orchestrating kitchen staff and fine dining hospitality operations.',
    address: 'Penthouse 3, Dubai Marina Heights, Dubai, UAE',
    govtProofType: 'Passport',
    govtProofId: 'HKG-887162-W',
    govtProofFileName: 'passport_scan_alexwong.pdf',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop',
    shiftId: 'SHF-02',
    logs: [
      { id: 601, date: 'May 22, 2026', checkIn: '11:00 AM', checkOut: '08:00 PM', duration: '9h 00m' }
    ]
  }
];

const StaffPage = () => {
  // Roster lists and search filters states
  const [staff, setStaff] = useState(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dutyFilter, setDutyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id-desc');

  // Modals active triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingLogsMember, setViewingLogsMember] = useState(null);

  // Active form field inputs
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('Front Office');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [details, setDetails] = useState('');
  const [address, setAddress] = useState('');
  const [govtProofType, setGovtProofType] = useState('Passport');
  const [govtProofId, setGovtProofId] = useState('');
  const [govtProofFileName, setGovtProofFileName] = useState('');
  const [govtProofFileUrl, setGovtProofFileUrl] = useState('');
  const [errors, setErrors] = useState({});

  // Slide-in toast alerts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Lock background scrolls when overlays are open
  useEffect(() => {
    if (isFormOpen || viewingLogsMember) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen, viewingLogsMember]);

  // Load and pre-fill form fields on edit vs add
  useEffect(() => {
    if (isFormOpen) {
      setErrors({});
      if (editingMember) {
        setName(editingMember.name);
        setRole(editingMember.role);
        setDept(editingMember.dept);
        setEmail(editingMember.email);
        setPhone(editingMember.phone);
        setStatus(editingMember.status);
        setDetails(editingMember.details || '');
        setAddress(editingMember.address || '');
        setGovtProofType(editingMember.govtProofType || 'Passport');
        setGovtProofId(editingMember.govtProofId || '');
        setGovtProofFileName(editingMember.govtProofFileName || '');
        setGovtProofFileUrl(editingMember.govtProofFileUrl || '');
      } else {
        setName('');
        setRole('');
        setDept('Front Office');
        setEmail('');
        setPhone('');
        setStatus('active');
        setDetails('');
        setAddress('');
        setGovtProofType('Passport');
        setGovtProofId('');
        setGovtProofFileName('');
        setGovtProofFileUrl('');
      }
    }
  }, [isFormOpen, editingMember]);

  // Live Check-In action trigger
  const handleCheckIn = (memberId) => {
    setStaff((prevStaff) => 
      prevStaff.map((member) => {
        if (member.id === memberId) {
          addToast(`${member.name} checked in successfully at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`, 'success');
          return {
            ...member,
            isCheckedIn: true,
            lastCheckIn: new Date().toISOString()
          };
        }
        return member;
      })
    );
  };

  // Live Check-Out action trigger and log recording
  const handleCheckOut = (memberId) => {
    setStaff((prevStaff) => 
      prevStaff.map((member) => {
        if (member.id === memberId) {
          const checkInTime = member.lastCheckIn ? new Date(member.lastCheckIn) : new Date(Date.now() - 8 * 60 * 60 * 1000); // Fallback to 8 hours
          const checkOutTime = new Date();

          // Calculate duration
          const diffMs = checkOutTime - checkInTime;
          const diffMins = Math.round(diffMs / 60000);
          const hrs = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          const durationStr = `${hrs}h ${String(mins).padStart(2, '0')}m`;

          // Format timestamps
          const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
          const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const newLog = {
            id: Date.now(),
            date: formatDate(checkOutTime),
            checkIn: formatTime(checkInTime),
            checkOut: formatTime(checkOutTime),
            duration: durationStr
          };

          addToast(`${member.name} checked out successfully. Session recorded: ${durationStr}.`, 'warning');
          
          return {
            ...member,
            isCheckedIn: false,
            lastCheckIn: null,
            logs: [newLog, ...member.logs]
          };
        }
        return member;
      })
    );
  };

  // Roster input fields validation
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required.';
    if (!role.trim()) newErrors.role = 'Role Title is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid contact phone number.';
    }

    if (!address.trim()) {
      newErrors.address = 'Physical address is required.';
    }

    if (!details.trim()) {
      newErrors.details = 'Description or bio details are required.';
    }

    if (!govtProofId.trim()) {
      newErrors.govtProofId = 'Government ID proof number is required.';
    }

    if (!govtProofFileName) {
      newErrors.govtProofFile = 'Government ID document or image scan is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add / Edit Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingMember) {
      // Edit mode: map update
      setStaff((prevStaff) => 
        prevStaff.map((m) => m.id === editingMember.id 
          ? {
              ...m,
              name: name.trim(),
              role: role.trim(),
              dept,
              email: email.trim(),
              phone: phone.trim(),
              status,
              details: details.trim(),
              address: address.trim(),
              govtProofType,
              govtProofId: govtProofId.trim(),
              govtProofFileName,
              govtProofFileUrl
            }
          : m
        )
      );
      addToast(`Staff profile for ${name.trim()} updated successfully.`, 'success');
    } else {
      // Onboard mode: generate incremental ID
      const getNextId = () => {
        const numericIds = staff.map(m => parseInt(m.id.replace('STF-', '')));
        const maxId = Math.max(...numericIds, 0);
        return `STF-${String(maxId + 1).padStart(2, '0')}`;
      };

      const nextId = getNextId();
      const formatMonthYear = () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const newMember = {
        id: nextId,
        name: name.trim(),
        role: role.trim(),
        dept,
        email: email.trim(),
        phone: phone.trim(),
        status,
        joined: formatMonthYear(),
        isCheckedIn: false,
        lastCheckIn: null,
        details: details.trim(),
        address: address.trim(),
        govtProofType,
        govtProofId: govtProofId.trim(),
        govtProofFileName,
        govtProofFileUrl,
        shiftId: 'SHF-01',
        logs: []
      };

      setStaff((prevStaff) => [newMember, ...prevStaff]);
      addToast(`Staff member ${name.trim()} onboarded successfully! Assigned ID: ${nextId}.`, 'success');
    }

    setIsFormOpen(false);
    setEditingMember(null);
  };

  // Offboard Delete Handler
  const handleDeleteMember = (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to offboard and retire ${memberName} (${memberId}) from active HMS rosters?`)) {
      setStaff((prevStaff) => prevStaff.filter((m) => m.id !== memberId));
      addToast(`Staff member ${memberName} has been retired from rosters.`, 'warning');
      if (viewingLogsMember && viewingLogsMember.id === memberId) {
        setViewingLogsMember(null);
      }
    }
  };



  // Triggering the Onboard Form overlay with specific member loaded
  const handleEditClick = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  // Helper for parsing joined date safely for sorting
  const parseJoined = (dateStr) => {
    try {
      return new Date(dateStr).getTime() || 0;
    } catch (e) {
      return 0;
    }
  };

  // Search filter matching ID, name, role or department, plus status, duty and sorting
  const filteredStaff = staff
    .filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'all' || member.dept === deptFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesDuty = dutyFilter === 'all' || 
        (dutyFilter === 'on-duty' ? member.isCheckedIn : !member.isCheckedIn);
      return matchesSearch && matchesDept && matchesStatus && matchesDuty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'id-asc':
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        case 'id-desc':
          return b.id.localeCompare(a.id, undefined, { numeric: true });
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'joined-desc':
          return parseJoined(b.joined) - parseJoined(a.joined);
        case 'joined-asc':
          return parseJoined(a.joined) - parseJoined(b.joined);
        default:
          return 0;
      }
    });

  const isFilterActive = searchTerm !== '' || deptFilter !== 'all' || statusFilter !== 'all' || dutyFilter !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setDeptFilter('all');
    setStatusFilter('all');
    setDutyFilter('all');
    setSortBy('id-desc');
    addToast('Search filters reset to default.', 'info');
  };

  return (
    <div className="rooms-page-container">
      
      {/* 1. Page Header */}
      <div className="rooms-header-wrapper">
        <div className="rooms-header-info">
          <h2 className="rooms-header-title">Staff & Employee Directory</h2>
          <p className="rooms-header-subtitle">Onboard agents, assign department clearance, and check shift attendance logs.</p>
        </div>
 
        <button 
          onClick={() => {
            setEditingMember(null);
            setIsFormOpen(true);
          }}
          className="rooms-btn-register"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Onboard New Staff</span>
        </button>
      </div>
 
      {/* 2. Unified Stats Summary Grid */}
      <StaffStats data={staff} />
 
      {/* 3. Unified Workspace (Filters + Table) */}
      <div className="booking-workspace-container">
        <StaffFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          deptFilter={deptFilter}
          onDeptFilterChange={setDeptFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dutyFilter={dutyFilter}
          onDutyFilterChange={setDutyFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClearFilters={handleClearFilters}
          isFilterActive={isFilterActive}
        />

        <StaffTable 
          data={filteredStaff}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onViewLogs={setViewingLogsMember}
          onEdit={handleEditClick}
          onDelete={handleDeleteMember}
          className="!border-none !shadow-none !rounded-none"
        />
      </div>

      {/* 5. Onboard / Edit Staff Drawer Modal overlay */}
      <OnboardStaffForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editingMember={editingMember}
        name={name}
        setName={setName}
        role={role}
        setRole={setRole}
        dept={dept}
        setDept={setDept}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        status={status}
        setStatus={setStatus}
        details={details}
        setDetails={setDetails}
        address={address}
        setAddress={setAddress}
        govtProofType={govtProofType}
        setGovtProofType={setGovtProofType}
        govtProofId={govtProofId}
        setGovtProofId={setGovtProofId}
        govtProofFileName={govtProofFileName}
        setGovtProofFileName={setGovtProofFileName}
        govtProofFileUrl={govtProofFileUrl}
        setGovtProofFileUrl={setGovtProofFileUrl}
        errors={errors}
      />

      {/* 6. View Activity Attendance Logs Modal dialog */}
      <StaffLogModal 
        viewingLogsMember={viewingLogsMember}
        onClose={() => setViewingLogsMember(null)}
      />

      {/* 7. Visual Toast notifications overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-alert ${
              toast.type === 'success' ? 'toast-alert-success' :
              toast.type === 'warning' ? 'toast-alert-warning' :
              toast.type === 'error' ? 'toast-alert-error' :
              'toast-alert-info'
            }`}
          >
            <span className="toast-message">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="toast-close"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default StaffPage;
