import React from 'react';

const InvoiceManager = ({ businessData, dbOperations }) => {
  return (
    <div className="invoice-manager">
      <h2>Invoice Manager</h2>
      <div className="invoices-list">
        {businessData.invoices.map(invoice => (
          <div key={invoice.id} className="invoice-item">
            <h3>Invoice #{invoice.id}</h3>
            <p>Amount: ${invoice.total_amount}</p>
            <p>Status: {invoice.status}</p>
            <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceManager;
