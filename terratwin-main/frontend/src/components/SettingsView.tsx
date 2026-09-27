"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User as UserIcon, BellRing, KeyRound, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SettingsView() {
  const { user, setUser, darkMode, setDarkMode } = useApp();
  const [fullName, setFullName] = useState(user?.fullName || 'Dr. Elena Rodriguez');
  const [role, setRole] = useState(user?.role || 'Senior Agricultural Scientist');
  const [geeKey, setGeeKey] = useState('•••••••••••••••••••••••••••••');
  
  // Notification threshold toggles
  const [stressAlert, setStressAlert] = useState(true);
  const [pestAlert, setPestAlert] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      if (user) {
        setUser({
          ...user,
          fullName,
          role
        });
      }
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Profile Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-text-main dark:text-white">Scientific Profile Management</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="role-input" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Institutional Role
              </label>
              <input
                id="role-input"
                type="text"
                value={role}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Registered Workstation Email
              </label>
              <input
                id="email-input"
                type="email"
                disabled
                value={user?.email || 'dr.elena@terratwin.ai'}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-surface-container text-text-secondary text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-text-secondary mt-1 block">Workstation email must be altered by workspace administrators only.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container-highest dark:border-white/10 flex justify-between items-center">
            {savedSuccess && (
              <div className="text-xs text-success font-semibold flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>Changes saved successfully!</span>
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profiles'}</span>
            </button>
          </div>
        </form>

        {/* Credentials Form */}
        <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-text-main dark:text-white">Earth Engine Service Account Config</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="key-input" className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">
                Google Earth Engine Account Key (JSON)
              </label>
              <input
                id="key-input"
                type="password"
                value={geeKey}
                onChange={(e) => setGeeKey(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-surface-container-highest dark:border-white/10 bg-background dark:bg-white/5 text-text-main dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div className="p-3.5 bg-warning-light dark:bg-white/5 rounded-xl border border-warning/15 flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 font-light leading-relaxed">
                Earth Engine keys are stored locally with AES-256 GCM encryption. If no key is set, the digital twin automatically runs in simulated raster overlay fallback mode.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold and Display configurations */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-text-main dark:text-white">Alert Thresholds</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-1 cursor-pointer">
              <div className="text-xs">
                <div className="font-bold">Water Stress Alerts</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">Trigger when moisture index drops below 25%</div>
              </div>
              <input 
                type="checkbox" 
                checked={stressAlert}
                onChange={(e) => setStressAlert(e.target.checked)}
                className="h-4.5 w-9 appearance-none bg-surface-container rounded-full checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:left-[18px] before:transition-all cursor-pointer border border-surface-container-highest"
              />
            </label>

            <label className="flex items-center justify-between p-1 cursor-pointer">
              <div className="text-xs">
                <div className="font-bold">Pest & Disease Alerts</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">Notify when daily humidity exceeds 80%</div>
              </div>
              <input 
                type="checkbox" 
                checked={pestAlert}
                onChange={(e) => setPestAlert(e.target.checked)}
                className="h-4.5 w-9 appearance-none bg-surface-container rounded-full checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:left-[18px] before:transition-all cursor-pointer border border-surface-container-highest"
              />
            </label>

            <label className="flex items-center justify-between p-1 cursor-pointer">
              <div className="text-xs">
                <div className="font-bold">Weekly PDF Digest</div>
                <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60">Auto-generate and email plot statistics</div>
              </div>
              <input 
                type="checkbox" 
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="h-4.5 w-9 appearance-none bg-surface-container rounded-full checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:left-[18px] before:transition-all cursor-pointer border border-surface-container-highest"
              />
            </label>
          </div>
        </div>

        {/* Global Dark Mode settings card */}
        <div className="bg-white dark:bg-text-main p-6 rounded-2xl border border-surface-container-highest dark:border-white/10 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-surface-container-highest/60">Visual Display</h4>
          <label className="flex items-center justify-between p-1 cursor-pointer">
            <span className="text-xs font-bold text-text-main dark:text-white">Force Dark Theme Mode</span>
            <input 
              type="checkbox" 
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="h-4.5 w-9 appearance-none bg-surface-container rounded-full checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-[2px] before:left-[2px] checked:before:left-[18px] before:transition-all cursor-pointer border border-surface-container-highest"
            />
          </label>
        </div>
      </div>

    </div>
  );
}
