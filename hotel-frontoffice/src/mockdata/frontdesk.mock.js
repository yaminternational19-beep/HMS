export const TODAY_ARRIVALS = [
  {
    id: 'BKG-081',
    guestName: 'Alex Johnson',
    phone: '+1 555-0192',
    roomType: 'Deluxe King',
    assignedRoom: '204',
    eta: '14:00',
    status: 'Pending',
    balance: 0,
    isVIP: false
  },
  {
    id: 'BKG-082',
    guestName: 'Sarah Williams',
    phone: '+1 555-0233',
    roomType: 'Executive Suite',
    assignedRoom: '401',
    eta: '16:30',
    status: 'Pending',
    balance: 5000,
    isVIP: true
  },
  {
    id: 'BKG-083',
    guestName: 'Michael Chen',
    phone: '+1 555-0988',
    roomType: 'Standard Queen',
    assignedRoom: '105',
    eta: '12:00',
    status: 'Checked-In', // Already arrived early
    balance: 0,
    isVIP: false
  }
];

export const TODAY_DEPARTURES = [
  {
    id: 'BKG-065',
    guestName: 'Emma Davis',
    roomNumber: '302',
    roomType: 'Deluxe King',
    checkOutDate: '2026-05-19',
    balance: 1250, // Has pending room service bill
    status: 'Pending'
  },
  {
    id: 'BKG-068',
    guestName: 'Robert Wilson',
    roomNumber: '110',
    roomType: 'Standard Queen',
    checkOutDate: '2026-05-19',
    balance: 0, // Fully paid
    status: 'Pending'
  },
  {
    id: 'BKG-070',
    guestName: 'Linda Taylor',
    roomNumber: '405',
    roomType: 'Executive Suite',
    checkOutDate: '2026-05-19',
    balance: 0,
    status: 'Checked-Out' // Already left
  }
];
