// src/app/(dashboard)/dashboard/profile/page.tsx
'use client';

import { useState } from "react";
import { User, Mail, Phone, MapPin, Store, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock User Data
  const [formData, setFormData] = useState({
    fullName: "Rohan Sharma",
    email: "rohan@webblers.com",
    phone: "+91 98765 43210",
    role: "Manager",
    restaurantName: "Webblers Bistro",
    address: "123, MG Road, Indore, MP",
    gstin: "23AAAAA0000A1Z5"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
        <p className="text-gray-500 mb-8">Manage your profile and restaurant details</p>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Personal Information */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="text-orange-500" size={20} /> Personal Information
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-lg relative overflow-hidden group cursor-pointer">
                  <span className="text-2xl font-bold text-orange-600">RS</span>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={20} />
                  </div>
                </div>
                <button type="button" className="text-xs text-orange-600 font-bold hover:underline">Change Photo</button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                  <input 
                    value={formData.role}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Restaurant Details */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Store className="text-orange-500" size={20} /> Restaurant Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Restaurant Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <input 
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">GSTIN / Tax ID</label>
                <input 
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <input 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
             <button type="button" className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
               Cancel
             </button>
             <button 
               type="submit" 
               disabled={isLoading}
               className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-2"
             >
               {isLoading ? "Saving..." : <><Save size={18} /> Save Changes</>}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}