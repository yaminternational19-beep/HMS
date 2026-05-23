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

  // Assign descriptions based on room classification
  const descriptions = {
    'Single': 'A cozy and charming room perfect for solo business travelers. Offers modern styling, high-speed WiFi, and a peaceful garden view.',
    'Double': 'A stylish and comfortable room perfect for couples. Equipped with dual AC, smart TV, and plush premium mattresses.',
    'Deluxe': 'An upgraded premium room option with an expansive queen size bed, premium acoustics, and quiet central AC.',
    'Super Deluxe': 'A spacious and secure executive retreat. Includes in-room electronic safe, premium mini bar, and large windows.',
    'Family Suite': 'A lavish suite layout complete with double queen beds, a separate sitting lounge, and city skyline views.',
    'Presidential Suite': 'The pinnacle of luxury living. Features grand bedrooms, panoramic dining parlor, private jacuzzi, and smart integrations.'
  };

  // Assign guest capacity limits
  const capacities = {
    'Single': 1,
    'Double': 2,
    'Deluxe': 2,
    'Super Deluxe': 3,
    'Family Suite': 4,
    'Presidential Suite': 6
  };

  // Assign bed configurations
  const bedTypes = {
    'Single': 'Single',
    'Double': 'Double',
    'Deluxe': 'Queen',
    'Super Deluxe': 'King',
    'Family Suite': 'Double Queen',
    'Presidential Suite': 'Super King'
  };

  // Assign visual cover photo assets
  const images = {
    'Single': ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop&q=60'],
    'Double': ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop&q=60'],
    'Deluxe': ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop&q=60'],
    'Super Deluxe': ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop&q=60'],
    'Family Suite': ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500&auto=format&fit=crop&q=60'],
    'Presidential Suite': ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60']
  };

  // Random cleaning cleaning times
  const cleaningTimes = ['2 hrs ago', 'Yesterday', '3 days ago', '5 hrs ago', '1 hr ago'];
  const lastCleaned = cleaningTimes[Math.floor(Math.random() * cleaningTimes.length)];

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
    description: descriptions[type],
    capacity: capacities[type],
    bedType: bedTypes[type],
    images: images[type],
    lastCleaned,
    guestName: status === ROOM_STATUS.OCCUPIED ? 'John Doe' : null,
    cleaningStaff: status === ROOM_STATUS.CLEANING ? 'Maria S.' : null,
    amenities: ['WiFi', 'AC', 'TV', type.includes('Suite') ? 'Mini Bar' : null, type.includes('Presidential') ? 'Jacuzzi' : null].filter(Boolean)
  };
});
