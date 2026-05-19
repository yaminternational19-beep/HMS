import React from 'react';
import { MdReceipt, MdPending, MdWarning, MdMonetizationOn } from 'react-icons/md';
import { INVOICE_STATUS } from '../constants/invoiceStatus';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const InvoiceStats = ({ invoices }) => {
  const total = invoices.length;
  const paid = invoices.filter(i => i.status === INVOICE_STATUS.PAID).length;
  const pending = invoices.filter(i => [INVOICE_STATUS.PENDING, INVOICE_STATUS.PARTIAL].includes(i.status)).length;
  const overdue = invoices.filter(i => i.status === INVOICE_STATUS.OVERDUE).length;
  const totalRevenue = invoices
    .filter(i => i.status === INVOICE_STATUS.PAID)
    .reduce((sum, i) => sum + i.paidAmount, 0);
  const pendingRevenue = invoices
    .filter(i => i.status !== INVOICE_STATUS.PAID && i.status !== INVOICE_STATUS.CANCELLED)
    .reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <StatsGrid>
      <StatsCard
        title="Total Invoices"
        value={total}
        icon={<MdReceipt size={20} />}
        theme="indigo"
        subtitle="All time records"
      />
      <StatsCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        icon={<MdMonetizationOn size={20} />}
        theme="emerald"
        subtitle={`${paid} paid invoices`}
      />
      <StatsCard
        title="Pending / Partial"
        value={pending}
        icon={<MdPending size={20} />}
        theme="amber"
        subtitle={`${overdue} overdue`}
      />
      <StatsCard
        title="Amount Due"
        value={`₹${pendingRevenue.toLocaleString()}`}
        icon={<MdWarning size={20} />}
        theme={pendingRevenue > 0 ? 'red' : 'emerald'}
        subtitle="Requires collection"
      />
    </StatsGrid>
  );
};

export default InvoiceStats;
