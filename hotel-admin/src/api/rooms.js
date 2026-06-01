import axiosInstance from './axiosInstance';

/**
 * Builds a FormData payload separating binary files from pre-existing text URLs
 * and serializing arrays to clean JSON strings for DRF consumption.
 */
const buildRoomFormData = (roomData) => {
  const formData = new FormData();
  
  formData.append('roomNumber', roomData.roomNumber || '');
  formData.append('floor', roomData.floor || '');
  formData.append('type', roomData.type || '');
  formData.append('status', roomData.status || '');
  formData.append('price', roomData.price ?? 0);
  formData.append('capacity', roomData.capacity ?? 2);
  formData.append('bedType', roomData.bedType || '');
  formData.append('description', roomData.description || '');
  formData.append('lastCleaned', roomData.lastCleaned || '');
  
  // Serialize amenities to standard JSON list string
  formData.append('amenities', JSON.stringify(roomData.amenities || []));
  
  // Parse images list to separate raw binary files from existing URLs
  const existingUrls = [];
  if (roomData.images && roomData.images.length > 0) {
    roomData.images.forEach((img) => {
      if (img && img.file) {
        // This is a new raw binary File upload
        formData.append('images', img.file);
      } else if (img && img.url) {
        // This is a pre-existing URL (e.g. from template or database)
        existingUrls.push(img.url);
      } else if (typeof img === 'string') {
        // This is a direct URL string
        existingUrls.push(img);
      }
    });
  }
  
  formData.append('existing_images', JSON.stringify(existingUrls));
  return formData;
};

/**
 * Fetches all rooms from backend database, applying any search or filter keys.
 */
export const getRooms = () => {
  return axiosInstance.get('/rooms/');
};

/**
 * Persists a newly created Room asset in the database, uploading binary images if attached.
 */
export const createRoom = (roomData) => {
  const formData = buildRoomFormData(roomData);
  return axiosInstance.post('/rooms/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Updates specifications of an existing Room asset by room number, uploading any new binary files.
 */
export const updateRoom = (roomNumber, roomData) => {
  const formData = buildRoomFormData(roomData);
  return axiosInstance.put(`/rooms/${roomNumber}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Retires / Deletes a Room asset from active inventory.
 */
export const deleteRoom = (roomNumber) => {
  return axiosInstance.delete(`/rooms/${roomNumber}/`);
};
