import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  Kanban,
  Calendar,
  Users2,
  FolderArchive,
  CircleDollarSign,
  History,
  Shield,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Plus,
  Database,
  Building,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/formatters';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateWorkspace: () => void;
  onOpenSupabaseSetup: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateWorkspace,
  onOpenSupabaseSetup,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { user, profile, workspaces, activeWorkspace, userRole, switchWorkspace, signOut, configured } = useAuth();
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'clients', label: 'Clients', icon: Users2 },
    { id: 'files', label: 'Files', icon: FolderArchive },
    { id: 'finance', label: 'Finance', icon: CircleDollarSign },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'team', label: 'Team & Partner', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#121A15] border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between h-screen shrink-0 sticky top-0 select-none z-30">
      {/* Top Brand & Workspace Switcher */}
      <div>
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <BrandLogo size="md" />

          {/* Workspace Selector Dropdown */}
          <div className="relative mt-4">
            <button
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-800 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-md bg-[#0B5D3B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate leading-none">
                    {activeWorkspace?.name || 'My Workspace'}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-semibold">
                    {activeWorkspace?.currency || 'GHS'} · {userRole || 'Partner'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
            </button>

            {workspaceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#141E18] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 py-1 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer ${
                      ws.id === activeWorkspace?.id
                        ? 'font-bold text-[#0B5D3B] dark:text-[#28A76B] bg-[#EBF7F0]/40 dark:bg-[#0B5D3B]/10'
                        : 'text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspace?.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B5D3B] shrink-0" />
                    )}
                  </button>
                ))}

                <div className="border-t border-neutral-200 dark:border-neutral-800 my-1" />
                <button
                  onClick={() => {
                    setWorkspaceDropdownOpen(false);
                    onOpenCreateWorkspace();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-1.5 text-[#0B5D3B] dark:text-[#28A76B] font-semibold hover:bg-[#EBF7F0]/50 dark:hover:bg-[#0B5D3B]/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-270px)] text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#0B5D3B] text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile, Theme, Supabase Status & Logout */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        {/* Supabase Realtime Status Pill */}
        <button
          onClick={onOpenSupabaseSetup}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              <Database className="w-3 h-3 text-[#0B5D3B]" />
              <span>{configured ? 'Supabase Live' : 'Setup Supabase'}</span>
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">SQL/RLS</span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#0B5D3B]/20 text-[#0B5D3B] dark:text-[#28A76B] flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(profile?.full_name || user?.email)}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Logout */}
            <button
              onClick={signOut}
              className="p-1 rounded-md text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
