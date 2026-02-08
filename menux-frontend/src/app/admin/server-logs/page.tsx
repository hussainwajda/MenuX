// src/app/admin/server_logs/page.tsx
'use client';

import { useState, useEffect } from "react";
import { 
  Server, Search, RefreshCw, CheckCircle, AlertTriangle, Wifi, Database, ShieldCheck 
} from "lucide-react";

// Mock log data
const MOCK_LOGS = [
  { id: 1, timestamp: "2024-01-15 14:30:25", level: "INFO", service: "API Gateway", message: "User authentication successful for admin@menux.com", details: "IP: 192.168.1.100" },
  { id: 2, timestamp: "2024-01-15 14:29:45", level: "WARN", service: "Database", message: "Connection pool reaching capacity", details: "Pool usage: 85%" },
  { id: 3, timestamp: "2024-01-15 14:28:12", level: "ERROR", service: "Payment Service", message: "Stripe API timeout", details: "Retry attempt 3/3" },
  { id: 4, timestamp: "2024-01-15 14:27:33", level: "INFO", service: "Order Service", message: "New order created", details: "Order ID: ORD-20240115-001" },
  { id: 5, timestamp: "2024-01-15 14:26:58", level: "INFO", service: "Cache", message: "Redis cache cleared", details: "Memory freed: 2.3MB" },
  { id: 6, timestamp: "2024-01-15 14:25:44", level: "DEBUG", service: "Auth", message: "JWT token refreshed", details: "Token expires in 3600s" },
  { id: 7, timestamp: "2024-01-15 14:24:22", level: "INFO", service: "Storage", message: "Image upload completed", details: "File: menu_item_123.jpg" },
  { id: 8, timestamp: "2024-01-15 14:23:15", level: "WARN", service: "Email Service", message: "Email delivery delayed", details: "Queue length: 15" },
  { id: 9, timestamp: "2024-01-15 14:22:08", level: "INFO", service: "Monitoring", message: "Health check passed", details: "All services operational" },
  { id: 10, timestamp: "2024-01-15 14:21:33", level: "ERROR", service: "API Gateway", message: "Rate limit exceeded", details: "Client: 10.0.0.50" },
];

export default function ServerLogsPage() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedService, setSelectedService] = useState('ALL');

  const logLevels = ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
  const services = ['ALL', 'API Gateway', 'Database', 'Payment Service', 'Order Service', 'Cache', 'Auth', 'Storage', 'Email Service', 'Monitoring'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesService = selectedService === 'ALL' || log.service === selectedService;

    return matchesSearch && matchesLevel && matchesService;
  });

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Add a new log entry to simulate real-time updates
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        level: "INFO",
        service: "Monitoring",
        message: "Log refresh completed",
        details: "Fetched latest entries"
      };
      setLogs([newLog, ...logs]);
    }, 1000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARN': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DEBUG': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'API Gateway': return <Wifi className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Payment Service': return <ShieldCheck className="w-4 h-4" />;
      case 'Order Service': return <CheckCircle className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Server Logs</h1>
          <p className="text-slate-600 mt-1">Real-time system monitoring and log analysis</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs, services, or messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Log Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {logLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(log.service)}
                      <span className="text-sm font-medium text-slate-900">{log.service}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No logs found</h3>
          <p className="text-slate-600">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
}