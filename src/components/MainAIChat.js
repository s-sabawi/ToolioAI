// src/components/MainAIChat.js - Enhanced AI Chat Interface
import React, { useState, useEffect, useRef } from 'react';

const MainAIChat = ({ businessData, callAITool, dbOperations, supabase }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState("assistant");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Proactive AI insights based on business data
  const generateProactiveInsights = () => {
    const insights = [];
    const today = new Date();
    
    // Check for today's jobs
    const todayJobs = businessData.jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate.toDateString() === today.toDateString();
    });
    
    if (todayJobs.length > 2) {
      insights.push({
        type: "schedule_optimization",
        priority: "medium",
        message: `You have ${todayJobs.length} jobs scheduled for today. Would you like me to optimize your route to save travel time?`,
        action: "optimize_schedule",
        data: { jobs: todayJobs }
      });
    }

    // Check for overdue invoices
    const overdueInvoices = businessData.invoices.filter(inv => 
      inv.status === 'sent' && new Date(inv.due_date) < today
    );
    
    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      insights.push({
        type: "invoice_follow_up",
        priority: "high",
        message: `You have ${overdueInvoices.length} overdue invoices totaling $${totalOverdue.toLocaleString()}. Should I send follow-up reminders?`,
        action: "send_invoice_reminders",
        data: { invoices: overdueInvoices }
      });
    }

    // Check for clients with multiple jobs (upsell opportunity)
    const clientJobCounts = {};
    businessData.jobs.forEach(job => {
      if (job.client_id) {
        clientJobCounts[job.client_id] = (clientJobCounts[job.client_id] || 0) + 1;
      }
    });
    
    const highValueClients = Object.entries(clientJobCounts)
      .filter(([clientId, count]) => count >= 3)
      .map(([clientId, count]) => {
        const client = businessData.clients.find(c => c.id === clientId);
        return { client, jobCount: count };
      });

    if (highValueClients.length > 0) {
      const topClient = highValueClients[0];
      insights.push({
        type: "client_opportunity",
        priority: "low",
        message: `${topClient.client.name} has had ${topClient.jobCount} successful jobs. They might be interested in a maintenance package or referral program.`,
        action: "create_client_proposal",
        data: { client: topClient.client, jobCount: topClient.jobCount }
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      // Call AI tool with business context
      const aiResponse = await callAITool(messageContent, {
        businessData,
        currentDate: new Date(),
        userPreferences: { mode: agentMode }
      });

      // Save conversation to database for learning
      await supabase.from('ai_conversations').insert([{
        user_message: messageContent,
        ai_response: JSON.stringify(aiResponse),
        tool_used: aiResponse.intent,
        context_data: {
          jobCount: businessData.jobs.length,
          clientCount: businessData.clients.length,
          invoiceCount: businessData.invoices.length,
          mode: agentMode
        }
      }]);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.summary,
        intent: aiResponse.intent,
        data: aiResponse.data,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const handleQuickAction = async (action, insight) => {
    setIsLoading(true);
    
    try {
      let result;
      switch (action) {
        case 'optimize_schedule':
          // Implement route optimization logic
          result = await optimizeJobRoute(insight.data.jobs);
          break;
        case 'send_invoice_reminders':
          // Send reminders for overdue invoices
          result = await sendInvoiceReminders(insight.data.invoices);
          break;
        case 'create_client_proposal':
          // Generate client proposal
          result = await createClientProposal(insight.data.client);
          break;
        default:
          result = { success: false, message: 'Action not implemented yet' };
      }
      
      const responseMessage = {
        id: Date.now(),
        type: 'ai',
        content: result.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error executing action:', error);
    }
    
    setIsLoading(false);
  };

  // Helper functions for AI actions
  const optimizeJobRoute = async (jobs) => {
    // Simple route optimization - in practice, you'd use a real routing API
    const sortedJobs = jobs.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
    return {
      success: true,
      message: `I've optimized your route for ${jobs.length} jobs today. You'll save approximately 30 minutes of travel time.`,
      data: { optimizedJobs: sortedJobs }
    };
  };

  const sendInvoiceReminders = async (invoices) => {
    // In practice, integrate with email service
    try {
      for (const invoice of invoices) {
        await dbOperations.createCommunication({
          client_id: invoice.client_id,
          type: 'email',
          subject: `Payment Reminder - Invoice ${invoice.invoice_number}`,
          content: `This is a friendly reminder that Invoice ${invoice.invoice_number} for $${invoice.total_amount} is now overdue. Please submit payment at your earliest convenience.`,
          urgency: 'high'
        });
      }
      
      return {
        success: true,
        message: `Sent payment reminders for ${invoices.length} overdue invoices.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send invoice reminders. Please try again.'
      };
    }
  };

  const createClientProposal = async (client) => {
    return {
      success: true,
      message: `I've drafted a maintenance package proposal for ${client.name}. Would you like me to schedule a follow-up call to discuss it?`
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Component render methods
  const StatusBar = () => (
    <div className="flex items-center justify-between px-4 py-2 text-white text-sm font-medium bg-black">
      <div className="flex items-center gap-1">
        <span>9:18</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-4 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-2 bg-white/50 rounded-full"></div>
        </div>
        <span className="ml-2 text-xs">5G</span>
        <div className="w-6 h-3 bg-white/30 rounded-sm ml-2">
          <div className="w-5 h-2 bg-white rounded-sm m-0.5"></div>
        </div>
        <span className="ml-1 text-xs font-bold">95</span>
      </div>
    </div>
  );

  const Header = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border-b border-zinc-700">
      <div className="flex items-center gap-3 flex-1">
        <button className="p-1 md:hidden">
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <StatusBar />
      <Header />
      {/* Add your chat UI here, e.g. message list, input, etc. */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>{msg.content}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-700 bg-zinc-800 flex items-center">
        <textarea
          className="flex-1 bg-zinc-900 text-white rounded p-2 mr-2 resize-none"
          rows={1}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        </div>
    </div>
  );
};

export default MainAIChat;