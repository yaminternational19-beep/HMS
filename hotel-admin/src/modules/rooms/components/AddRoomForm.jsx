import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  UploadCloud, 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Compass, 
  ShieldCheck, 
  UtensilsCrossed, 
  Bath,
  Grid,
  DollarSign,
  UserCheck,
  FileText,
  Sparkles,
  Waves,
  ChefHat,
  Flower2,
  Car
} from 'lucide-react';
import ActionButton from '../../../components/ActionButton';
import { 
  ROOM_TYPES as INITIAL_ROOM_TYPES, 
  ROOM_STATUS, 
  FLOOR_NUMBERS as INITIAL_FLOOR_NUMBERS, 
  BED_TYPES as INITIAL_BED_TYPES, 
  AMENITIES as INITIAL_AMENITIES
} from '../constants/roomStatus';

// Amenity to Lucide Icon mapping
const AMENITY_ICONS = {
  'WiFi': Wifi,
  'AC': Wind,
  'TV': Tv,
  'Mini Bar': Coffee,
  'Balcony': Compass,
  'Safe': ShieldCheck,
  'Room Service': UtensilsCrossed,
  'Jacuzzi': Bath,
  'Infinity Pool': Waves,
  'Private Chef': ChefHat,
  'Spa Lounge': Flower2,
  'Valet Parking': Car
};

const AddRoomForm = ({ isOpen, onClose, onAdd, onEdit, editingRoom = null, existingRooms = [] }) => {
  // Option Lists state (supporting dynamic room, bed, floor, and amenities additions)
  const [roomTypes, setRoomTypes] = useState(INITIAL_ROOM_TYPES);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [bedTypes, setBedTypes] = useState(INITIAL_BED_TYPES);
  const [isCreatingBedType, setIsCreatingBedType] = useState(false);
  const [newBedTypeName, setNewBedTypeName] = useState('');

  const [floors, setFloors] = useState(INITIAL_FLOOR_NUMBERS);
  const [isCreatingFloor, setIsCreatingFloor] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  const [amenities, setAmenities] = useState(INITIAL_AMENITIES);
  const [isCreatingAmenity, setIsCreatingAmenity] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');

  // Form Fields State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [floor, setFloor] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [price, setPrice] = useState('3500'); // INR
  const [bedType, setBedType] = useState('Queen');
  const [status, setStatus] = useState('available');
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'AC', 'TV']);
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Validation state
  const [errors, setErrors] = useState({});

  // File upload drag status
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Lock scroll on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form or populate from editing room when opened/closed
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsCreatingType(false);
      setIsCreatingBedType(false);
      setIsCreatingFloor(false);
      setIsCreatingAmenity(false);
      setNewTypeName('');
      setNewBedTypeName('');
      setNewFloorName('');
      setNewAmenityName('');

      if (editingRoom) {
        // Edit Mode: populate states
        setRoomNumber(editingRoom.roomNumber);
        
        // Handle custom Room Type if not in default list
        if (editingRoom.type && !roomTypes.includes(editingRoom.type)) {
          setRoomTypes(prev => [...prev, editingRoom.type]);
        }
        setRoomType(editingRoom.type);

        // Handle custom Floor if not in default list
        if (editingRoom.floor && !floors.includes(editingRoom.floor)) {
          setFloors(prev => [...prev, editingRoom.floor]);
        }
        setFloor(editingRoom.floor);
        
        setCapacity(editingRoom.capacity.toString());
        
        // Parse numerical price
        const parsedPrice = editingRoom.numericPrice 
          ? editingRoom.numericPrice.toString() 
          : editingRoom.price.toString().replace(/[^0-9]/g, '');
        setPrice(parsedPrice);

        // Handle custom Bed Type if not in default list
        if (editingRoom.bedType && !bedTypes.includes(editingRoom.bedType)) {
          setBedTypes(prev => [...prev, editingRoom.bedType]);
        }
        setBedType(editingRoom.bedType);
        
        setStatus(editingRoom.status);
        
        // Handle custom Amenities if not in default list
        if (editingRoom.amenities) {
          editingRoom.amenities.forEach(amenity => {
            if (!amenities.includes(amenity)) {
              setAmenities(prev => [...prev, amenity]);
            }
          });
          setSelectedAmenities(editingRoom.amenities);
        } else {
          setSelectedAmenities([]);
        }

        setDescription(editingRoom.description || '');
        
        // Handle existing images
        if (editingRoom.images) {
          setUploadedImages(editingRoom.images.map((url, idx) => ({
            url,
            name: `Photo ${idx + 1}`,
            isExisting: true
          })));
        } else {
          setUploadedImages([]);
        }
      } else {
        // Add Mode: reset states to defaults
        setRoomNumber('');
        setRoomType(roomTypes[0] || '');
        setFloor(floors[0] || '');
        setCapacity('2');
        setPrice('3500');
        setBedType(bedTypes[2] || 'Queen');
        setStatus('available');
        setSelectedAmenities(['WiFi', 'AC', 'TV']);
        setDescription('');
        setUploadedImages([]);
        setFloors(INITIAL_FLOOR_NUMBERS);
        setAmenities(INITIAL_AMENITIES);
      }
    }
  }, [isOpen, editingRoom]);

  if (!isOpen) return null;

  // Custom room type creator handler
  const handleAddNewType = (e) => {
    e.preventDefault();
    const cleanName = newTypeName.trim();
    if (!cleanName) return;

    if (roomTypes.some(t => t.toLowerCase() === cleanName.toLowerCase())) {
      setErrors(prev => ({ ...prev, newType: 'This room type already exists' }));
      return;
    }

    setRoomTypes(prev => [...prev, cleanName]);
    setRoomType(cleanName);
    setNewTypeName('');
    setIsCreatingType(false);
    setErrors(prev => ({ ...prev, newType: null }));
  };

  // Custom bed type creator handler
  const handleAddNewBedType = (e) => {
    e.preventDefault();
    const cleanName = newBedTypeName.trim();
    if (!cleanName) return;

    if (bedTypes.some(b => b.toLowerCase() === cleanName.toLowerCase())) {
      setErrors(prev => ({ ...prev, newBedType: 'This bed configuration already exists' }));
      return;
    }

    setBedTypes(prev => [...prev, cleanName]);
    setBedType(cleanName);
    setNewBedTypeName('');
    setIsCreatingBedType(false);
    setErrors(prev => ({ ...prev, newBedType: null }));
  };

  // Custom floor level creator handler
  const handleAddNewFloor = (e) => {
    e.preventDefault();
    const cleanName = newFloorName.trim();
    if (!cleanName) return;

    if (floors.some(f => f.toLowerCase() === cleanName.toLowerCase())) {
      setErrors(prev => ({ ...prev, newFloor: 'This floor level already exists' }));
      return;
    }

    setFloors(prev => [...prev, cleanName]);
    setFloor(cleanName);
    setNewFloorName('');
    setIsCreatingFloor(false);
    setErrors(prev => ({ ...prev, newFloor: null }));
  };

  // Custom amenity creator handler
  const handleAddNewAmenity = (e) => {
    e.preventDefault();
    const cleanName = newAmenityName.trim();
    if (!cleanName) return;

    if (amenities.some(a => a.toLowerCase() === cleanName.toLowerCase())) {
      setErrors(prev => ({ ...prev, newAmenity: 'This amenity already exists' }));
      return;
    }

    setAmenities(prev => [...prev, cleanName]);
    setSelectedAmenities(prev => [...prev, cleanName]);
    setNewAmenityName('');
    setIsCreatingAmenity(false);
    setErrors(prev => ({ ...prev, newAmenity: null }));
  };

  // Toggle amenity selection
  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Handle Drag & Drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Handle Browser File Input Select
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Read files and convert to object URLs for thumbnail previews
  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validImages = fileArray.filter(file => file.type.startsWith('image/'));

    const imageObjects = validImages.map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setUploadedImages(prev => [...prev, ...imageObjects]);
  };

  const handleRemoveImage = (indexToRemove) => {
    // Revoke object URL if it was created locally
    if (!uploadedImages[indexToRemove].isExisting) {
      URL.revokeObjectURL(uploadedImages[indexToRemove].url);
    }
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Room Number
    const cleanRoomNum = roomNumber.trim();
    if (!cleanRoomNum) {
      newErrors.roomNumber = 'Room Number is required.';
    } else if (!/^[a-zA-Z0-9-]+$/.test(cleanRoomNum)) {
      newErrors.roomNumber = 'Alphanumeric or hyphens only.';
    } else if (!editingRoom && existingRooms.some(r => r.roomNumber.toString().toLowerCase() === cleanRoomNum.toLowerCase())) {
      newErrors.roomNumber = 'This Room Number already exists in inventory.';
    }

    // Validate Price
    const numericPrice = parseFloat(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      newErrors.price = 'Price must be a positive number.';
    }

    // Validate Capacity
    const numericCap = parseInt(capacity);
    if (!capacity || isNaN(numericCap) || numericCap <= 0) {
      newErrors.capacity = 'Capacity must be at least 1 guest.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build the new Room item in Rupee format
    const newRoomItem = {
      id: roomNumber.trim(),
      roomNumber: roomNumber.trim(),
      type: roomType,
      floor: floor,
      status: status,
      price: `₹${parseFloat(price).toLocaleString('en-IN')}/night`,
      numericPrice: parseFloat(price),
      capacity: parseInt(capacity),
      bedType: bedType,
      amenities: selectedAmenities,
      description: description.trim() || 'No description provided.',
      images: uploadedImages.length > 0 
        ? uploadedImages.map(img => img.url) 
        : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop&q=60'],
      lastCleaned: editingRoom ? editingRoom.lastCleaned : 'Just registered'
    };

    if (editingRoom) {
      onEdit(newRoomItem);
    } else {
      onAdd(newRoomItem);
    }
  };

  return (
    <div className="rooms-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="rooms-modal-container animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="rooms-modal-header">
          <div className="rooms-modal-header-left">
            <span className="rooms-modal-header-icon-wrapper">
              <Plus size={18} />
            </span>
            <div>
              <h3 className="rooms-modal-header-title">
                {editingRoom ? `Update Lodging Asset - Room ${editingRoom.roomNumber}` : 'Register New Lodging Asset'}
              </h3>
              <p className="rooms-modal-header-subtitle">
                {editingRoom ? 'Modify specifications, amenities, rate or state settings.' : 'Configure features, capabilities, pricing, and availability states.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rooms-modal-close-btn"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="rooms-modal-form">
          <div className="rooms-modal-body">
            
            {/* SECTION 1: KEY IDENTIFIERS */}
            <div>
              <div className="form-section-title">
                <Grid size={12} className="text-accent" />
                <span>Basic Lodging Identifiers</span>
              </div>
              
              <div className="form-grid-2col">
                {/* Room Number */}
                <div>
                  <label className="form-label" htmlFor="roomNumber">Room Number *</label>
                  <input
                    type="text"
                    id="roomNumber"
                    value={roomNumber}
                    disabled={!!editingRoom}
                    placeholder="e.g. 305"
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className={`form-input ${errors.roomNumber ? 'form-input-error' : ''} ${editingRoom ? 'form-input-disabled' : ''}`}
                  />
                  {errors.roomNumber && (
                    <p className="form-error-msg">{errors.roomNumber}</p>
                  )}
                </div>

                {/* Floor select with dynamic inline builder */}
                <div>
                  <div className="form-label-row">
                    <label className="form-label form-label-nomargin" htmlFor="floor">Floor Level</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingFloor(!isCreatingFloor)}
                      className="form-action-link"
                    >
                      {isCreatingFloor ? 'Cancel New' : '+ Add Custom Floor'}
                    </button>
                  </div>

                  {!isCreatingFloor ? (
                    <select
                      id="floor"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="form-select"
                    >
                      {floors.map(fl => (
                        <option key={fl} value={fl}>{fl}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="form-sub-builder">
                      <div>
                        <input
                          type="text"
                          value={newFloorName}
                          placeholder="e.g. 6th Floor"
                          onChange={(e) => setNewFloorName(e.target.value)}
                          className={`form-input form-input-small ${errors.newFloor ? 'form-input-error' : ''}`}
                        />
                        {errors.newFloor && (
                          <p className="form-error-msg">{errors.newFloor}</p>
                        )}
                      </div>
                      <div className="form-button-row">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingFloor(false);
                            setNewFloorName('');
                          }}
                          className="form-sub-btn-secondary"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewFloor}
                          className="form-sub-btn-primary"
                        >
                          Save Floor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: CATEGORY & TYPES */}
            <div>
              <div className="form-section-title">
                <Sparkles size={12} className="text-accent" />
                <span>Room Style & Custom Categorization</span>
              </div>

              <div className="form-section-spaced">
                {/* Room Type Dropdown with Add Custom workflow */}
                <div>
                  <div className="form-label-row">
                    <label className="form-label form-label-nomargin" htmlFor="roomType">Room Classification Type *</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingType(!isCreatingType)}
                      className="form-action-link"
                    >
                      {isCreatingType ? 'Cancel New Type' : '+ Add Custom Type'}
                    </button>
                  </div>

                  {!isCreatingType ? (
                    <select
                      id="roomType"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="form-select"
                    >
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="form-sub-builder">
                      <div>
                        <input
                          type="text"
                          value={newTypeName}
                          placeholder="e.g. Presidential Suite"
                          onChange={(e) => setNewTypeName(e.target.value)}
                          className={`form-input form-input-small ${errors.newType ? 'form-input-error' : ''}`}
                        />
                        {errors.newType && (
                          <p className="form-error-msg">{errors.newType}</p>
                        )}
                      </div>
                      <div className="form-button-row">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingType(false);
                            setNewTypeName('');
                          }}
                          className="form-sub-btn-secondary"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewType}
                          className="form-sub-btn-primary"
                        >
                          Save Type
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-grid-2col">
                  {/* Bed Type with dynamic inline creator */}
                  <div>
                    <div className="form-label-row">
                      <label className="form-label form-label-nomargin" htmlFor="bedType">Bed Configuration</label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingBedType(!isCreatingBedType)}
                        className="form-action-link"
                      >
                        {isCreatingBedType ? 'Cancel New Bed' : '+ Add Custom Bed'}
                      </button>
                    </div>

                    {!isCreatingBedType ? (
                      <select
                        id="bedType"
                        value={bedType}
                        onChange={(e) => setBedType(e.target.value)}
                        className="form-select"
                      >
                        {bedTypes.map(bed => (
                          <option key={bed} value={bed}>{bed} Bed</option>
                        ))}
                      </select>
                    ) : (
                      <div className="form-sub-builder">
                        <div>
                          <input
                            type="text"
                            value={newBedTypeName}
                            placeholder="e.g. Imperial Emperor King"
                            onChange={(e) => setNewBedTypeName(e.target.value)}
                            className={`form-input form-input-small ${errors.newBedType ? 'form-input-error' : ''}`}
                          />
                          {errors.newBedType && (
                            <p className="form-error-msg">{errors.newBedType}</p>
                          )}
                        </div>
                        <div className="form-button-row">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingBedType(false);
                              setNewBedTypeName('');
                            }}
                            className="form-sub-btn-secondary"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={handleAddNewBedType}
                            className="form-sub-btn-primary"
                          >
                            Save Bed
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="form-label" htmlFor="capacity">Capacity (Guests) *</label>
                    <input
                      type="number"
                      id="capacity"
                      min="1"
                      max="12"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className={`form-input ${errors.capacity ? 'form-input-error' : ''}`}
                    />
                    {errors.capacity && (
                      <p className="form-error-msg">{errors.capacity}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PRICING & STATUS */}
            <div>
              <div className="form-section-title">
                <DollarSign size={12} className="text-accent" />
                <span>Financial Rate & Asset State</span>
              </div>

              <div className="form-grid-2col">
                {/* Nightly Price in Rupees */}
                <div>
                  <label className="form-label" htmlFor="price">Nightly Rate (₹ INR) *</label>
                  <div className="form-input-relative-wrapper">
                    <span className="form-input-prefix">₹</span>
                    <input
                      type="number"
                      id="price"
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`form-input form-input-with-prefix ${errors.price ? 'form-input-error' : ''}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="form-error-msg">{errors.price}</p>
                  )}
                </div>

                {/* Room Availability Status */}
                <div>
                  <label className="form-label" htmlFor="status">Current Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select form-select-bold"
                  >
                    <option value="available">Available (Clean)</option>
                    <option value="occupied">Occupied</option>
                    <option value="dirty">Dirty / HK Needed</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: AMENITIES WITH CUSTOM ADDER */}
            <div>
              <div className="form-section-header">
                <div className="form-section-title form-section-title-nomargin">
                  <UserCheck size={12} className="text-accent" />
                  <span>Luxury & Standard Amenities</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingAmenity(!isCreatingAmenity)}
                  className="form-action-link"
                >
                  {isCreatingAmenity ? 'Cancel New' : '+ Add Custom Amenity'}
                </button>
              </div>

              {isCreatingAmenity && (
                <div className="form-sub-builder mb-3">
                  <div>
                    <input
                      type="text"
                      value={newAmenityName}
                      placeholder="e.g. In-Room Espresso Machine"
                      onChange={(e) => setNewAmenityName(e.target.value)}
                      className={`form-input form-input-small ${errors.newAmenity ? 'form-input-error' : ''}`}
                    />
                    {errors.newAmenity && (
                      <p className="form-error-msg">{errors.newAmenity}</p>
                    )}
                  </div>
                  <div className="form-button-row">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingAmenity(false);
                        setNewAmenityName('');
                      }}
                      className="form-sub-btn-secondary"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewAmenity}
                      className="form-sub-btn-primary"
                    >
                      Save Amenity
                    </button>
                  </div>
                </div>
              )}

              <div className="form-checkbox-grid">
                {amenities.map(amenity => {
                  const Icon = AMENITY_ICONS[amenity];
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <label 
                      key={amenity}
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`form-checkbox-label ${isChecked ? 'form-checkbox-checked' : ''}`}
                    >
                      {Icon && <Icon size={12} className={isChecked ? 'text-accent' : 'text-slate-400'} />}
                      <span>{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* SECTION 5: DESCRIPTION */}
            <div>
              <div className="form-section-title">
                <FileText size={12} className="text-accent" />
                <span>Promotional Description</span>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key room features, view descriptions (e.g. ocean, skyline), special decorations, or unique guidelines..."
                className="form-textarea"
              />
            </div>

            {/* SECTION 6: MEDIA IMAGES */}
            <div>
              <div className="form-section-title">
                <UploadCloud size={12} className="text-accent" />
                <span>Media Assets & Photos</span>
              </div>

              <div 
                className={`upload-dropzone group ${isDragging ? 'upload-dropzone-dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <UploadCloud size={28} className="upload-dropzone-icon" />
                <p className="upload-dropzone-title">Drag & drop photo assets here</p>
                <p className="upload-dropzone-subtitle">or click to browse your desktop files (supports PNG, JPG, WEBP)</p>
              </div>

              {/* Photo preview list */}
              {uploadedImages.length > 0 && (
                <div className="image-preview-grid">
                  {uploadedImages.map((image, idx) => (
                    <div key={idx} className="image-preview-card">
                      <img src={image.url} alt={image.name} className="image-preview-img" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="image-preview-remove"
                        title="Remove Photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Modal Actions Footer */}
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
              {editingRoom ? 'Save Changes' : 'Register Asset'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomForm;
