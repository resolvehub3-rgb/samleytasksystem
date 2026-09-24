import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  supabaseUrl,
  supabaseAnonKey,
  updateSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
  DATABASE_SCHEMA_SQL,
  getSupabase,
} from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { checkConfiguration } = useAuth();
  const [url, setUrl] = useState(
    supabaseUrl.includes('placeholder') ? '' : supabaseUrl
  );
  const [anonKey, setAnonKey] = useState(
    supabaseAnonKey.includes('placeholder') ? '' : supabaseAnonKey
  );
  const [copiedSql, setCopiedSql] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(DATABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSave = () => {
    if (!url || !anonKey) return;
    updateSupabaseCredentials(url, anonKey);
    checkConfiguration();
    setTestResult({
      success: true,
      message: 'Credentials saved! Reconnecting to your Supabase project...',
    });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const client = getSupabase();
      const { error } = await client.from('workspaces').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // If error is table not found, schema needs to be run
        if (error.message?.includes('relation') || error.code === '42P01') {
          setTestResult({
            success: false,
            message:
              'Connected to Supabase, but tables are missing. Please copy and run the SQL Schema script in your Supabase SQL Editor.',
          });
        } else {
          setTestResult({
            success: false,
            message: `Connection returned: ${error.message}`,
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Success! Connected directly to your Supabase PostgreSQL database.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to connect to Supabase',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    checkConfiguration();
    setTestResult({ success: false, message: 'Credentials cleared' });
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B5D3B]/10 text-[#0B5D3B] dark:text-[#28A76B] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Supabase Database & Realtime Connection
              </h2>
              <p className="text-xs text-neutral-500">
                Live PostgreSQL, Auth, Realtime, and Row Level Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {isConfigured ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-semibold">
                {isConfigured
                  ? 'Active Supabase Connection'
                  : 'Supabase Credentials Needed'}
              </p>
              <p className="mt-0.5 opacity-90">
                {isConfigured
                  ? 'Your application is connected to live Supabase services. All projects, tasks, comments, and finances persist in your real database.'
                  : 'Configure your Supabase Project URL and Anon Public Key below or via .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).'}
              </p>
            </div>
          </div>

          {/* Form Credentials */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Project URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Anon Public Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys (anon public)
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-md text-xs font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Migration SQL Generator */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  PostgreSQL Schema & RLS Migration
                </h4>
                <p className="text-xs text-neutral-500">
                  Includes all tables, RLS multi-tenant policies, triggers, and Realtime publications.
                </p>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 text-xs font-semibold text-[#0B5D3B] dark:text-[#28A76B] bg-[#EBF7F0] dark:bg-[#0B5D3B]/20 hover:bg-[#0B5D3B]/20 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Schema SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-neutral-900 text-neutral-200 p-3 rounded-lg font-mono text-[11px] max-h-36 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{DATABASE_SCHEMA_SQL.slice(0, 500)}... (1,200+ lines of SQL)</pre>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 flex items-center gap-1">
              <span>Run in Supabase &rarr; SQL Editor &rarr; New Query &rarr; Paste &amp; Run.</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[#0B5D3B] dark:text-[#28A76B] hover:underline inline-flex items-center gap-0.5 ml-1"
              >
                Open Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
          >
            Clear Stored Credentials
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !url || !anonKey}
              className="px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!url || !anonKey}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Save &amp; Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
