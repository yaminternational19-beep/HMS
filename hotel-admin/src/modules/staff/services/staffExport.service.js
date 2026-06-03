/**
 * staffExport.service.js - Core domain service for exporting staff directory records
 * to PDF reports and Excel-compatible CSV spreadsheets.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads an Excel-compatible CSV spreadsheet of staff records.
 * @param {Array} data - Array of staff records to export.
 * @param {Function} addToast - Callback for notifications.
 */
export const exportToExcel = (data = [], addToast = () => {}) => {
  if (!data || data.length === 0) {
    addToast('No data available to export.', 'error');
    return;
  }

  const headers = [
    'Staff ID',
    'Staff Code',
    'Full Name',
    'Role / Department',
    'Email Address',
    'Contact Phone',
    'Emergency Contact',
    'Shift ID',
    'Active Status',
    'Date Joined',
    'Physical Address',
    'Govt ID Verification Type',
    'Govt ID Verification Number'
  ];

  const rows = data.map((m) => [
    m.id || '',
    m.uniqueCode || '',
    m.name || '',
    m.role || '',
    m.email || '',
    m.phone || '',
    m.emergencyPhone || '',
    m.shiftId || '',
    m.status || '',
    m.joined || '',
    m.address || '',
    m.govtProofType || '',
    m.govtProofId || ''
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
  link.setAttribute('download', `hms_staff_${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}.csv`);
  
  // Append to document and trigger click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  addToast('Excel spreadsheet downloaded successfully!', 'success');
};

/**
 * Generates and formats a high-fidelity PDF print layout for staff records.
 * @param {Array} data - Array of staff records to export.
 * @param {Function} addToast - Callback for notifications.
 */
export const exportToPDF = (data = [], addToast = () => {}) => {
  if (!data || data.length === 0) {
    addToast('No data available to export.', 'error');
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BlackCube AdminPanel', 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Enterprise SNOWLINE BLOOM Management System Admin Dashboard', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Staff Directory Ledger Report', 140, 22, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 140, 28, { align: 'right' });
    
    // Table Headers
    const headers = [['Staff ID', 'Staff Code', 'Full Name', 'Role / Dept', 'Contact Phone', 'Shift ID', 'Status', 'Joined']];
    
    // Table Rows
    const rows = data.map((m) => [
      m.id || '',
      m.uniqueCode || '',
      m.name || '',
      m.role || '',
      m.phone || '',
      m.shiftId || '',
      m.status || '',
      m.joined || ''
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
        0: { halign: 'center' },
        1: { halign: 'center' },
        6: { halign: 'center' }
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

    doc.save(`hms_staff_${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}.pdf`);
    addToast('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    addToast('Failed to generate PDF. Please try again.', 'error');
  }
};
