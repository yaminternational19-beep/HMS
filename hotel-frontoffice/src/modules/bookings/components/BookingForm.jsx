import React, { useState, useEffect } from 'react';
import { MdClose, MdAdd, MdDelete, MdChevronRight, MdChevronLeft, MdCheckCircle } from 'react-icons/md';
import { ROOM_TYPES } from '../constants/bookingStatus';
import PhoneInput from '../../../components/PhoneInput';
import ActionButton from '../../../components/ActionButton';
import { useToastStore } from '../../../store/useToastStore';
import { getRoomsForBooking } from '../../../api/bookingRooms';
import { ROOM_STATUS } from '../../rooms/constants/roomStatus';
import { uploadBookingDocument } from '../../../api/booking';

const BookingForm = ({ isOpen, onClose, onSubmit, editingData }) => {
  const [step, setStep] = useState(1);
  const initialBlankState = {
    bookingDetails: {
      bookingId: '',
      bookingSource: 'Walk-in',
      checkIn: '',
      checkOut: '',
      nights: 0,
      roomNumber: '',
      roomType: 'Deluxe',
      floor: '',
      adultsCount: 1,
      childrenCount: 0,
      extraBed: false,
      purposeOfVisit: 'Tourism',
      expectedArrival: '',
      specialRequests: '',
      status: 'Confirmed'
    },
    primaryGuest: {
      guestName: '',
      gender: 'Male',
      dob: '',
      age: '',
      phone: '',
      alternatePhone: '',
      email: '',
      occupation: '',
      nationality: 'Indian',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    idProof: {
      idType: 'Aadhaar',
      idNumber: '',
      frontFileName: '',
      backFileName: '',
      verificationStatus: 'Pending',
      passportNumber: '',
      passportExpiry: '',
      visaNumber: '',
      visaExpiryDate: '',
      countryOfIssue: ''
    },
    additionalGuests: [],
    paymentDetails: {
      roomRent: '',
      extraCharges: '',
      discount: '',
      gst: '',
      advancePaid: '',
      finalAmount: 0,
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      transactionId: '',
      invoiceNumber: ''
    },
    roomDetails: {
      smoking: 'Non-Smoking',
      vehicleNumber: '',
      luggageCount: 0
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    notes: ''
  };

  const [formData, setFormData] = useState(initialBlankState);
  const [roomsList, setRoomsList] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  const handleFileUpload = async (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    const isFront = side === 'front';
    if (isFront) setIsUploadingFront(true);
    else setIsUploadingBack(true);

    try {
      const response = await uploadBookingDocument(file);
      if (response && response.success) {
        const fileUrl = response.data.url;
        handleSectionChange('idProof', isFront ? 'frontFileName' : 'backFileName', fileUrl);
        useToastStore.getState().addToast(`${isFront ? 'Front' : 'Back'} side ID proof uploaded successfully.`, 'success');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      useToastStore.getState().addToast('Failed to upload document to server.', 'error');
    } finally {
      if (isFront) setIsUploadingFront(false);
      else setIsUploadingBack(false);
    }
  };

  const handleMemberFileUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadBookingDocument(file);
      if (response && response.success) {
        handleMemberChange(idx, 'docName', response.data.url);
        useToastStore.getState().addToast(`Member document uploaded successfully.`, 'success');
      }
    } catch (error) {
      console.error('Member document upload failed:', error);
      useToastStore.getState().addToast('Failed to upload member document.', 'error');
    }
  };

  // Fetch rooms list from backend for booking assignment
  useEffect(() => {
    if (isOpen) {
      const fetchRooms = async () => {
        try {
          const includeRoom = editingData ? (editingData.room || editingData.roomNumber || '') : '';
          const response = await getRoomsForBooking(includeRoom);
          if (response && response.success) {
            setRoomsList(response.data?.rooms || []);
            setAvailableTypes(response.data?.roomTypes || []);
          }
        } catch (error) {
          console.error('Failed to load rooms list for booking:', error);
          useToastStore.getState().addToast('Failed to load rooms list from backend.', 'error');
        }
      };
      fetchRooms();
    }
  }, [isOpen, editingData]);

  // Auto-select first available room type if the current type is not in the available types list
  useEffect(() => {
    if (isOpen && availableTypes.length > 0) {
      const currentType = formData.bookingDetails.roomType;
      if (!availableTypes.includes(currentType)) {
        setFormData(prev => ({
          ...prev,
          bookingDetails: {
            ...prev.bookingDetails,
            roomType: availableTypes[0],
            roomNumber: '' // reset room number since type changed
          }
        }));
      }
    }
  }, [isOpen, availableTypes]);

  // Populate data when opening
  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        if (editingData.raw) {
          setFormData(editingData.raw);
        } else {

          setFormData({
            ...initialBlankState,
            bookingDetails: {
              ...initialBlankState.bookingDetails,
              bookingId: editingData.id || '',
              bookingSource: 'Walk-in',
              checkIn: editingData.checkIn ? `${editingData.checkIn}T12:00` : '',
              checkOut: editingData.checkOut ? `${editingData.checkOut}T11:00` : '',
              nights: 1,
              roomNumber: editingData.room || '',
              roomType: editingData.roomType || 'Deluxe',
              status: editingData.status || 'Confirmed'
            },
            primaryGuest: {
              ...initialBlankState.primaryGuest,
              guestName: editingData.guestName || '',
              phone: editingData.phone || ''
            },
            paymentDetails: {
              ...initialBlankState.paymentDetails,
              roomRent: editingData.amount ? String(editingData.amount) : '',
              finalAmount: editingData.amount || 0,
              paymentStatus: editingData.paymentStatus || 'Pending'
            }
          });
        }
      } else {
        const randNum = Math.floor(100 + Math.random() * 900);
        setFormData({
          ...initialBlankState,
          bookingDetails: {
            ...initialBlankState.bookingDetails,
            bookingId: `BKG-NEW-${randNum}`
          },
          paymentDetails: {
            ...initialBlankState.paymentDetails,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
          }
        });
      }
      setStep(1);
    }
  }, [isOpen, editingData]);

  // Auto calculate nights
  useEffect(() => {
    const { checkIn, checkOut } = formData.bookingDetails;
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffTime = outDate - inDate;
      if (!isNaN(diffTime) && diffTime > 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFormData(prev => ({
          ...prev,
          bookingDetails: {
            ...prev.bookingDetails,
            nights: diffDays
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          bookingDetails: {
            ...prev.bookingDetails,
            nights: 0
          }
        }));
      }
    }
  }, [formData.bookingDetails.checkIn, formData.bookingDetails.checkOut]);

  // Auto calculate primary guest age from DOB
  useEffect(() => {
    const dob = formData.primaryGuest.dob;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setFormData(prev => ({
        ...prev,
        primaryGuest: {
          ...prev.primaryGuest,
          age: calculatedAge >= 0 ? calculatedAge : 0
        }
      }));
    }
  }, [formData.primaryGuest.dob]);

  // Auto calculate final amount
  useEffect(() => {
    const rent = Number(formData.paymentDetails.roomRent) || 0;
    const nights = Number(formData.bookingDetails.nights) || 1;
    const extra = Number(formData.paymentDetails.extraCharges) || 0;
    const disc = Number(formData.paymentDetails.discount) || 0;
    const tax = Number(formData.paymentDetails.gst) || 0;

    const finalAmount = (rent * nights) + extra - disc + tax;
    setFormData(prev => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        finalAmount: finalAmount >= 0 ? finalAmount : 0
      }
    }));
  }, [
    formData.paymentDetails.roomRent,
    formData.bookingDetails.nights,
    formData.paymentDetails.extraCharges,
    formData.paymentDetails.discount,
    formData.paymentDetails.gst
  ]);

  const handleSectionChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleRoomTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      bookingDetails: {
        ...prev.bookingDetails,
        roomType: newType,
        roomNumber: '' // reset room number when type changes
      },
      paymentDetails: {
        ...prev.paymentDetails,
        roomRent: '' // reset rent
      }
    }));
  };

  const handleRoomNumberChange = (e) => {
    const newRoomNo = e.target.value;
    const selectedRoom = roomsList.find(r => r.roomNumber === newRoomNo);

    setFormData(prev => ({
      ...prev,
      bookingDetails: {
        ...prev.bookingDetails,
        roomNumber: newRoomNo
      },
      paymentDetails: {
        ...prev.paymentDetails,
        roomRent: selectedRoom ? String(selectedRoom.price) : prev.paymentDetails.roomRent
      }
    }));
  };

  const availableRooms = roomsList.filter(r =>
    r.type === formData.bookingDetails.roomType &&
    (r.status === ROOM_STATUS.AVAILABLE || r.roomNumber === formData.bookingDetails.roomNumber)
  );

  // Additional guests dynamic state handlers
  const handleAddMember = () => {
    useToastStore.getState().addToast('Added additional guest member slot.', 'info');
    setFormData(prev => ({
      ...prev,
      additionalGuests: [
        ...prev.additionalGuests,
        {
          name: '',
          gender: 'Male',
          age: '',
          relation: '',
          phone: '',
          idType: 'Aadhaar',
          idNumber: ''
        }
      ]
    }));
  };

  const handleRemoveMember = (index) => {
    useToastStore.getState().addToast('Removed guest member slot.', 'warning');
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, idx) => idx !== index)
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.additionalGuests];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, additionalGuests: updated };
    });
  };

  const isForeignGuest = () => {
    const nation = formData.primaryGuest.nationality || '';
    return nation.toLowerCase() !== 'indian' && nation.toLowerCase() !== 'india';
  };

  const validateStep1 = () => {
    const { guestName, phone } = formData.primaryGuest;
    const { roomNumber, checkIn, checkOut } = formData.bookingDetails;
    const { idNumber } = formData.idProof;

    if (!guestName.trim()) return 'Guest Name is required.';
    if (!phone.trim()) return 'Phone Number is required.';
    if (!roomNumber.trim()) return 'Room Number is required.';
    if (!checkIn) return 'Check-In date & time is required.';
    if (!checkOut) return 'Check-Out date & time is required.';
    if (!idNumber.trim()) return 'Government ID Number is required.';

    if (isForeignGuest()) {
      const { passportNumber, visaNumber } = formData.idProof;
      if (!passportNumber.trim()) return 'Passport Number is required for Foreign Guests.';
      if (!visaNumber.trim()) return 'Visa Number is required for Foreign Guests.';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validate Step 1 details
    const step1Err = validateStep1();
    if (step1Err) {
      setStep(1); // Return to Step 1 to show the error
      alert(`Step 1 Validation Error:\n${step1Err}`);
      return;
    }

    // 2. Validate Step 2 details (Room Rent is mandatory)
    const rent = Number(formData.paymentDetails.roomRent);
    if (isNaN(rent) || rent <= 0) {
      setStep(2); // Return to Step 2 to show the error
      alert('Step 2 Validation Error:\nPlease enter a valid Room Rent amount on Step 2.');
      return;
    }

    // Adapt structured object into flat model expected by BookingTable/Page
    const totalGuests = 1 + formData.additionalGuests.length;
    const flatBooking = {
      guestName: formData.primaryGuest.guestName,
      phone: formData.primaryGuest.phone,
      room: formData.bookingDetails.roomNumber,
      roomType: formData.bookingDetails.roomType,
      checkIn: formData.bookingDetails.checkIn.split('T')[0],
      checkOut: formData.bookingDetails.checkOut.split('T')[0],
      status: formData.bookingDetails.status,
      paymentStatus: formData.paymentDetails.paymentStatus,
      totalGuests: totalGuests,
      amount: formData.paymentDetails.finalAmount,
      raw: formData // Embedded structured data
    };

    onSubmit(flatBooking);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">SNOWLINE BLOOM Guest Registration Portal</h3>
            <p className="text-xs text-slate-500 mt-0.5">Complete steps to register guests and assign reservation details.</p>
          </div>
          <ActionButton
            onClick={onClose}
            variant="remove-member"
            icon={MdClose}
            iconSize={20}
          />
        </div>

        {/* Step progress indicator */}
        <div className="bg-slate-50 px-8 py-3 border-b border-slate-100 flex items-center gap-6">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${step === 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Booking & Primary Guest</span>
          </div>
          <div className="h-px bg-slate-200 w-12" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Members & Payments</span>
          </div>
        </div>

        {/* Body content scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            /* STEP 1 CONTAINER */
            <div className="space-y-6">

              {/* SECTION A: BOOKING DETAILS */}
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">A) Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Booking ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Booking ID (Auto)</label>
                    <input
                      type="text"
                      value={formData.bookingDetails.bookingId}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50 font-mono outline-none shadow-sm"
                    />
                  </div>

                  {/* Booking Source */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Booking Source</label>
                    <select
                      value={formData.bookingDetails.bookingSource}
                      onChange={(e) => handleSectionChange('bookingDetails', 'bookingSource', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="Walk-in">Walk-in</option>
                      <option value="Online">Online</option>
                      <option value="OTA">OTA (Travel Portal)</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Room Type</label>
                    <select
                      value={formData.bookingDetails.roomType}
                      onChange={handleRoomTypeChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      {(availableTypes.length > 0 ? availableTypes : ROOM_TYPES).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Room Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Room Number <span className="text-red-500">*</span></label>
                    <select
                      value={formData.bookingDetails.roomNumber}
                      onChange={handleRoomNumberChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="" disabled>Select Available Room</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.roomNumber}>{r.roomNumber} (₹{r.price})</option>
                      ))}
                    </select>
                  </div>

                  {/* Purpose of Visit */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Purpose of Visit</label>
                    <input
                      type="text"
                      value={formData.bookingDetails.purposeOfVisit}
                      onChange={(e) => handleSectionChange('bookingDetails', 'purposeOfVisit', e.target.value)}
                      placeholder="e.g. Business / Tourism"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Check-In Date & Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Check-In Date & Time <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      value={formData.bookingDetails.checkIn}
                      onChange={(e) => handleSectionChange('bookingDetails', 'checkIn', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm cursor-pointer"
                    />
                  </div>

                  {/* Check-Out Date & Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Check-Out Date & Time <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      value={formData.bookingDetails.checkOut}
                      onChange={(e) => handleSectionChange('bookingDetails', 'checkOut', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm cursor-pointer"
                    />
                  </div>

                  {/* Number of Nights */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Number of Nights</label>
                    <input
                      type="number"
                      value={formData.bookingDetails.nights}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50 outline-none shadow-sm"
                    />
                  </div>

                  {/* Adults Count */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Adults Count</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bookingDetails.adultsCount}
                      onChange={(e) => handleSectionChange('bookingDetails', 'adultsCount', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Children Count */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Children Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bookingDetails.childrenCount}
                      onChange={(e) => handleSectionChange('bookingDetails', 'childrenCount', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>


                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Special Requests */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Special Requests</label>
                    <textarea
                      value={formData.bookingDetails.specialRequests}
                      onChange={(e) => handleSectionChange('bookingDetails', 'specialRequests', e.target.value)}
                      placeholder="e.g. Extra pillows, early check-in requests..."
                      rows="2"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Extra Bed Required Toggle */}
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="extraBed"
                      checked={formData.bookingDetails.extraBed}
                      onChange={(e) => handleSectionChange('bookingDetails', 'extraBed', e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer"
                    />
                    <label htmlFor="extraBed" className="text-sm font-semibold text-slate-700 cursor-pointer">
                      Extra Bed Required
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION B: PRIMARY GUEST DETAILS */}
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">B) Primary Guest Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.primaryGuest.guestName}
                      onChange={(e) => handleSectionChange('primaryGuest', 'guestName', e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Gender</label>
                    <select
                      value={formData.primaryGuest.gender}
                      onChange={(e) => handleSectionChange('primaryGuest', 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nationality</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.nationality}
                      onChange={(e) => handleSectionChange('primaryGuest', 'nationality', e.target.value)}
                      placeholder="e.g. Indian"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* DOB */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.primaryGuest.dob}
                      onChange={(e) => handleSectionChange('primaryGuest', 'dob', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm cursor-pointer"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Age</label>
                    <input
                      type="number"
                      value={formData.primaryGuest.age}
                      readOnly
                      placeholder="Calculated"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50 outline-none shadow-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Phone Number <span className="text-red-500">*</span></label>
                    <PhoneInput
                      value={formData.primaryGuest.phone}
                      onChange={(value) => handleSectionChange('primaryGuest', 'phone', value)}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>

                  {/* Alternate Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Alternate Phone</label>
                    <PhoneInput
                      value={formData.primaryGuest.alternatePhone}
                      onChange={(value) => handleSectionChange('primaryGuest', 'alternatePhone', value)}
                      placeholder="e.g. +91 99999 88888"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                    <input
                      type="email"
                      value={formData.primaryGuest.email}
                      onChange={(e) => handleSectionChange('primaryGuest', 'email', e.target.value)}
                      placeholder="e.g. jane@example.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Occupation</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.occupation}
                      onChange={(e) => handleSectionChange('primaryGuest', 'occupation', e.target.value)}
                      placeholder="e.g. Engineer"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.address1}
                      onChange={(e) => handleSectionChange('primaryGuest', 'address1', e.target.value)}
                      placeholder="Street address, P.O. box, company name"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.address2}
                      onChange={(e) => handleSectionChange('primaryGuest', 'address2', e.target.value)}
                      placeholder="Apartment, suite, unit, building, floor"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">City</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.city}
                      onChange={(e) => handleSectionChange('primaryGuest', 'city', e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">State</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.state}
                      onChange={(e) => handleSectionChange('primaryGuest', 'state', e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Country</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.country}
                      onChange={(e) => handleSectionChange('primaryGuest', 'country', e.target.value)}
                      placeholder="Country"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Pincode</label>
                    <input
                      type="text"
                      value={formData.primaryGuest.pincode}
                      onChange={(e) => handleSectionChange('primaryGuest', 'pincode', e.target.value)}
                      placeholder="Zip/Pincode"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>


                </div>
              </div>

              {/* SECTION C: GOVERNMENT ID VERIFICATION */}
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">C) Government ID Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ID Type</label>
                    <select
                      value={formData.idProof.idType}
                      onChange={(e) => handleSectionChange('idProof', 'idType', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Passport">Passport</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  {/* ID Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ID Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.idProof.idNumber}
                      onChange={(e) => handleSectionChange('idProof', 'idNumber', e.target.value)}
                      placeholder="e.g. 1234 5678 9012"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Simulated File Upload Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Upload Front Side</label>
                      {isUploadingFront && <span className="text-[10px] text-blue-600 font-medium animate-pulse">Uploading...</span>}
                      {!isUploadingFront && formData.idProof.frontFileName && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                    </div>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'front')}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none bg-white shadow-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-250 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Upload Back Side</label>
                      {isUploadingBack && <span className="text-[10px] text-blue-600 font-medium animate-pulse">Uploading...</span>}
                      {!isUploadingBack && formData.idProof.backFileName && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                    </div>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'back')}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none bg-white shadow-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-250 cursor-pointer"
                    />
                  </div>
                </div>

                {/* FOREIGN GUEST EXTRA FIELDS */}
                {isForeignGuest() && (
                  <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200/50 space-y-4 animate-fade-in">
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Foreign Guest Supplementary Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Passport Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-amber-700">Passport Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={formData.idProof.passportNumber}
                          onChange={(e) => handleSectionChange('idProof', 'passportNumber', e.target.value)}
                          placeholder="e.g. Z987654"
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                        />
                      </div>

                      {/* Visa Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-amber-700">Visa Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={formData.idProof.visaNumber}
                          onChange={(e) => handleSectionChange('idProof', 'visaNumber', e.target.value)}
                          placeholder="e.g. V12345678"
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                        />
                      </div>

                      {/* Visa Expiry */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-amber-700">Visa Expiry Date</label>
                        <input
                          type="date"
                          value={formData.idProof.visaExpiryDate}
                          onChange={(e) => handleSectionChange('idProof', 'visaExpiryDate', e.target.value)}
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm cursor-pointer"
                        />
                      </div>

                      {/* Country of Issue */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-amber-700">Country of Issue</label>
                        <input
                          type="text"
                          value={formData.idProof.countryOfIssue}
                          onChange={(e) => handleSectionChange('idProof', 'countryOfIssue', e.target.value)}
                          placeholder="e.g. Germany"
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* STEP 2 CONTAINER */
            <div className="space-y-6">

              {/* SECTION A: ADDITIONAL GUESTS / MEMBERS */}
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">A) Additional Guests / Members ({formData.additionalGuests.length})</h4>
                  <ActionButton
                    type="button"
                    onClick={handleAddMember}
                    variant="add-member"
                    icon={MdAdd}
                    iconSize={16}
                  >
                    <span>Add Member</span>
                  </ActionButton>
                </div>

                {formData.additionalGuests.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No additional members added for this stay yet. Click "Add Member" if required.</p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {formData.additionalGuests.map((member, idx) => (
                      <div key={idx} className="relative p-4 border border-slate-150 bg-slate-50/50 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">Guest #{idx + 1}</span>
                          <ActionButton
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            variant="remove-member"
                            icon={MdDelete}
                            iconSize={16}
                            title="Remove Member"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {/* Name */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Guest Name</label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                              placeholder="Full Name"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none bg-white shadow-sm"
                            />
                          </div>

                          {/* Gender */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                            <select
                              value={member.gender}
                              onChange={(e) => handleMemberChange(idx, 'gender', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Age */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
                            <input
                              type="number"
                              value={member.age}
                              onChange={(e) => handleMemberChange(idx, 'age', e.target.value)}
                              placeholder="Age"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none bg-white shadow-sm"
                            />
                          </div>

                          {/* Relation */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Relation</label>
                            <input
                              type="text"
                              value={member.relation}
                              onChange={(e) => handleMemberChange(idx, 'relation', e.target.value)}
                              placeholder="e.g. Spouse"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none bg-white shadow-sm"
                            />
                          </div>

                          {/* Mobile */}
                          <div className="space-y-1 col-span-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number</label>
                            <PhoneInput
                              value={member.phone}
                              onChange={(value) => handleMemberChange(idx, 'phone', value)}
                              placeholder="e.g. +91 99999 77777"
                              inputStyle={{
                                width: '100%',
                                height: '32px',
                                fontSize: '0.75rem',
                                color: '#0f172a',
                                backgroundColor: '#ffffff',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                paddingLeft: '48px',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              }}
                            />
                          </div>

                          {/* ID Type */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">ID Type</label>
                            <select
                              value={member.idType}
                              onChange={(e) => handleMemberChange(idx, 'idType', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                            >
                              <option value="Aadhaar">Aadhaar</option>
                              <option value="Passport">Passport</option>
                              <option value="Driving License">Driving License</option>
                              <option value="Voter ID">Voter ID</option>
                            </select>
                          </div>

                          {/* ID Number */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">ID Number</label>
                            <input
                              type="text"
                              value={member.idNumber}
                              onChange={(e) => handleMemberChange(idx, 'idNumber', e.target.value)}
                              placeholder="ID Card Number"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none bg-white shadow-sm"
                            />
                          </div>

                          {/* Upload ID / Document */}
                          <div className="space-y-1 col-span-1 md:col-span-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Upload ID / Document</label>
                              {member.docName && <span className="text-[10px] text-green-600 font-medium">✓ Uploaded</span>}
                            </div>
                            <input
                              type="file"
                              onChange={(e) => handleMemberFileUpload(e, idx)}
                              className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white shadow-sm file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: PAYMENT DETAILS */}
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">B) Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Room Rent */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Room Rent (per night) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={formData.paymentDetails.roomRent}
                      onChange={(e) => handleSectionChange('paymentDetails', 'roomRent', e.target.value)}
                      placeholder="e.g. 3500"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Extra Charges */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Extra Charges (Amenity/Bed)</label>
                    <input
                      type="number"
                      value={formData.paymentDetails.extraCharges}
                      onChange={(e) => handleSectionChange('paymentDetails', 'extraCharges', e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Discount</label>
                    <input
                      type="number"
                      value={formData.paymentDetails.discount}
                      onChange={(e) => handleSectionChange('paymentDetails', 'discount', e.target.value)}
                      placeholder="e.g. 200"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* GST/Tax */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">GST / Tax</label>
                    <input
                      type="number"
                      value={formData.paymentDetails.gst}
                      onChange={(e) => handleSectionChange('paymentDetails', 'gst', e.target.value)}
                      placeholder="e.g. 630"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Advance Paid */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Advance Paid</label>
                    <input
                      type="number"
                      value={formData.paymentDetails.advancePaid}
                      onChange={(e) => handleSectionChange('paymentDetails', 'advancePaid', e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Final Calculated Amount */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900">Final Calculated Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.paymentDetails.finalAmount}
                      readOnly
                      className="w-full px-3 py-2 border border-blue-200 text-blue-700 bg-blue-50/50 rounded-lg text-sm font-extrabold outline-none shadow-sm"
                    />
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Payment Status</label>
                    <select
                      value={formData.paymentDetails.paymentStatus}
                      onChange={(e) => handleSectionChange('paymentDetails', 'paymentStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Payment Method</label>
                    <select
                      value={formData.paymentDetails.paymentMethod}
                      onChange={(e) => handleSectionChange('paymentDetails', 'paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white cursor-pointer shadow-sm"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Transaction ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Transaction ID</label>
                    <input
                      type="text"
                      value={formData.paymentDetails.transactionId}
                      onChange={(e) => handleSectionChange('paymentDetails', 'transactionId', e.target.value)}
                      placeholder="e.g. TXN98765432"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                    />
                  </div>
                </div>
              </div>



              {/* REMARKS SECTION */}
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-2 shadow-sm">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Stay Notes / Internal Remarks</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes regarding payments, food instructions, late departures..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none bg-white shadow-sm"
                />
              </div>

            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <ActionButton
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Close Portal
          </ActionButton>

          <div className="flex gap-2">
            {step === 2 && (
              <ActionButton
                type="button"
                onClick={() => setStep(1)}
                variant="secondary"
                icon={MdChevronLeft}
                iconSize={20}
              >
                <span>Back</span>
              </ActionButton>
            )}

            {step === 1 ? (
              <ActionButton
                type="button"
                onClick={() => setStep(2)}
                variant="primary"
              >
                <span>Continue</span>
                <MdChevronRight size={20} />
              </ActionButton>
            ) : (
              <ActionButton
                type="button"
                onClick={handleSubmit}
                variant="success"
                icon={MdCheckCircle}
                iconSize={18}
              >
                <span>Confirm & Register Guest</span>
              </ActionButton>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingForm;
