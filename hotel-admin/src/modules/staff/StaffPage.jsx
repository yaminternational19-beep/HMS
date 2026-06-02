import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import StaffFilters from './components/StaffFilters';
import StaffStats from './components/StaffStats';
import StaffTable from './components/StaffTable';
import OnboardStaffForm from './components/OnboardStaffForm';
import { getShifts } from '../../api/shifts';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../api/staff';
import { exportToPDF, exportToExcel } from './services/staffExport.service';
import './styles/staff.css';

const StaffPage = () => {
  // Roster lists and search filters states
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({ total: 0, activeDuty: 0, onLeave: 0, frontOffice: 0 });
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

  const fetchStaff = async () => {
    try {
      const res = await getStaff();
      if (res && res.success) {
        setStaff(res.data.staff || []);
        setStats(res.data.stats || { total: 0, activeDuty: 0, onLeave: 0, frontOffice: 0 });
      }
    } catch (err) {
      console.error('Failed to load staff directory', err);
      addToast('Failed to load staff directory from database.', 'error');
    }
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
    fetchStaff();
  }, []);

  // Lock background scrolls when overlays are open
  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen]);

  // Load and pre-fill form fields on edit vs add
  useEffect(() => {
    if (isFormOpen) {
      setErrors({});
      if (editingMember) {
        setName(editingMember.name);
        setDept(editingMember.dept);
        setPassword(editingMember.password || '');
        setEmail(editingMember.email || '');
        
        // Set Contact Phone
        setPhoneCountry(editingMember.phoneCountry || '+971');
        setPhoneNo(editingMember.phoneNo || '');

        // Set Emergency Contact Phone
        setEmergencyCountry(editingMember.emergencyCountry || '+971');
        setEmergencyNo(editingMember.emergencyNo || '');

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const trimmedDept = dept.trim();
    const isComplianceRole = 
      trimmedDept && (trimmedDept.toLowerCase().includes('front') || trimmedDept.toLowerCase().includes('maintain'));

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('dept', trimmedDept);
    formData.append('password', isComplianceRole ? password.trim() : '');
    formData.append('email', email.trim());
    formData.append('phoneCountry', phoneCountry);
    formData.append('phoneNo', phoneNo.trim());
    formData.append('emergencyCountry', emergencyCountry);
    formData.append('emergencyNo', emergencyNo.trim());
    formData.append('shiftId', shiftId);
    formData.append('shift_id', shiftId);
    formData.append('status', status);
    formData.append('address', address.trim());
    formData.append('govtProofType', govtProofType);
    formData.append('govtProofId', govtProofId.trim());

    // Check profile file upload
    const profileInput = document.getElementById('profileFileInput');
    if (profileInput && profileInput.files[0]) {
      formData.append('profileFile', profileInput.files[0]);
    } else {
      formData.append('profileFileName', profileFileName || '');
      formData.append('profileFileUrl', profileFileUrl || '');
    }

    // Check government scan upload
    const govtInput = document.getElementById('govtProofFileInput');
    if (govtInput && govtInput.files[0]) {
      formData.append('govtProofFile', govtInput.files[0]);
    } else {
      formData.append('govtProofFileName', govtProofFileName || '');
      formData.append('govtProofFileUrl', govtProofFileUrl || '');
    }

    if (editingMember) {
      // Edit mode: map update
      try {
        const res = await updateStaff(editingMember.id, formData);
        if (res && res.success) {
          addToast(`Staff profile for ${name.trim()} updated successfully.`, 'success');
          fetchStaff();
        }
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || 'Failed to update staff profile.';
        addToast(errMsg, 'error');
      }
    } else {
      // Onboard mode: create new member
      try {
        const res = await createStaff(formData);
        if (res && res.success) {
          addToast(`Staff member ${name.trim()} onboarded successfully! Assigned ID: ${res.data.id}.`, 'success');
          fetchStaff();
        }
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || 'Failed to onboard staff agent.';
        addToast(errMsg, 'error');
      }
    }

    setIsFormOpen(false);
    setEditingMember(null);
  };

  // Offboard Delete Handler
  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to offboard and retire ${memberName} (${memberId}) from active HMS rosters?`)) {
      try {
        const res = await deleteStaff(memberId);
        if (res && res.success) {
          addToast(`Staff member ${memberName} has been retired from rosters.`, 'warning');
          fetchStaff();
        }
      } catch (err) {
        console.error(err);
        addToast('Failed to retire staff member.', 'error');
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

  // Extract unique departments/roles from staff directory dynamically
  const uniqueDepartments = ['all', ...new Set(staff.map(m => m.dept).filter(Boolean))];

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
      <StaffStats stats={stats} data={staff} />
 
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
          departments={uniqueDepartments}
          onClearFilters={handleClearFilters}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        <StaffTable 
          data={filteredStaff}
          shifts={shifts}
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
