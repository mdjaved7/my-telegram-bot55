import React, { useState, useEffect } from 'react';
import { Ticket, TicketPriority } from '../types';
import { StorageService } from '../services/storage';
import { MessageSquare, Send, CheckCircle2, Clock, Search, ShieldCheck } from 'lucide-react';

export const SupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'lookup'>('create');
  const [searchTicketId, setSearchTicketId] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<Ticket | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Technical Integration',
    priority: 'Medium' as TicketPriority,
    subject: '',
    message: '',
  });
  const [submittedTicket, setSubmittedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    setTickets(StorageService.getTickets());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;

    const newTicket = StorageService.createTicket({
      customerName: formData.name,
      email: formData.email,
      category: formData.category,
      priority: formData.priority,
      subject: formData.subject,
      message: formData.message,
    });

    setSubmittedTicket(newTicket);
    setTickets(StorageService.getTickets());
    setFormData({
      name: '',
      email: '',
      category: 'Technical Integration',
      priority: 'Medium',
      subject: '',
      message: '',
    });
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketId.trim()) return;

    const all = StorageService.getTickets();
    const found = all.find(
      (t) => t.id.toLowerCase() === searchTicketId.trim().toLowerCase()
    );

    if (found) {
      setSearchedTicket(found);
      setLookupError(null);
    } else {
      setSearchedTicket(null);
      setLookupError(`No support ticket found with ID "${searchTicketId}".`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900">
          Executive Support & Engineering Dispatch
        </h2>
        <p className="text-xs text-slate-600">
          Direct escalation channel to principal system architects and implementation leads.
        </p>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg mt-4">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submit New Ticket
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lookup Existing Ticket
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          {submittedTicket ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your ticket has been logged with ID{' '}
                <strong className="font-mono text-slate-900">{submittedTicket.id}</strong>. A response will be dispatched to <strong>{submittedTicket.email}</strong>.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchTicketId(submittedTicket.id);
                    setSearchedTicket(submittedTicket);
                    setActiveTab('lookup');
                    setSubmittedTicket(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  View Ticket Thread
                </button>
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.hayes@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Department / Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Technical Integration">Technical Integration</option>
                    <option value="License Activation">License & Token Activation</option>
                    <option value="Executive Advisory">Executive Advisory Booking</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Low">Low (General Inquiry)</option>
                    <option value="Medium">Medium (Implementation Assistance)</option>
                    <option value="High">High (Production Blocker)</option>
                    <option value="Urgent">Urgent (SLA Priority)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of the request or inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Include reproduction details, environment specifications, or specific deliverables required..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Encrypted end-to-end communication</span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lookup search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <form onSubmit={handleLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Enter Ticket ID (e.g. TKT-1048)"
                  value={searchTicketId}
                  onChange={(e) => setSearchTicketId(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Find Ticket
              </button>
            </form>

            <div className="flex items-center gap-2 pt-3 text-xs text-slate-500">
              <span>Recent tickets:</span>
              {tickets.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSearchTicketId(t.id);
                    setSearchedTicket(t);
                    setLookupError(null);
                  }}
                  className="font-mono text-[11px] underline text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  {t.id}
                </button>
              ))}
            </div>

            {lookupError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {lookupError}
              </div>
            )}
          </div>

          {/* Searched Ticket Thread */}
          {searchedTicket && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-mono text-slate-500">{searchedTicket.id} · {searchedTicket.category}</div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{searchedTicket.subject}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Submitted by {searchedTicket.customerName} on{' '}
                    {new Date(searchedTicket.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${
                      searchedTicket.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : searchedTicket.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {searchedTicket.status}
                  </span>
                </div>
              </div>

              {/* Original Message */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-slate-900">Original Inquiry:</div>
                <p className="leading-relaxed whitespace-pre-wrap">{searchedTicket.message}</p>
              </div>

              {/* Replies Thread */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Engineering Correspondence
                </h4>

                {searchedTicket.replies.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                    No admin response logged yet. Our support architects respond within standard SLA windows.
                  </div>
                ) : (
                  searchedTicket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-4 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex justify-between font-semibold text-blue-950">
                        <span>Staff Architect Response</span>
                        <span className="text-[11px] font-normal text-blue-800">
                          {new Date(reply.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
