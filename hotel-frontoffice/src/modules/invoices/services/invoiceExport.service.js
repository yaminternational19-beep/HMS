import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToastStore } from '../../../store/useToastStore';

export const exportToExcel = (data = []) => {
  const addToast = useToastStore.getState().addToast;

  if (!data || data.length === 0) {
    addToast('No data available to export.', 'error');
    return;
  }

  const headers = [
    'Invoice ID',
    'Booking ID',
    'Guest Name',
    'Phone',
    'Room Number',
    'Room Type',
    'Check In',
    'Check Out',
    'Nights',
    'Total Amount',
    'Balance Due',
    'Status'
  ];

  const rows = data.map(inv => [
    inv.id || '',
    inv.bookingId || '',
    inv.guestName || '',
    inv.phone || '',
    inv.roomNumber || '',
    inv.roomType || '',
    inv.checkIn || '',
    inv.checkOut || '',
    inv.nights || 0,
    inv.totalAmount || 0,
    inv.balanceDue || 0,
    inv.status || ''
  ]);

  const csvString = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `hms_invoices_${new Date().toLocaleDateString('en-CA')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  addToast('Excel spreadsheet downloaded successfully!', 'success');
};

export const exportToPDF = (data = []) => {
  const addToast = useToastStore.getState().addToast;

  if (!data || data.length === 0) {
    addToast('No data available to export.', 'error');
    return;
  }

  try {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BlackCube FrontOffice', 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Enterprise SNOWLINE BLOOM Management System Dashboard', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Invoices Directory Report', 140, 22, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 28, { align: 'right' });
    
    const headers = [['Invoice ID', 'Guest Name', 'Room', 'Stay', 'Total', 'Balance', 'Status']];
    
    const rows = data.map(inv => [
      inv.id || '',
      inv.guestName || '',
      `Room ${inv.roomNumber}`,
      `${inv.nights} Nights`,
      `₹${inv.totalAmount || 0}`,
      `₹${inv.balanceDue || 0}`,
      inv.status || ''
    ]);

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      margin: { top: 40 }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `BlackCube Solutions - Corporate Hospitality Management Suite \u00A9 ${new Date().getFullYear()}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`hms_invoices_${new Date().toLocaleDateString('en-CA')}.pdf`);
    addToast('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    addToast('Failed to generate PDF.', 'error');
  }
};
