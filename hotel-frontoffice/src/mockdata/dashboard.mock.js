export const dashboardStats = {
  totalBookings: 156,
  availableRooms: 42,
  occupancyRate: 78,
  revenue: 24500,
  checkInsToday: 18,
  checkOutsToday: 12,
  activeGuests: 214,
  avgRoomRate: 145,
};

export const recentBookings = [
  { id: 'BKG-001', guestName: 'John Doe', roomType: 'Deluxe', checkIn: '2026-05-18', status: 'Checked In' },
  { id: 'BKG-002', guestName: 'Jane Smith', roomType: 'Suite', checkIn: '2026-05-19', status: 'Pending' },
  { id: 'BKG-003', guestName: 'Alice Johnson', roomType: 'Standard', checkIn: '2026-05-18', status: 'Checked In' },
  { id: 'BKG-004', guestName: 'Bob Brown', roomType: 'Deluxe', checkIn: '2026-05-20', status: 'Confirmed' },
];

export const roomStatusOverview = {
  occupied: 108,
  available: 42,
  maintenance: 5,
  cleaning: 15,
};

export const liveAlerts = [
  { id: 1, type: 'warning', message: 'Room 204 requested late checkout (02:00 PM)', time: '10 mins ago' },
  { id: 2, type: 'info', message: 'Housekeeping completed cleaning Room 105', time: '25 mins ago' },
  { id: 3, type: 'danger', message: 'Room 302 reported HVAC issues - Maintenance needed', time: '1 hour ago' },
];

export const weeklyOccupancy = [
  { day: 'Mon', rate: 70 },
  { day: 'Tue', rate: 75 },
  { day: 'Wed', rate: 82 },
  { day: 'Thu', rate: 78 },
  { day: 'Fri', rate: 88 },
  { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 85 },
];
