import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Check,
  CheckCheck,
  FolderPlus,
  CheckSquare,
  CircleDollarSign,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { Notification } from '../../types/database';
import { formatTimeAgo } from '../../utils/formatters';

interface TopBarProps {
  pageTitle: string;
  notifications: Notification[];
  onOpenSearch: () => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
  onOpenCreateFinance: () => void;
  onOpenCreateClient: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  notifications,
  onOpenSearch,
  onOpenCreateProject,
  onOpenCreateTask,
  onOpenCreateFinance,
  onOpenCreateClient,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-16 px-6 bg-white dark:bg-[#121A15] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 z-20">
      {/* Zone 1: Page Title / Breadcrumb */}
      <div className="flex items-center gap-2">
        <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100 capitalize tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Zone 2: Global Search Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search workspace, projects, tasks...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions (Quick Create + Notifications) */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9A400] ring-2 ring-white dark:ring-[#121A15]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#141E18] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold text-[#0B5D3B] dark:text-[#28A76B] bg-[#EBF7F0] dark:bg-[#0B5D3B]/20 px-1.5 py-0.2 rounded-sm tabular-nums">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] text-[#0B5D3B] dark:text-[#28A76B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-neutral-400">
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                        !n.is_read ? 'bg-[#EBF7F0]/20 dark:bg-[#0B5D3B]/5' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A400]" />
                          )}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-neutral-400 mt-1 block">
                          {formatTimeAgo(n.created_at)}
                        </span>
                      </div>

                      {!n.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkNotificationRead(n.id);
                          }}
                          className="text-neutral-400 hover:text-[#0B5D3B] p-1"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141E18] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  onOpenCreateProject();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-[#0B5D3B]" />
                <span>New Project</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  onOpenCreateTask();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-[#D9A400]" />
                <span>New Task</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  onOpenCreateFinance();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <CircleDollarSign className="w-4 h-4 text-[#0B5D3B]" />
                <span>Record Finance</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  onOpenCreateClient();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span>Add Client</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
