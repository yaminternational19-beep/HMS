import React from 'react';
import { Plus, X } from 'lucide-react';
import ActionButton from '../../../components/ActionButton';

const OnboardStaffForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingMember,
  name,
  setName,
  role,
  setRole,
  dept,
  setDept,
  email,
  setEmail,
  phone,
  setPhone,
  status,
  setStatus,
  details,
  setDetails,
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
  errors
}) => {
  if (!isOpen) return null;

  return (
    <div className="rooms-modal-overlay" onClick={onClose}>
      <div className="rooms-modal-container animate-slide-up" onClick={(e) => e.stopPropagation()}>
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
                Configure names, departments, contact, and administrative details.
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
          <div className="rooms-modal-body">
            
            {/* Full Name */}
            <div>
              <label className="form-label" htmlFor="staffName">Full Name *</label>
              <input
                type="text"
                id="staffName"
                value={name}
                placeholder="e.g. Liam Neeson"
                onChange={(e) => setName(e.target.value)}
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              />
              {errors.name && (
                <p className="form-error-msg">{errors.name}</p>
              )}
            </div>

            {/* Role Title */}
            <div>
              <label className="form-label" htmlFor="staffRole">Roster Title Role *</label>
              <input
                type="text"
                id="staffRole"
                value={role}
                placeholder="e.g. Concierge Supervisor"
                onChange={(e) => setRole(e.target.value)}
                className={`form-input ${errors.role ? 'form-input-error' : ''}`}
              />
              {errors.role && (
                <p className="form-error-msg">{errors.role}</p>
              )}
            </div>

            {/* Dept Selection */}
            <div>
              <label className="form-label" htmlFor="staffDept">Clearance Department</label>
              <select
                id="staffDept"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="form-select"
              >
                {['Administration', 'Front Office', 'Housekeeping', 'Maintenance', 'Food & Beverage'].map((deptName) => (
                  <option key={deptName} value={deptName}>{deptName}</option>
                ))}
              </select>
            </div>

            <div className="form-grid-2col">
              {/* Email */}
              <div>
                <label className="form-label" htmlFor="staffEmail">Email Address *</label>
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

              {/* Phone */}
              <div>
                <label className="form-label" htmlFor="staffPhone">Contact Phone *</label>
                <input
                  type="text"
                  id="staffPhone"
                  value={phone}
                  placeholder="+971 50 000 0000"
                  onChange={(e) => setPhone(e.target.value)}
                  className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                />
                {errors.phone && (
                  <p className="form-error-msg">{errors.phone}</p>
                )}
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
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="Social Security">Social Security Number</option>
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
                      // If image, create local object url for preview, else use a placeholder illustration
                      if (file.type.startsWith('image/')) {
                        setGovtProofFileUrl(URL.createObjectURL(file));
                      } else {
                        // PDF placeholder illustration
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

            {/* Professional Description / Details */}
            <div>
              <label className="form-label" htmlFor="staffDetails">Professional Description / Details *</label>
              <textarea
                id="staffDetails"
                rows={2}
                value={details}
                placeholder="e.g. Dedicated professional with credentials in customer service and emergency response."
                onChange={(e) => setDetails(e.target.value)}
                className={`form-input !h-auto py-2 ${errors.details ? 'form-input-error' : ''}`}
              />
              {errors.details && (
                <p className="form-error-msg">{errors.details}</p>
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
