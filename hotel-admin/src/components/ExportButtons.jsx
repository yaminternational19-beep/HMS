import React from 'react';
import { MdOutlinePictureAsPdf, MdOutlineGridOn } from 'react-icons/md';
import ActionButton from './ActionButton';

/**
 * ExportButtons - Reusable presentation component displaying PDF and Excel export actions.
 * Relies entirely on passed-in callbacks for real-time action decoupling.
 */
const ExportButtons = ({ onExportPDF, onExportExcel, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Export PDF Action */}
      <ActionButton
        onClick={onExportPDF}
        variant="pdf"
        icon={MdOutlinePictureAsPdf}
        title="Export listing as PDF Report"
      >
        <span>Export PDF</span>
      </ActionButton>

      {/* Export Excel Action */}
      <ActionButton
        onClick={onExportExcel}
        variant="excel"
        icon={MdOutlineGridOn}
        title="Export listing as Excel Spreadsheet"
      >
        <span>Export Excel</span>
      </ActionButton>
    </div>
  );
};

export default ExportButtons;
