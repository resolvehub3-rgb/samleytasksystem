import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  User,
  Database,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DATABASE_SCHEMA_SQL, isSupabaseConfigured } from '../lib/supabase';

interface SettingsPageProps {
  onOpenSupabaseSetup: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenSupabaseSetup }) => {
  const { profile, activeWorkspace, user, userRole, updateProfile, refreshWorkspaces } = useAuth();

  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [currency, setCurrency] = useState(activeWorkspace?.currency || 'GHS');
  const [timezone, setTimezone] = useState(activeWorkspace?.timezone || 'Africa/Accra');
  const [description, setDescription] = useState(activeWorkspace?.description || '');

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    try {
      setProfileSaving(true);
      const { error } = await updateProfile({ full_name: fullName.trim() });
      if (error) {
        setMessage({ text: error.message || 'Failed to update profile', type: 'error' });
      } else {
        setMessage({ text: 'Profile updated successfully', type: 'success' });
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !workspaceName.trim()) return;
    try {
      setWorkspaceSaving(true);
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: workspaceName.trim(),
          currency,
          timezone,
          description: description.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeWorkspace.id);

      if (error) {
        setMessage({ text: error.message || 'Failed to update workspace', type: 'error' });
      } else {
        await refreshWorkspaces();
        setMessage({ text: 'Workspace settings saved', type: 'success' });
      }
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(DATABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // fallback
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans text-xs">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#0B5D3B]" />
          <span>Workspace &amp; System Settings</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure multi-tenant settings, business currency, and database parameters
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg font-medium text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Workspace Settings Card */}
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
              Workspace Profile
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-sm">
            Role: {userRole}
          </span>
        </div>

        <form onSubmit={handleSaveWorkspace} className="space-y-4">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Default Business Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              >
                <option value="GHS">GHS (Ghanaian Cedi - ₵)</option>
                <option value="USD">USD (US Dollar - $)</option>
                <option value="EUR">EUR (Euro - €)</option>
                <option value="GBP">GBP (British Pound - £)</option>
                <option value="NGN">NGN (Nigerian Naira - ₦)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              >
                <option value="Africa/Accra">Africa/Accra (GMT+0)</option>
                <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Business Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
          </div>

          <button
            type="submit"
            disabled={workspaceSaving || !workspaceName.trim()}
            className="px-4 py-2 font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{workspaceSaving ? 'Saving...' : 'Save Workspace Changes'}</span>
          </button>
        </form>
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <User className="w-4 h-4 text-[#0B5D3B]" />
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
            Personal Account &amp; Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/60 text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSaving || !fullName.trim()}
            className="px-4 py-2 font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{profileSaving ? 'Saving...' : 'Update Profile'}</span>
          </button>
        </form>
      </div>

      {/* Supabase Connection & PostgreSQL Engine */}
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0B5D3B]" />
            <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
              Supabase PostgreSQL Database &amp; RLS
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
              configured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
            }`}
          >
            {configured ? 'Connected & Live' : 'Keys Needed'}
          </span>
        </div>

        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          SyncEdge Pro utilizes live Supabase PostgreSQL tables, Realtime WebSockets, Row Level Security (RLS), and Storage buckets for authentic partner collaboration.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onOpenSupabaseSetup}
            className="px-4 py-2 font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Configure Connection &amp; API Keys</span>
          </button>

          <button
            onClick={handleCopySql}
            className="px-3.5 py-2 font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied SQL to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 1-Click Schema SQL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
