"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  Map, 
  Sprout, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Scale,
  Sparkles,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { activeTab, setActiveTab, user, logout, notifications } = useApp();
  const router = useRouter();

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'digital-twin', name: 'Digital Twin', icon: <Map className="w-5 h-5" /> },
    { id: 'crop-analysis', name: 'AI Crop Diagnostic & Subdivision Lab', icon: <Sprout className="w-5 h-5" /> },
    { id: 'national-twin', name: 'National Twin', icon: <Globe className="w-5 h-5" /> },
    { id: 'what-if', name: 'What-If Simulator', icon: <Scale className="w-5 h-5" /> },
    { id: 'reports', name: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'ai-assistant', name: 'AI Chat Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-30 flex flex-col pt-6 pb-6 bg-white border-r border-surface-container-highest dark:bg-text-main dark:border-white/10 hidden md:flex">
      {/* Premium Logo (Satellite-Leaf-Grid Earth Fusion) */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <img 
          src="/logo.jpg" 
          alt="TerraTwin Logo" 
          className="w-10 h-10 rounded-xl object-cover shadow-sm border border-surface-container-highest dark:border-white/10" 
        />
        <div>
          <h2 className="font-extrabold text-lg text-primary tracking-tight leading-none">TerraTwin</h2>
          <p className="text-[9px] text-text-secondary uppercase tracking-widest font-extrabold dark:text-surface-container-highest/60 mt-1">Digital Grid Twin</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/10' 
                  : 'text-text-secondary hover:bg-background hover:text-text-main dark:text-surface-container-highest/70 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Actions */}
      <div className="px-4 mt-auto pt-6 border-t border-surface-container-highest dark:border-white/10 space-y-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-primary-light text-primary border border-primary/20 dark:bg-white/5 dark:text-white'
              : 'hover:bg-background text-text-main dark:text-white dark:hover:bg-white/5'
          }`}
        >
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.fullName} 
              className="w-9 h-9 rounded-full object-cover border border-primary/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
              {user?.fullName.charAt(0) || 'U'}
            </div>
          )}
          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold truncate text-text-main dark:text-white">{user?.fullName || 'User Account'}</div>
            <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 truncate">{user?.role || 'Operator'}</div>
          </div>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error-light transition-all dark:hover:bg-error/15"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
