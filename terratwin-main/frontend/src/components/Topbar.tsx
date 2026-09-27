"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  MapPin,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import AddFarmModal from './AddFarmModal';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { 
    farms, 
    selectedFarmId, 
    setSelectedFarmId, 
    notifications, 
    markNotificationRead,
    darkMode, 
    setDarkMode,
    user 
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedFarm = farms.find(f => f.id === selectedFarmId);
  const unreadNotifs = notifications.filter(n => !n.read);

  // Filter farms by search query if needed
  const filteredFarms = farms.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.cropType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4 text-error" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white dark:bg-text-main border-b border-surface-container-highest dark:border-white/10 z-20 px-6 flex justify-between items-center transition-all">
        
        {/* Mobile Menu trigger & Farm Selector */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMobileMenuToggle} 
            className="p-1.5 rounded-lg hover:bg-background dark:hover:bg-white/5 text-text-secondary md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Farm Selector */}
          <div className="relative">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="appearance-none pl-10 pr-10 py-1.5 bg-primary-light hover:bg-primary-light/80 dark:bg-white/5 dark:text-white rounded-full text-xs font-bold text-primary focus:outline-none transition-all cursor-pointer border border-primary/10"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id} className="text-text-main">
                  {farm.name} ({farm.cropType})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <ChevronDown className="w-3 h-3 text-primary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-4">
          
          {/* Search bar desktop */}
          <div className="relative hidden lg:block w-64">
            <input
              type="text"
              placeholder="Search crop, fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background dark:bg-white/5 dark:text-white text-xs py-1.5 pl-8 pr-4 rounded-full border border-surface-container-highest dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-background dark:hover:bg-white/5 text-text-secondary dark:text-surface-container-highest/80 transition-all active:scale-95"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications center */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full hover:bg-background dark:hover:bg-white/5 text-text-secondary dark:text-surface-container-highest/80 relative transition-all active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-white dark:border-text-main animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-text-main border border-surface-container-highest dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-container-highest dark:border-white/10 flex justify-between items-center bg-primary-light dark:bg-white/5">
                  <span className="text-xs font-bold text-primary dark:text-white">Active Alerts ({unreadNotifs.length})</span>
                  {unreadNotifs.length > 0 && (
                    <button 
                      onClick={() => unreadNotifs.forEach(n => markNotificationRead(n.id))}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-surface-container-highest dark:divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-secondary font-light">No notifications active.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 text-left hover:bg-background dark:hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-primary-light/30 dark:bg-white/5' : ''}`}
                      >
                        <div className="flex gap-2">
                          <div className="mt-0.5 flex-shrink-0">{getNotifIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-text-main dark:text-white truncate">{notif.title}</h4>
                            <p className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 font-light mt-0.5 leading-normal">{notif.message}</p>
                            <span className="text-[9px] text-text-secondary dark:text-surface-container-highest/40 font-mono block mt-1">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-surface-container-highest dark:bg-white/10"></div>

          {/* Add Farm Button */}
          <button
            onClick={() => setIsAddFarmOpen(true)}
            className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-primary/10 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Farm</span>
          </button>
        </div>
      </header>

      {/* Add Farm Modal Overlay */}
      <AddFarmModal isOpen={isAddFarmOpen} onClose={() => setIsAddFarmOpen(false)} />
    </>
  );
}
