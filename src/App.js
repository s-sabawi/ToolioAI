// src/App.js - Main TradeFlowAI Application
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import MainAIChat from './components/MainAIChat';
import Dashboard from './components/Dashboard';
import JobManager from './components/JobManager';
import ClientManager from './components/ClientManager';
import InvoiceManager from './components/InvoiceManager';
import AuthComponent from './components/AuthComponent';
import Navigation from './components/Navigation';
import './App.css';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('chat');
  const [businessData, setBusinessData] = useState({
    jobs: [],
    clients: [],
    invoices: [],
    communications: []
  });
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load business data when user is authenticated
  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      const [jobsRes, clientsRes, invoicesRes, commsRes] = await Promise.all([
        supabase.from('jobs').select(`
          *, 
          clients(name, email, phone)
        `).order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select(`
          *, 
          jobs(title),
          clients(name)
        `).order('created_at', { ascending: false }),
        supabase.from('communications').select(`
          *, 
          clients(name),
          jobs(title)
        `).order('created_at', { ascending: false })
      ]);

      setBusinessData({
        jobs: jobsRes.data || [],
        clients: clientsRes.data || [],
        invoices: invoicesRes.data || [],
        communications: commsRes.data || []
      });
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  // AI Tool calling function for LLM integration
  const callAITool = async (prompt, context = {}) => {
    try {
      // This would integrate with your preferred AI service (OpenAI, Claude, etc.)
      // For now, we'll simulate responses based on the prompt
      
      if (prompt.toLowerCase().includes('schedule') || prompt.toLowerCase().includes('jobs today')) {
        const todayJobs = businessData.jobs.filter(job => {
          const jobDate = new Date(job.scheduled_date);
          const today = new Date();
          return jobDate.toDateString() === today.toDateString();
        });
        
        return {
          intent: 'display_jobs',
          summary: `Found ${todayJobs.length} jobs scheduled for today`,
          data: { jobs: todayJobs, filter: { timeFilter: 'today' } }
        };
      }
      
      if (prompt.toLowerCase().includes('clients')) {
        return {
          intent: 'display_clients',
          summary: `Here are your ${businessData.clients.length} clients`,
          data: { clients: businessData.clients }
        };
      }
      
      if (prompt.toLowerCase().includes('invoice')) {
        const overdueInvoices = businessData.invoices.filter(inv => 
          inv.status === 'overdue' || 
          (inv.status === 'sent' && new Date(inv.due_date) < new Date())
        );
        
        return {
          intent: 'display_invoices',
          summary: overdueInvoices.length > 0 
            ? `Found ${overdueInvoices.length} overdue invoices` 
            : 'All invoices are up to date',
          data: { invoices: overdueInvoices.length > 0 ? overdueInvoices : businessData.invoices }
        };
      }
      
      // Default response
      return {
        intent: 'general',
        summary: "I can help you manage your trade business. Ask me about your schedule, clients, invoices, or any specific tasks you need help with."
      };
      
    } catch (error) {
      console.error('AI Tool Error:', error);
      return {
        intent: 'error',
        summary: 'I encountered an error processing your request. Please try again.'
      };
    }
  };

  // Database operations
  const dbOperations = {
    // Jobs
    createJob: async (jobData) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    },

    updateJob: async (jobId, updates) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    },

    deleteJob: async (jobId) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      if (error) throw error;
      await loadBusinessData();
    },

    // Clients
    createClient: async (clientData) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    },

    updateClient: async (clientId, updates) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    },

    // Invoices
    createInvoice: async (invoiceData) => {
      // Generate invoice number
      const invoiceCount = businessData.invoices.length + 1;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${invoiceCount.toString().padStart(4, '0')}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoiceData, invoice_number: invoiceNumber }])
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    },

    updateInvoice: async (invoiceId, updates) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId)
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    },

    // Communications
    createCommunication: async (commData) => {
      const { data, error } = await supabase
        .from('communications')
        .insert([commData])
        .select();
      if (error) throw error;
      await loadBusinessData();
      return data[0];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-white">Loading TradeFlowAI...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent supabase={supabase} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <MainAIChat 
            businessData={businessData}
            callAITool={callAITool}
            dbOperations={dbOperations}
            supabase={supabase}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            businessData={businessData}
            dbOperations={dbOperations}
          />
        );
      case 'jobs':
        return (
          <JobManager 
            businessData={businessData}
            dbOperations={dbOperations}
          />
        );
      case 'clients':
        return (
          <ClientManager 
            businessData={businessData}
            dbOperations={dbOperations}
          />
        );
      case 'invoices':
        return (
          <InvoiceManager 
            businessData={businessData}
            dbOperations={dbOperations}
          />
        );
      default:
        return (
          <MainAIChat 
            businessData={businessData}
            callAITool={callAITool}
            dbOperations={dbOperations}
            supabase={supabase}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile-first layout */}
      <div className="md:flex">
        {/* Navigation */}
        <Navigation 
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          supabase={supabase}
          businessData={businessData}
        />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;
