// src/app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useState } from "react";
import { 
  Bell, Lock, Monitor, Globe, ChevronRight, Moon, Sun, 
  Smartphone, CreditCard, Shield, Mail 
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences and application configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Navigation Panel */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
           {[
             { id: "general", label: "General", icon: <Globe size={18} /> },
             { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
             { id: "security", label: "Security", icon: <Shield size={18} /> },
             { id: "billing", label: "Billing", icon: <CreditCard size={18} /> },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                 activeTab === tab.id 
                   ? "bg-white text-orange-600 shadow-sm border border-gray-100 font-bold" 
                   : "text-gray-500 hover:bg-white hover:text-gray-700"
               }`}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>

        {/* Right: Content Area */}
        <div className="flex-1 space-y-6 max-w-3xl">
          
          {/* --- TAB: GENERAL --- */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Appearance</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600">
                        <Moon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-sm">Theme Preference</p>
                        <p className="text-xs text-gray-400">Customize how the dashboard looks</p>
                      </div>
                   </div>
                   <div className="flex bg-gray-200 p-1 rounded-lg">
                      <button className="p-2 rounded-md text-xs font-bold bg-white shadow-sm flex items-center gap-1">
                        <Sun size={14} /> Light
                      </button>
                      <button className="p-2 rounded-md text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <Moon size={14} /> Dark
                      </button>
                   </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Regional Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Language</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-sm font-medium">
                      <option>English (US)</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Timezone</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-sm font-medium">
                      <option>(GMT +05:30) India Standard Time</option>
                      <option>(GMT +00:00) UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: NOTIFICATIONS --- */}
          {activeTab === "notifications" && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
               <h2 className="text-lg font-bold text-gray-800 mb-6">Alert Preferences</h2>
               <div className="space-y-4">
                 {[
                   { id: "email", title: "Email Notifications", desc: "Receive daily summaries and critical alerts via email.", icon: <Mail size={18}/> },
                   { id: "push", title: "Push Notifications", desc: "Get real-time updates for new orders on your desktop.", icon: <Monitor size={18}/> },
                   { id: "sms", title: "SMS Alerts", desc: "Receive text messages for urgent issues.", icon: <Smartphone size={18}/> },
                 ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="mt-1 text-gray-400">{item.icon}</div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">{item.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.id as keyof typeof notifications] ? 'bg-orange-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* --- TAB: SECURITY --- */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 mb-6">Password & Auth</h2>
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors text-left group">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Change Password</p>
                      <p className="text-xs text-gray-500 mt-1">Last changed 3 months ago</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-orange-500" size={20} />
                  </button>
                  
                  <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500 mt-1">Secure your account with 2FA</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Enabled</span>
                  </div>
               </div>
            </div>
          )}

          {/* --- TAB: BILLING --- */}
          {activeTab === "billing" && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center py-20 animate-in fade-in slide-in-from-bottom-2">
               <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CreditCard size={32} />
               </div>
               <h3 className="text-lg font-bold text-gray-800">Billing Management</h3>
               <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                 Your billing details and invoice history will appear here once your payment gateway is connected.
               </p>
               <button className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold">
                 Contact Support
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}