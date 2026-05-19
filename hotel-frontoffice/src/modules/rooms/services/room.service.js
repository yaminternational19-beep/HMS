import { ROOM_STATUS } from '../constants/roomStatus';

// Mock database for Rooms
export const MOCK_ROOMS = Array.from({ length: 48 }, (_, i) => {
  const number = i + 1;
  const floor = Math.floor(i / 8) + 1;
  const roomNumber = `${floor}${String(number % 8 || 8).padStart(2, '0')}`;

  // Randomly distribute room types
  const types = ['Single', 'Double', 'Deluxe', 'Super Deluxe', 'Family Suite', 'Presidential Suite'];
  const typeIndex = Math.floor(Math.random() * types.length);
  const type = types[typeIndex];

  // Assign base pricing based on type
  const basePrices = {
    'Single': 1500,
    'Double': 2500,
    'Deluxe': 4000,
    'Super Deluxe': 6000,
    'Family Suite': 8500,
    'Presidential Suite': 15000
  };
  const price = basePrices[type];

  // Randomly assign statuses
  const statuses = Object.values(ROOM_STATUS);
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    id: `RM-${roomNumber}`,
    roomNumber,
    floor: `${floor}Floor`,
    type,
    price,
    status,
    guestName: status === ROOM_STATUS.OCCUPIED ? 'John Doe' : null,
    cleaningStaff: status === ROOM_STATUS.CLEANING ? 'Maria S.' : null,
    amenities: ['WiFi', 'AC', 'TV', type.includes('Suite') ? 'Mini Bar' : null].filter(Boolean)
  };
});
