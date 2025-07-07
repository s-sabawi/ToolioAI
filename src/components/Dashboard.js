import React from 'react';

const Dashboard = ({ businessData }) => {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Jobs</h3>
          <p>{businessData.jobs.length}</p>
        </div>
        <div className="stat-card">
          <h3>Clients</h3>
          <p>{businessData.clients.length}</p>
        </div>
        <div className="stat-card">
          <h3>Invoices</h3>
          <p>{businessData.invoices.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
