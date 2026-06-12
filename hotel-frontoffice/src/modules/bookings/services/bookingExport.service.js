/**
 * bookingExport.service.js - Core domain service for exporting booking records
 * to PDF reports and Excel-compatible CSV spreadsheets, coupled with the Toast notify system.
 */

import { useToastStore } from '../../../store/useToastStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


/**
 * Generates and downloads an Excel-compatible CSV spreadsheet of booking records.
 * @param {Array} data - Array of booking records to export.
 */
export const exportToExcel = (data = []) => {
  const addToast = useToastStore.getState().addToast;

  if (!data || data.length === 0) {
    addToast('No data available to export.', 'error');
    return;
  }

  const headers = [
    'Booking ID',
    'Guest Name',
    'Phone Number',
    'Room Number',
    'Room Type',
    'Check-In Date',
    'Check-Out Date',
    'Total Guests',
    'Booking Status',
    'Payment Status',
    'Amount'
  ];

  const rows = data.map((b) => [
    b.id || '',
    b.guestName || '',
    b.phone || '',
    b.room || '',
    b.roomType || '',
    b.checkIn || '',
    b.checkOut || '',
    b.totalGuests || 0,
    b.status || '',
    b.paymentStatus || '',
    b.amount || 0
  ]);

  const csvString = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  // Create safe download blob
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `hms_bookings_${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}.csv`);
  
  // Append to document and trigger click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  addToast('Excel spreadsheet downloaded successfully!', 'success');
};

/**
 * Generates and formats a high-fidelity PDF print layout for booking records.
 * @param {Array} data - Array of booking records to export.
 */
export const exportToPDF = (data = []) => {
  const addToast = useToastStore.getState().addToast;

  if (!data || data.length === 0) {
    addToast('No data available to export.', 'error');
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BlackCube FrontOffice', 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Enterprise SNOWLINE BLOOM Management System Dashboard', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Bookings Directory Report', 140, 22, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 140, 28, { align: 'right' });
    
    // Table Headers
    const headers = [['Booking ID', 'Guest Name', 'Phone', 'Room', 'Room Type', 'Check-In', 'Check-Out', 'Guests', 'Status', 'Amount']];
    
    // Table Rows
    const rows = data.map((b) => [
      b.id || '',
      b.guestName || '',
      b.phone || '',
      b.room || '',
      b.roomType || '',
      b.checkIn || '',
      b.checkOut || '',
      String(b.totalGuests || 0),
      b.status || '',
      `₹${b.amount || 0}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        7: { halign: 'center' },
        9: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { top: 40 }
    });
    
    // Footer
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

    doc.save(`hms_bookings_${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}.pdf`);
    addToast('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    addToast('Failed to generate PDF. Please try again.', 'error');
  }
};

/**
 * Generates and downloads a high-fidelity payslip/receipt PDF for a booking.
 * Filename format: Payslip_Room<roomNumber>_<bookingCode>.pdf
 * 
 * @param {Object} payslipData - Payslip invoice details from the backend.
 */
export const exportPayslipToPDF = (payslipData) => {
  const addToast = useToastStore.getState().addToast;

  if (!payslipData) {
    addToast('No payslip data available to print.', 'error');
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Primary color: Slate 900
    const primaryColor = [15, 23, 42];
    
    // Header banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(payslipData.buildingName || 'SNOWLINE BLOOM', 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(payslipData.serviceName || 'Front Desk Reservation & Lodging Service', 14, 28);

    // Payment Status Badge
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(160, 12, 36, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(payslipData.paymentStatus ? payslipData.paymentStatus.toUpperCase() : 'PAID', 178, 17, { align: 'center' });

    // Reset text properties
    doc.setTextColor(51, 65, 85);

    // Invoice Meta Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${payslipData.invoiceNumber || 'N/A'}`, 14, 50);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 55);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 60, 196, 60);

    // Columns: Guest details and Stay Info
    doc.setFont('helvetica', 'bold');
    doc.text('Guest Details', 14, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${payslipData.guestName}`, 14, 76);
    doc.text(`Phone: ${payslipData.phone}`, 14, 82);

    doc.setFont('helvetica', 'bold');
    doc.text('Booking Statement', 110, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booking ID: ${payslipData.bookingCode}`, 110, 76);
    doc.text(`Room: ${payslipData.roomNumber} (${payslipData.roomType})`, 110, 82);

    // Stay Dates Grey Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 90, 182, 16, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(14, 90, 182, 16, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Check-In', 20, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(payslipData.checkIn, 20, 102);

    doc.setFont('helvetica', 'bold');
    doc.text('Check-Out', 116, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(payslipData.checkOut, 116, 102);

    // Billing Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Lodging Cost Statement', 14, 120);

    const body = [
      [`Room Rent (${payslipData.nights} Nights x ₹${(payslipData.roomRentPerNight || 0).toLocaleString('en-IN')})`, `₹${(payslipData.roomRentSubtotal || 0).toLocaleString('en-IN')}`],
      [`Extra Charges (Amenity/Extra Bed)`, `₹${(payslipData.extraCharges || 0).toLocaleString('en-IN')}`],
      [`GST / Tax`, `₹${(payslipData.gst || 0).toLocaleString('en-IN')}`]
    ];

    if (payslipData.discount > 0) {
      body.push([`Discount Applied`, `-₹${(payslipData.discount || 0).toLocaleString('en-IN')}`]);
    }

    body.push([`Final Charged Amount`, `₹${(payslipData.finalAmount || 0).toLocaleString('en-IN')}`]);
    body.push([`Total Amount Settled`, `₹${(payslipData.amountPaid || 0).toLocaleString('en-IN')}`]);

    autoTable(doc, {
      startY: 125,
      body: body,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function(cellData) {
        if (cellData.row.index >= body.length - 2) {
          cellData.cell.styles.fontStyle = 'bold';
          if (cellData.row.index === body.length - 2) {
            cellData.cell.styles.textColor = [15, 23, 42]; // Slate 900
          } else {
            cellData.cell.styles.textColor = [79, 70, 229]; // Indigo 600
          }
        }
      }
    });

    // Transaction summary box
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY, 182, 12, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${payslipData.paymentMethod}`, 20, finalY + 7);
    if (payslipData.transactionId) {
      doc.text(`Transaction ID: ${payslipData.transactionId}`, 100, finalY + 7);
    }

    // Corporate Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `BlackCube Solutions - Corporate Hospitality Management Suite \u00A9 ${new Date().getFullYear()}`,
      105,
      pageHeight - 10,
      { align: 'center' }
    );

    const filename = `Payslip_Room${payslipData.roomNumber}_${payslipData.bookingCode}.pdf`;
    doc.save(filename);
    addToast(`Payslip ${filename} downloaded successfully!`, 'success');
  } catch (err) {
    console.error('Payslip PDF Generation Error:', err);
    addToast('Failed to generate Payslip PDF.', 'error');
  }
};
