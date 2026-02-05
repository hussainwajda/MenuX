// src/app/(dashboard)/dashboard/notifications/page.tsx
'use client';

import { useState } from "react";
import { 
  Bell, Check, CheckCheck, Clock, ShoppingBag, 
  AlertTriangle, Info, Trash2, X 
} from "lucide-react";

// --- MOCK NOTIFICATION DATA ---
const INITIAL_NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "ORDER",
    title: "New Order Received",
    message: "Table 5 placed an order for 3 items worth ₹850.",
    time: "2 mins ago",
    isRead: false,
  },
  {
    id: "notif_2",
    type: "ALERT",
    title: "Low Inventory Warning",
    message: "Cheese Slices stock is below 10 units. Restock soon.",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: "notif_3",
    type: "SYSTEM",
    title: "System Update Scheduled",
    message: "Maintenance scheduled for 3 AM tonight. Downtime: 15 mins.",
    time: "4 hours ago",
    isRead: true,
  },
  {
    id: "notif_4",
    type: "ORDER",
    title: "Order Cancelled",
    message: "Order #ORD-9980 was cancelled by the manager.",
    time: "Yesterday",
    isRead: true,
  },
  {
    id: "notif_5",
    type: "PAYMENT",
    title: "Payment Received",
    message: "₹2,450 received via UPI for Order #ORD-9981.",
    time: "Yesterday",
    isRead: true,
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("ALL"); // ALL, UNREAD, ORDER, ALERT

  // --- ACTIONS ---
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- FILTERING LOGIC ---
  const filteredNotifications = notifications.filter(n => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- HELPER: GET ICON STYLE ---
  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <ShoppingBag className="text-orange-600" size={20} />;
      case 'ALERT': return <AlertTriangle className="text-red-600" size={20} />;
      case 'SYSTEM': return <Info className="text-blue-600" size={20} />;
      case 'PAYMENT': return <Check className="text-green-600" size={20} />;
      default: return <Bell className="text-gray-600" size={20} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'ORDER': return "bg-orange-100";
      case 'ALERT': return "bg-red-100";
      case 'SYSTEM': return "bg-blue-100";
      case 'PAYMENT': return "bg-green-100";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with alerts and activities</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <CheckCheck size={16} /> Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {["ALL", "UNREAD", "ORDER", "ALERT", "SYSTEM"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filter === tab 
                ? "bg-gray-800 text-white shadow-lg shadow-gray-200" 
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab === "UNREAD" && unreadCount > 0 ? `Unread (${unreadCount})` : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4 max-w-3xl">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`relative group p-5 rounded-2xl border transition-all hover:shadow-md ${
                notif.isRead 
                  ? "bg-white border-gray-100" 
                  : "bg-orange-50/40 border-orange-100 shadow-sm"
              }`}
            >
              <div className="flex gap-4 items-start">
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <h3 className={`font-bold text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                       {notif.title}
                       {!notif.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-orange-500"></span>}
                     </h3>
                     <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                       <Clock size={10} /> {notif.time}
                     </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                 {!notif.isRead && (
                   <button 
                     onClick={() => markAsRead(notif.id)}
                     title="Mark as Read"
                     className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                   >
                     <Check size={16} />
                   </button>
                 )}
                 <button 
                   onClick={() => deleteNotification(notif.id)}
                   title="Delete"
                   className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Bell className="text-gray-300" size={32} />
             </div>
             <h3 className="text-gray-900 font-bold">No notifications found</h3>
             <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>

    </div>
  );
}