import React, { useState } from 'react';
import { History, Activity as ActivityIcon, Filter, Search } from 'lucide-react';
import { Activity } from '../types/database';
import { formatTimeAgo, formatDate, getInitials } from '../utils/formatters';
import { EmptyState } from '../components/common/EmptyState';

interface ActivityPageProps {
  activities: Activity[];
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ activities }) => {
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = activities.filter((a) => {
    const matchType = filterType === 'all' || a.entity_type === filterType;
    const matchSearch =
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.actor?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#0B5D3B]" />
            <span>Workspace Activity Log</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full audit trail of all project, task, financial, and client mutations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
        >
          <option value="all">All Events</option>
          <option value="project">Project Updates</option>
          <option value="task">Task Updates</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expenses</option>
          <option value="client">Clients</option>
          <option value="comment">Comments</option>
          <option value="file">Files</option>
        </select>
      </div>

      {/* Activity Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity records found"
          description="Activity logs are recorded automatically as you and your partner work in the workspace."
        />
      ) : (
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-start justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0B5D3B]/20 text-[#0B5D3B] dark:text-[#28A76B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {getInitials(item.actor?.full_name || 'Partner')}
                </div>
                <div>
                  <p className="text-neutral-900 dark:text-white leading-relaxed">
                    <span className="font-bold text-[#0B5D3B] dark:text-[#28A76B]">
                      {item.actor?.full_name || 'Team Partner'}
                    </span>{' '}
                    <span>{item.description}</span>
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    {formatDate(item.created_at)} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-sm shrink-0">
                {item.entity_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
