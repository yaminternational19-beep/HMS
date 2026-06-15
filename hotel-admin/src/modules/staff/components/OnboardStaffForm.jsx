import React, { useState, useEffect } from 'react';
import { Plus, X, Camera, Eye, EyeOff } from 'lucide-react';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ActionButton from '../../../components/ActionButton';

const PhoneInput = PhoneInputPkg.default ? PhoneInputPkg.default : PhoneInputPkg;

const DEFAULT_ROLES = [
  'Corporate Director',
  'Front Desk Manager',
  'Concierge Clerk',
  'Executive Housekeeper',
  'Maintenance Lead',
  'Head Chef',
  'Security Officer'
];

const OnboardStaffForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingMember,
  shifts = [],
  name,
  setName,
  dept,
  setDept,
  email,
  setEmail,
  phoneCountry,
  setPhoneCountry,
  phoneNo,
  setPhoneNo,
  emergencyCountry,
  setEmergencyCountry,
  emergencyNo,
  setEmergencyNo,
  shiftId,
  setShiftId,
  status,
  setStatus,
  address,
  setAddress,
  govtProofType,
  setGovtProofType,
  govtProofId,
  setGovtProofId,
  govtProofFileName,
  setGovtProofFileName,
  govtProofFileUrl,
  setGovtProofFileUrl,
  profileFileName,
  setProfileFileName,
  profileFileUrl,
  setProfileFileUrl,
  errors,
  password,
  setPassword
}) => {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle custom Role if not in default list when editing
  useEffect(() => {
    if (isOpen) {
      setIsCreatingRole(false);
      setNewRoleName('');
      if (editingMember && editingMember.dept) {
        if (!roles.some(r => r.toLowerCase() === editingMember.dept.toLowerCase())) {
          setRoles(prev => [...prev, editingMember.dept]);
        }
      }
    }
  }, [isOpen, editingMember]);

  const handleAddNewRole = (e) => {
    e.preventDefault();
    const cleanName = newRoleName.trim();
    if (!cleanName) return;

    if (roles.some((r) => r.toLowerCase() === cleanName.toLowerCase())) {
      alert('This role already exists.');
      return;
    }

    setRoles((prev) => [...prev, cleanName]);
    setDept(cleanName);
    setNewRoleName('');
    setIsCreatingRole(false);
  };

  if (!isOpen) return null;

  return (
    <div className="rooms-modal-overlay" onClick={onClose}>
      <div className="rooms-modal-container animate-slide-up !max-w-[600px]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rooms-modal-header">
          <div className="rooms-modal-header-left">
            <span className="rooms-modal-header-icon-wrapper">
              <Plus size={18} />
            </span>
            <div>
              <h3 className="rooms-modal-header-title">
                {editingMember ? `Adjust Clearance - ${editingMember.name}` : 'Onboard New Staff Agent'}
              </h3>
              <p className="rooms-modal-header-subtitle">
                Configure names, shift schedules, profiles, and administrative credentials.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rooms-modal-close-btn"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="rooms-modal-form">
          <div className="rooms-modal-body max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            
            {/* Profile Picture Uploader */}
            <div className="flex flex-col items-center justify-center pb-4 border-b border-slate-100 mb-4">
              <div 
                className="relative h-20 w-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden group hover:border-slate-350 hover:bg-slate-100/50 transition-all shadow-inner"
                onClick={() => document.getElementById('profileFileInput').click()}
              >
                {profileFileUrl ? (
                  <img 
                    src={profileFileUrl} 
                    alt="Profile Preview" 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold">
                    <Camera size={18} className="text-slate-400 mb-1" />
                    <span>Upload Picture</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                  Change
                </div>
              </div>
              <input
                type="file"
                id="profileFileInput"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfileFileName(file.name);
                    setProfileFileUrl(URL.createObjectURL(file));
                  }
                }}
              />
              {profileFileName && (
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5 truncate max-w-[150px]">
                  {profileFileName}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label" htmlFor="staffName">Full Name *</label>
              <input
                type="text"
                id="staffName"
                value={name}
                placeholder="e.g. Sarah Connor"
                onChange={(e) => setName(e.target.value)}
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              />
              {errors.name && (
                <p className="form-error-msg">{errors.name}</p>
              )}
            </div>

            {/* Roster Title Role Selector with Add Custom workflow */}
            <div>
              <div className="form-label-row">
                <label className="form-label form-label-nomargin" htmlFor="staffDept">Roster Title Role *</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingRole(!isCreatingRole)}
                  className="form-action-link"
                >
                  {isCreatingRole ? 'Cancel Custom' : '+ Add Custom Role'}
                </button>
              </div>

              {!isCreatingRole ? (
                <select
                  id="staffDept"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className={`form-select ${errors.dept ? 'form-input-error' : ''}`}
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="form-sub-builder">
                  <div className="w-full">
                    <input
                      type="text"
                      value={newRoleName}
                      placeholder="e.g. Guest Relations Supervisor"
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="form-input form-input-small"
                    />
                  </div>
                  <div className="form-button-row mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingRole(false);
                        setNewRoleName('');
                      }}
                      className="form-sub-btn-secondary"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewRole}
                      className="form-sub-btn-primary"
                    >
                      Save Role
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Operational HMS Password (for Maintenance & Front Office roles only) */}
            {dept && (dept.toLowerCase().includes('front') || dept.toLowerCase().includes('maintain')) && (
              <div className="space-y-1 mb-4 animate-fade-in relative">
                <label className="form-label" htmlFor="staffPassword">
                  HMS Operation Password {editingMember ? '(Optional)' : '*'}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="staffPassword"
                    value={password || ''}
                    placeholder={editingMember ? "Leave empty to keep current password" : "Enter operation password"}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`form-input pr-10 ${errors.password ? 'form-input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none bg-transparent border-0 cursor-pointer flex items-center"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error-msg">{errors.password}</p>
                )}
              </div>
            )}

            {/* Email (Optional) */}
            <div>
              <label className="form-label" htmlFor="staffEmail">Email Address (Optional)</label>
              <input
                type="text"
                id="staffEmail"
                value={email}
                placeholder="username@hms.com"
                onChange={(e) => setEmail(e.target.value)}
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              />
              {errors.email && (
                <p className="form-error-msg">{errors.email}</p>
              )}
            </div>

            <div className="form-grid-2col">
              {/* Phone (Mandatory) */}
              <div>
                <label className="form-label" htmlFor="staffPhone">Contact Phone *</label>
                <div className="flex w-full phone-input-container">
                  <PhoneInput
                    country={'in'}
                    value={(phoneCountry ? phoneCountry.replace('+', '') : '') + (phoneNo || '')}
                    onChange={(value, data) => {
                      if (data && data.dialCode) {
                        setPhoneCountry(`+${data.dialCode}`);
                        setPhoneNo(value.slice(data.dialCode.length));
                      }
                    }}
                    inputClass={`!w-full !h-10 !text-sm !rounded-md !border-slate-300 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 ${errors.phone ? '!border-red-500' : ''}`}
                    buttonClass={`!border-slate-300 !rounded-l-md !bg-slate-50 ${errors.phone ? '!border-red-500' : ''}`}
                    containerClass="!w-full"
                  />
                </div>
                {errors.phone && (
                  <p className="form-error-msg">{errors.phone}</p>
                )}
              </div>

              {/* Emergency Contact Phone (Mandatory) */}
              <div>
                <label className="form-label" htmlFor="emergencyPhone">Emergency Contact *</label>
                <div className="flex w-full phone-input-container">
                  <PhoneInput
                    country={'in'}
                    value={(emergencyCountry ? emergencyCountry.replace('+', '') : '') + (emergencyNo || '')}
                    onChange={(value, data) => {
                      if (data && data.dialCode) {
                        setEmergencyCountry(`+${data.dialCode}`);
                        setEmergencyNo(value.slice(data.dialCode.length));
                      }
                    }}
                    inputClass={`!w-full !h-10 !text-sm !rounded-md !border-slate-300 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 ${errors.emergencyPhone ? '!border-red-500' : ''}`}
                    buttonClass={`!border-slate-300 !rounded-l-md !bg-slate-50 ${errors.emergencyPhone ? '!border-red-500' : ''}`}
                    containerClass="!w-full"
                  />
                </div>
                {errors.emergencyPhone && (
                  <p className="form-error-msg">{errors.emergencyPhone}</p>
                )}
              </div>
            </div>

            <div className="form-grid-2col">
              {/* Shift Selection (Mandatory) */}
              <div>
                <label className="form-label" htmlFor="staffShift">Roster Shift Time *</label>
                <select
                  id="staffShift"
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  className={`form-select ${errors.shiftId ? 'form-input-error' : ''}`}
                >
                  <option value="">-- Choose Shift --</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id} : {s.time})
                    </option>
                  ))}
                </select>
                {errors.shiftId && (
                  <p className="form-error-msg">{errors.shiftId}</p>
                )}
              </div>

              {/* Status Toggle */}
              <div>
                <label className="form-label" htmlFor="staffStatus">Current active status</label>
                <select
                  id="staffStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-select uppercase tracking-wide font-bold"
                >
                  <option value="active">Active (On Duty Eligible)</option>
                  <option value="on-leave">On Leave / Vacation</option>
                </select>
              </div>
            </div>

            {/* Physical Address */}
            <div>
              <label className="form-label" htmlFor="staffAddress">Physical Address *</label>
              <textarea
                id="staffAddress"
                rows={2}
                value={address}
                placeholder="e.g. Apartment 14B, Marina heights, Dubai, UAE"
                onChange={(e) => setAddress(e.target.value)}
                className={`form-input !h-auto py-2 ${errors.address ? 'form-input-error' : ''}`}
              />
              {errors.address && (
                <p className="form-error-msg">{errors.address}</p>
              )}
            </div>

            {/* Government ID Verification */}
            <div className="form-grid-2col">
              <div>
                <label className="form-label" htmlFor="staffGovtProofType">Govt Verification Proof *</label>
                <select
                  id="staffGovtProofType"
                  value={govtProofType}
                  onChange={(e) => setGovtProofType(e.target.value)}
                  className="form-select"
                >
                  <option value="pan">PAN</option>
                  <option value="aadhar">Aadhar</option>
                  <option value="driving lisce">Driving License</option>
                  <option value="passport">Passport</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="staffGovtProofId">Govt ID Proof Number *</label>
                <input
                  type="text"
                  id="staffGovtProofId"
                  value={govtProofId}
                  placeholder="e.g. P12345678"
                  onChange={(e) => setGovtProofId(e.target.value)}
                  className={`form-input ${errors.govtProofId ? 'form-input-error' : ''}`}
                />
                {errors.govtProofId && (
                  <p className="form-error-msg">{errors.govtProofId}</p>
                )}
              </div>
            </div>

            {/* Document Upload Input */}
            <div className="space-y-1">
              <label className="form-label">Upload Government ID Document / Scan *</label>
              
              <div className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                govtProofFileName 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : errors.govtProofFile 
                    ? 'border-rose-350 bg-rose-50/20' 
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
              }`} onClick={() => document.getElementById('govtProofFileInput').click()}>
                <input
                  type="file"
                  id="govtProofFileInput"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setGovtProofFileName(file.name);
                      if (file.type.startsWith('image/')) {
                        setGovtProofFileUrl(URL.createObjectURL(file));
                      } else {
                        setGovtProofFileUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop');
                      }
                    }
                  }}
                />
                
                {govtProofFileName ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 border border-emerald-250 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                      {govtProofFileName.split('.').pop()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 truncate max-w-[220px]">
                        {govtProofFileName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium">Click to replace document</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGovtProofFileName('');
                        setGovtProofFileUrl('');
                      }}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[9px] text-slate-500 font-bold tracking-wider uppercase border border-slate-200 transition-colors shadow-sm mt-1"
                    >
                      Clear File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <svg className="mx-auto h-8 w-8 text-slate-400 shrink-0" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-xs font-semibold text-slate-600">
                      <span>Click to upload image or PDF</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, or PDF up to 10MB</p>
                  </div>
                )}
              </div>
              
              {errors.govtProofFile && (
                <p className="form-error-msg">{errors.govtProofFile}</p>
              )}
            </div>

          </div>

          {/* Action Footer Buttons */}
          <div className="rooms-modal-footer">
            <ActionButton 
              variant="secondary" 
              onClick={onClose}
              className="form-footer-btn-secondary"
            >
              Cancel
            </ActionButton>
            <ActionButton 
              type="submit"
              variant="primary" 
              className="form-footer-btn-primary"
            >
              {editingMember ? 'Save Clearance Profile' : 'Onboard Agent'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardStaffForm;
