import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import StaffFilters from './components/StaffFilters';
import StaffStats from './components/StaffStats';
import StaffTable from './components/StaffTable';
import OnboardStaffForm from './components/OnboardStaffForm';
import StaffLogModal from './components/StaffLogModal';
import { getShifts } from '../../api/shifts';
import { exportToPDF, exportToExcel } from './services/staffExport.service';
import './styles/staff.css';

// Rich Mock data for Staff with pre-populated checkin logs, emergency numbers, and avatar images
const initialStaff = [
  { 
    id: 'STF-01', 
    uniqueCode: '83719273',
    name: 'Praveen Reddy', 
    role: 'Corporate Director', 
    dept: 'Administration', 
    email: 'praveen@hms.com', 
    phone: '+971 50 123 4567', 
    emergencyPhone: '+971 50 999 1111',
    status: 'active', 
    joined: 'Oct 2021',
    isCheckedIn: true,
    lastCheckIn: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    address: 'Villa 12, Palm Jumeirah, Dubai, UAE',
    govtProofType: 'Passport',
    govtProofId: 'DXB-983726-P',
    govtProofFileName: 'passport_scan_praveen.pdf',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop',
    profileFileName: 'profile_praveen.jpg',
    profileFileUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop',
    shiftId: 'SHF-04',
    logs: [
      { id: 101, date: 'May 22, 2026', checkIn: '08:30 AM', checkOut: '06:00 PM', duration: '9h 30m' },
      { id: 102, date: 'May 21, 2026', checkIn: '08:45 AM', checkOut: '05:45 PM', duration: '9h 00m' }
    ]
  },
  { 
    id: 'STF-02', 
    uniqueCode: '29384756',
    password: 'SarahHMS2026',
    name: 'Sarah Connor', 
    role: 'Front Desk Manager', 
    dept: 'Front Office', 
    email: 'sarah.c@hms.com', 
    phone: '+971 50 234 5678', 
    emergencyPhone: '+971 50 999 2222',
    status: 'active', 
    joined: 'Jan 2022',
    isCheckedIn: false,
    lastCheckIn: null,
    address: 'Apt 204, Downtown Boulevard, Dubai, UAE',
    govtProofType: 'National ID',
    govtProofId: '784-1995-1234567-1',
    govtProofFileName: 'emirates_id_front_sarah.jpg',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
    profileFileName: 'profile_sarah.jpg',
    profileFileUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop',
    shiftId: 'SHF-01',
    logs: [
      { id: 201, date: 'May 22, 2026', checkIn: '09:00 AM', checkOut: '05:00 PM', duration: '8h 00m' },
      { id: 202, date: 'May 21, 2026', checkIn: '08:50 AM', checkOut: '05:10 PM', duration: '8h 20m' }
    ]
  },
  { 
    id: 'STF-03', 
    uniqueCode: '50192837',
    password: 'JohnHMS2026',
    name: 'John Doe', 
    role: 'Concierge Clerk', 
    dept: 'Front Office', 
    email: 'john.doe@hms.com', 
    phone: '+971 50 345 6789', 
    emergencyPhone: '+971 50 999 3333',
    status: 'active', 
    joined: 'Jun 2023',
    isCheckedIn: false,
    lastCheckIn: null,
    address: 'Building A-1, Al Barsha Heights, Dubai, UAE',
    govtProofType: 'Driver License',
    govtProofId: 'DL-2023-887162',
    govtProofFileName: 'uae_license_johndoe.png',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    profileFileName: 'profile_johndoe.jpg',
    profileFileUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop',
    shiftId: 'SHF-02',
    logs: [
      { id: 301, date: 'May 22, 2026', checkIn: '10:00 AM', checkOut: '06:00 PM', duration: '8h 00m' }
    ]
  },
  { 
    id: 'STF-04', 
    uniqueCode: '49382716',
    name: 'Maria Gonzalez', 
    role: 'Executive Housekeeper', 
    dept: 'Housekeeping', 
    email: 'maria.g@hms.com', 
    phone: '+971 50 456 7890', 
    emergencyPhone: '+971 50 999 4444',
    status: 'active', 
    joined: 'Mar 2022',
    isCheckedIn: true,
    lastCheckIn: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    address: 'Flat 10, Jumeirah Village Circle, Dubai, UAE',
    govtProofType: 'National ID',
    govtProofId: '784-1988-7654321-2',
    govtProofFileName: 'emirates_id_front_maria.png',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop',
    profileFileName: 'profile_maria.jpg',
    profileFileUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=500&auto=format&fit=crop',
    shiftId: 'SHF-01',
    logs: [
      { id: 401, date: 'May 22, 2026', checkIn: '08:00 AM', checkOut: '04:00 PM', duration: '8h 00m' }
    ]
  },
  { 
    id: 'STF-05', 
    uniqueCode: '60293847',
    password: 'DavidHMS2026',
    name: 'David Smith', 
    role: 'Maintenance Lead', 
    dept: 'Maintenance', 
    email: '', 
    phone: '+971 50 567 8901', 
    emergencyPhone: '+971 50 999 5555',
    status: 'on-leave', 
    joined: 'Aug 2020',
    isCheckedIn: false,
    lastCheckIn: null,
    address: 'Street 4B, Al Quoz Industrial Area, Dubai, UAE',
    govtProofType: 'Driver License',
    govtProofId: 'DL-2019-992019',
    govtProofFileName: 'driver_license_david.jpg',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop',
    profileFileName: 'profile_david.jpg',
    profileFileUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop',
    shiftId: 'SHF-03',
    logs: [
      { id: 501, date: 'May 15, 2026', checkIn: '08:30 AM', checkOut: '05:30 PM', duration: '9h 00m' }
    ]
  },
  { 
    id: 'STF-06', 
    uniqueCode: '71029384',
    name: 'Alex Wong', 
    role: 'Head Chef', 
    dept: 'Food & Beverage', 
    email: 'alex.w@hms.com', 
    phone: '+971 50 678 9012', 
    emergencyPhone: '+971 50 999 6666',
    status: 'active', 
    joined: 'Nov 2022',
    isCheckedIn: false,
    lastCheckIn: null,
    address: 'Penthouse 3, Dubai Marina Heights, Dubai, UAE',
    govtProofType: 'Passport',
    govtProofId: 'HKG-887162-W',
    govtProofFileName: 'passport_scan_alexwong.pdf',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop',
    profileFileName: 'profile_alex.jpg',
    profileFileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
    shiftId: 'SHF-02',
    logs: [
      { id: 601, date: 'May 22, 2026', checkIn: '11:00 AM', checkOut: '08:00 PM', duration: '9h 00m' }
    ]
  }
];

const StaffPage = () => {
  // Roster lists and search filters states
  const [staff, setStaff] = useState(initialStaff);
  const [shifts, setShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dutyFilter, setDutyFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id-desc');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals active triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingLogsMember, setViewingLogsMember] = useState(null);

  // Active form field inputs
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // Country Code Phone states
  const [phoneCountry, setPhoneCountry] = useState('+971');
  const [phoneNo, setPhoneNo] = useState('');

  // Emergency contact states
  const [emergencyCountry, setEmergencyCountry] = useState('+971');
  const [emergencyNo, setEmergencyNo] = useState('');

  // Shift assignment state
  const [shiftId, setShiftId] = useState('');

  const [status, setStatus] = useState('active');
  const [address, setAddress] = useState('');
  const [govtProofType, setGovtProofType] = useState('Passport');
  const [govtProofId, setGovtProofId] = useState('');
  const [govtProofFileName, setGovtProofFileName] = useState('');
  const [govtProofFileUrl, setGovtProofFileUrl] = useState('');

  // Profile Picture state
  const [profileFileName, setProfileFileName] = useState('');
  const [profileFileUrl, setProfileFileUrl] = useState('');

  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Fetch active shifts config dynamically from database on mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await getShifts();
        if (res && res.success) {
          setShifts(res.data.shifts || []);
        }
      } catch (err) {
        console.error('Failed to load shifts for Onboard Dropdowns', err);
      }
    };
    fetchShifts();
  }, []);

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
        setDept(editingMember.dept);
        setPassword(editingMember.password || '');
        setEmail(editingMember.email || '');
        
        // Parse Contact Phone
        const pParts = (editingMember.phone || '').split(' ');
        if (pParts.length >= 2 && pParts[0].startsWith('+')) {
          setPhoneCountry(pParts[0]);
          setPhoneNo(pParts.slice(1).join(' '));
        } else {
          setPhoneCountry('+971');
          setPhoneNo(editingMember.phone || '');
        }

        // Parse Emergency Contact Phone
        const eParts = (editingMember.emergencyPhone || '').split(' ');
        if (eParts.length >= 2 && eParts[0].startsWith('+')) {
          setEmergencyCountry(eParts[0]);
          setEmergencyNo(eParts.slice(1).join(' '));
        } else {
          setEmergencyCountry('+971');
          setEmergencyNo(editingMember.emergencyPhone || '');
        }

        setShiftId(editingMember.shiftId || '');
        setStatus(editingMember.status);
        setAddress(editingMember.address || '');
        setGovtProofType(editingMember.govtProofType || 'Passport');
        setGovtProofId(editingMember.govtProofId || '');
        setGovtProofFileName(editingMember.govtProofFileName || '');
        setGovtProofFileUrl(editingMember.govtProofFileUrl || '');

        setProfileFileName(editingMember.profileFileName || '');
        setProfileFileUrl(editingMember.profileFileUrl || '');
      } else {
        setName('');
        setDept('');
        setPassword('');
        setEmail('');
        setPhoneCountry('+971');
        setPhoneNo('');
        setEmergencyCountry('+971');
        setEmergencyNo('');
        setShiftId('');
        setStatus('active');
        setAddress('');
        setGovtProofType('Passport');
        setGovtProofId('');
        setGovtProofFileName('');
        setGovtProofFileUrl('');
        setProfileFileName('');
        setProfileFileUrl('');
      }
    }
  }, [isFormOpen, editingMember]);

  // Roster input fields validation (email is optional, phone is mandatory, emergency is mandatory)
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required.';
    if (!dept.trim()) newErrors.dept = 'Roster Title Role is required.';
    
    const isComplianceRole = 
      dept && (dept.toLowerCase().includes('front') || dept.toLowerCase().includes('maintain'));
    
    if (isComplianceRole && !password.trim()) {
      newErrors.password = 'HMS Operation Password is required for operational roles.';
    }
    
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!phoneNo.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!emergencyNo.trim()) {
      newErrors.emergencyPhone = 'Emergency number is required.';
    }

    if (!shiftId) {
      newErrors.shiftId = 'Shift selection is required.';
    }

    if (!address.trim()) {
      newErrors.address = 'Physical address is required.';
    }

    if (!govtProofId.trim()) {
      newErrors.govtProofId = 'Government ID proof number is required.';
    }

    if (!govtProofFileName) {
      newErrors.govtProofFile = 'Government ID document scan is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add / Edit Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fullPhone = `${phoneCountry} ${phoneNo.trim()}`;
    const fullEmergency = `${emergencyCountry} ${emergencyNo.trim()}`;

    const trimmedDept = dept.trim();
    const isComplianceRole = 
      trimmedDept && (trimmedDept.toLowerCase().includes('front') || trimmedDept.toLowerCase().includes('maintain'));

    if (editingMember) {
      // Edit mode: map update
      setStaff((prevStaff) => 
        prevStaff.map((m) => m.id === editingMember.id 
          ? {
              ...m,
              name: name.trim(),
              role: trimmedDept,
              dept: trimmedDept,
              password: isComplianceRole ? password.trim() : '',
              email: email.trim(),
              phone: fullPhone,
              emergencyPhone: fullEmergency,
              shiftId,
              status,
              address: address.trim(),
              govtProofType,
              govtProofId: govtProofId.trim(),
              govtProofFileName,
              govtProofFileUrl,
              profileFileName,
              profileFileUrl
            }
          : m
        )
      );
      addToast(`Staff profile for ${name.trim()} updated successfully.`, 'success');
    } else {
      // Onboard mode: generate incremental ID and ensure uniqueness
      const getNextId = () => {
        const numericIds = staff.map(m => parseInt(m.id.replace('STF-', '')));
        const maxId = Math.max(...numericIds, 0);
        return `STF-${String(maxId + 1).padStart(2, '0')}`;
      };

      const generateUniqueCode = () => {
        let code;
        let isUnique = false;
        while (!isUnique) {
          code = String(Math.floor(10000000 + Math.random() * 90000000));
          if (!staff.some(m => m.uniqueCode === code)) {
            isUnique = true;
          }
        }
        return code;
      };

      const nextId = getNextId();
      const newCode = generateUniqueCode();
      const formatMonthYear = () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const newMember = {
        id: nextId,
        uniqueCode: newCode,
        password: isComplianceRole ? password.trim() : '',
        name: name.trim(),
        role: trimmedDept,
        dept: trimmedDept,
        email: email.trim(),
        phone: fullPhone,
        emergencyPhone: fullEmergency,
        shiftId,
        status,
        joined: formatMonthYear(),
        isCheckedIn: false,
        lastCheckIn: null,
        address: address.trim(),
        govtProofType,
        govtProofId: govtProofId.trim(),
        govtProofFileName,
        govtProofFileUrl,
        profileFileName,
        profileFileUrl: profileFileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop',
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
        (member.uniqueCode && member.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'all' || member.dept === deptFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesDuty = dutyFilter === 'all' || 
        (dutyFilter === 'on-duty' ? member.isCheckedIn : !member.isCheckedIn);
      const matchesShift = shiftFilter === 'all' || member.shiftId === shiftFilter;
      return matchesSearch && matchesDept && matchesStatus && matchesDuty && matchesShift;
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

  const isFilterActive = searchTerm !== '' || deptFilter !== 'all' || statusFilter !== 'all' || dutyFilter !== 'all' || shiftFilter !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setDeptFilter('all');
    setStatusFilter('all');
    setDutyFilter('all');
    setShiftFilter('all');
    setSelectedIds([]);
    setSortBy('id-desc');
    addToast('Search filters reset to default.', 'info');
  };

  const handleExportPDF = () => {
    if (selectedIds.length === 0) {
      addToast('Please select staff members from the list before exporting.', 'warning');
      return;
    }
    const dataToExport = staff.filter((m) => selectedIds.includes(m.id));
    exportToPDF(dataToExport, addToast);
  };

  const handleExportExcel = () => {
    if (selectedIds.length === 0) {
      addToast('Please select staff members from the list before exporting.', 'warning');
      return;
    }
    const dataToExport = staff.filter((m) => selectedIds.includes(m.id));
    exportToExcel(dataToExport, addToast);
  };

  return (
    <div className="rooms-page-container">
      
      {/* 1. Page Header */}
      <div className="rooms-header-wrapper">
        <div className="rooms-header-info">
          <h2 className="rooms-header-title">Staff & Employee Directory</h2>
          <p className="rooms-header-subtitle">Onboard agents, assign department shifts, and check roster attendance logs.</p>
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
          shiftFilter={shiftFilter}
          onShiftFilterChange={setShiftFilter}
          shifts={shifts}
          onClearFilters={handleClearFilters}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        <StaffTable 
          data={filteredStaff}
          shifts={shifts}
          onViewLogs={setViewingLogsMember}
          onEdit={handleEditClick}
          onDelete={handleDeleteMember}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          className="!border-none !shadow-none !rounded-none"
        />
      </div>

      {/* 5. Onboard / Edit Staff Drawer Modal overlay */}
      <OnboardStaffForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editingMember={editingMember}
        shifts={shifts}
        name={name}
        setName={setName}
        dept={dept}
        setDept={setDept}
        email={email}
        setEmail={setEmail}
        phoneCountry={phoneCountry}
        setPhoneCountry={setPhoneCountry}
        phoneNo={phoneNo}
        setPhoneNo={setPhoneNo}
        emergencyCountry={emergencyCountry}
        setEmergencyCountry={setEmergencyCountry}
        emergencyNo={emergencyNo}
        setEmergencyNo={setEmergencyNo}
        shiftId={shiftId}
        setShiftId={setShiftId}
        status={status}
        setStatus={setStatus}
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
        profileFileName={profileFileName}
        setProfileFileName={setProfileFileName}
        profileFileUrl={profileFileUrl}
        setProfileFileUrl={setProfileFileUrl}
        errors={errors}
        password={password}
        setPassword={setPassword}
      />

      {/* 6. View Activity Attendance Logs Modal dialog */}
      <StaffLogModal 
        viewingLogsMember={viewingLogsMember}
        shifts={shifts}
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
