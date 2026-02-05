'use client';

import { useState } from "react";
import { 
  Mail, Phone, MessageCircle, ChevronDown, ChevronUp, 
  Send, FileText, ExternalLink, HelpCircle 
} from "lucide-react";

// --- MOCK DATA ---
const FAQS = [
  {
    question: "How do I add a new menu item?",
    answer: "Go to the 'Dish Inventory' page from the sidebar. Click the 'Add New Dish' button in the top right corner, fill in the details like name, price, and image, and click Save."
  },
  {
    question: "How do I process a refund?",
    answer: "Navigate to the 'Orders' page. Find the specific order in the history list. Click the eye icon to view details, then select 'Issue Refund'. Note: This is only available for Managers."
  },
  {
    question: "My printer isn't connecting to the KOT system.",
    answer: "Ensure the printer is on the same WiFi network as your dashboard tablet. Go to Settings > Printers to rescan for devices. If the issue persists, restart the printer."
  },
  {
    question: "Can I export my sales report?",
    answer: "Yes! On the 'Orders' page, click the 'Export Report' button at the top right. You can download reports in PDF or CSV formats."
  }
];

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState({ subject: "", message: "" });

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setTicket({ subject: "", message: "" });
      alert("Support ticket sent successfully! We will contact you shortly.");
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
        <p className="text-gray-500 mt-1">We're here to help you run your business smoothly.</p>
      </div>

      {/* Top Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:border-orange-200 transition-colors group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Mail size={24} />
          </div>
          <h3 className="font-bold text-gray-800">Email Support</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Get a response within 24 hours</p>
          <a href="mailto:support@menux.com" className="text-sm font-bold text-blue-600 hover:underline">support@menux.com</a>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:border-orange-200 transition-colors group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Phone size={24} />
          </div>
          <h3 className="font-bold text-gray-800">Phone Support</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Mon-Fri from 9am to 6pm</p>
          <a href="tel:+919876543210" className="text-sm font-bold text-green-600 hover:underline">+91 98765 43210</a>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:border-orange-200 transition-colors group">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-gray-800">Live Chat</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Instant answers via chat</p>
          <button className="text-sm font-bold text-orange-600 hover:underline">Start Chat</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Contact Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Send size={20} className="text-orange-500" /> Send us a Message
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Subject</label>
              <input 
                type="text" 
                required
                placeholder="Brief description of the issue"
                value={ticket.subject}
                onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Message</label>
              <textarea 
                required
                rows={5}
                placeholder="Describe your issue in detail..."
                value={ticket.message}
                onChange={(e) => setTicket({...ticket, message: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending Ticket..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Right: FAQ & Resources */}
        <div className="space-y-8">
          
          {/* FAQ Accordion */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <HelpCircle size={20} className="text-orange-500" /> Frequently Asked Questions
            </h2>

            <div className="space-y-2">
              {FAQS.map((faq, index) => (
                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="font-bold text-gray-700 text-sm">{faq.question}</span>
                    {activeFaq === index ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                  </button>
                  
                  {activeFaq === index && (
                    <div className="p-4 bg-white text-sm text-gray-500 leading-relaxed border-t border-gray-100 animate-in slide-in-from-top-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 flex items-center justify-between">
             <div>
                <h3 className="font-bold text-orange-900 text-lg">Documentation</h3>
                <p className="text-orange-700/80 text-sm mt-1">Read our guides to master the dashboard.</p>
             </div>
             <button className="bg-white text-orange-600 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm">
               <FileText size={16} /> Read Docs <ExternalLink size={14} />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}