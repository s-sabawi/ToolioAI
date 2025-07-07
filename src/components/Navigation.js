import React from 'react';

const Navigation = ({ currentView, setCurrentView, user }) => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Toolio AI</h1>
      </div>
      <div className="nav-links">
        <button 
          className={currentView === 'chat' ? 'active' : ''} 
          onClick={() => setCurrentView('chat')}
        >
          AI Chat
        </button>
        <button 
          className={currentView === 'dashboard' ? 'active' : ''} 
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentView === 'jobs' ? 'active' : ''} 
          onClick={() => setCurrentView('jobs')}
        >
          Jobs
        </button>
        <button 
          className={currentView === 'clients' ? 'active' : ''} 
          onClick={() => setCurrentView('clients')}
        >
          Clients
        </button>
        <button 
          className={currentView === 'invoices' ? 'active' : ''} 
          onClick={() => setCurrentView('invoices')}
        >
          Invoices
        </button>
      </div>
      <div className="nav-user">
        {user ? (
          <span>Welcome, {user.email}</span>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
