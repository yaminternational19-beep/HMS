import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Downloads a single invoice as a professional PDF file.
 */
export const downloadInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const primary = [63, 81, 181]; // Indigo

  // ─── HEADER BANNER ────────────────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SNOWLINE BLOOM INVOICE', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FrontOffice HMS — Premium SNOWLINE BLOOM Management', 14, 24);

  // Invoice ID + Status on right
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.id, pageWidth - 14, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${invoice.status}`, pageWidth - 14, 24, { align: 'right' });
  doc.text(`Issued: ${invoice.issuedDate}`, pageWidth - 14, 30, { align: 'right' });

  // ─── GUEST & ROOM INFO SECTION ─────────────────────────────────────
  let y = 50;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO', 14, y);
  doc.text('STAY DETAILS', 110, y);

  y += 5;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.guestName, 14, y);
  doc.text(`Room ${invoice.roomNumber} — ${invoice.roomType}`, 110, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(invoice.phone, 14, y);
  doc.text(`Check-In:   ${invoice.checkIn}`, 110, y);

  y += 5;
  doc.text(`Booking ID: ${invoice.bookingId}`, 14, y);
  doc.text(`Check-Out:  ${invoice.checkOut}`, 110, y);

  y += 5;
  doc.text(``, 14, y);
  doc.text(`Duration:   ${invoice.nights} Day${invoice.nights > 1 ? 's' : ''}`, 110, y);

  // ─── DIVIDER ──────────────────────────────────────────────────────
  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // ─── BILLING BREAKDOWN TABLE ──────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('BILLING BREAKDOWN', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (Rs.)']],
    body: invoice.lineItems.map(item => [item.description, `Rs. ${item.amount.toLocaleString()}`]),
    theme: 'striped',
    headStyles: { fillColor: primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 }
  });

  // ─── TOTALS SUMMARY ───────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6;

  const totals = [
    ['Sub Total', `Rs. ${invoice.subTotal.toLocaleString()}`],
    ...(invoice.discount > 0 ? [['Discount', `- Rs. ${invoice.discount.toLocaleString()}`]] : []),
    ['GST (9%)', `Rs. ${invoice.gst.toLocaleString()}`],
    ['TOTAL AMOUNT', `Rs. ${invoice.totalAmount.toLocaleString()}`],
    ['Amount Paid', `Rs. ${invoice.paidAmount.toLocaleString()}`],
    ['Balance Due', `Rs. ${invoice.balanceDue.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: finalY,
    body: totals,
    theme: 'plain',
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    columnStyles: {
      0: { halign: 'right', fontStyle: 'normal', cellWidth: 150 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 30 }
    },
    didParseCell(data) {
      if (data.row.index === totals.findIndex(r => r[0] === 'TOTAL AMOUNT')) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
        data.cell.styles.textColor = [63, 81, 181];
      }
      if (data.row.index === totals.findIndex(r => r[0] === 'Balance Due')) {
        data.cell.styles.textColor = invoice.balanceDue > 0 ? [220, 38, 38] : [22, 163, 74];
      }
    },
    margin: { left: 14, right: 14 }
  });

  // ─── TRANSACTIONS SUMMARY ─────────────────────────────────────────
  if (invoice.transactions && invoice.transactions.length > 0) {
    let txnY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('PAYMENT TRANSACTIONS', 14, txnY);
    txnY += 4;

    const txnHeaders = [['Date', 'Type', 'Method', 'Transaction ID', 'Amount']];
    const txnRows = invoice.transactions.map(t => [
      t.date || '',
      t.type || '',
      t.method || '',
      t.id || '',
      `Rs. ${(t.amount || 0).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: txnY,
      head: txnHeaders,
      body: txnRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      margin: { left: 14, right: 14 }
    });
  }

  // ─── FOOTER ───────────────────────────────────────────────────────
  const footerY = doc.lastAutoTable.finalY + 14;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for staying with us. We hope to see you again!', pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text('FrontOffice HMS | snowlinebloom@example.com | +91 98765-00000', pageWidth / 2, footerY + 13, { align: 'center' });

  // ─── SAVE ─────────────────────────────────────────────────────────
  doc.save(`${invoice.id}_${invoice.guestName.replace(/\s+/g, '_')}.pdf`);
};
