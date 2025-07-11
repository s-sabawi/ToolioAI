import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = ({ currentView, setCurrentView, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'chat', label: 'AI Chat' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'clients', label: 'Clients' },
    { key: 'invoices', label: 'Invoices' }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-zinc-800 border-b border-zinc-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Toolio AI</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-zinc-900 bg-opacity-50">
          <div className="bg-zinc-800 w-64 h-full">
            <div className="p-4 border-b border-zinc-700">
              <h1 className="text-xl font-bold text-white">Toolio AI</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-white"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="p-4">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                    currentView === item.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                  onClick={() => {
                    setCurrentView(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4 p-4 border-t border-zinc-700">
              <div className="text-gray-400 text-sm">
                {user ? (
                  <span>Welcome, {user.email}</span>
                ) : (
                  <span>Not logged in</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-zinc-800 border-r border-zinc-700">
        <div className="flex flex-col flex-1">
          <div className="p-6 border-b border-zinc-700">
            <h1 className="text-2xl font-bold text-white">Toolio AI</h1>
          </div>
          
          <nav className="flex-1 p-4">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                  currentView === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                }`}
                onClick={() => setCurrentView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-zinc-700">
            <div className="text-gray-400 text-sm">
              {user ? (
                <span>Welcome, {user.email}</span>
              ) : (
                <span>Not logged in</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
