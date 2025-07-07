import React from 'react';

const ClientManager = ({ businessData, dbOperations }) => {
  return (
    <div className="client-manager">
      <h2>Client Manager</h2>
      <div className="clients-list">
        {businessData.clients.map(client => (
          <div key={client.id} className="client-item">
            <h3>{client.name}</h3>
            <p>Email: {client.email}</p>
            <p>Phone: {client.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientManager;
