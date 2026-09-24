import React from 'react';
import { Shield, UserPlus, Users, Mail, Calendar, CheckCircle } from 'lucide-react';
import { WorkspaceMember } from '../types/database';
import { formatDate, getInitials } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface TeamPageProps {
  members: WorkspaceMember[];
  onOpenInviteModal: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  members,
  onOpenInviteModal,
}) => {
  const { activeWorkspace, user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0B5D3B]" />
            <span>Partners &amp; Team Management</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Collaborate with your partner across projects, Kanban boards, and finances
          </p>
        </div>

        <button
          onClick={onOpenInviteModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Partner / Member</span>
        </button>
      </div>

      {/* Partnership Highlight Banner */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#EBF7F0]/40 dark:bg-[#0B5D3B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#0B5D3B]" />
            <span>Dual-Partner Real-Time Collaboration</span>
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Invite your business partner (wife) so both of you can create tasks, update Kanban status, leave comments, log revenue payments, and track deadlines simultaneously.
          </p>
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs text-xs">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Active Members ({members.length})
          </h3>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {members.map((member) => {
            const isCurrentUser = member.user_id === user?.id;
            return (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0B5D3B]/20 text-[#0B5D3B] dark:text-[#28A76B] flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(member.profile?.full_name || member.profile?.email)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {member.profile?.full_name || member.profile?.email?.split('@')[0] || 'Member'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded-xs font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-400 text-[11px] block mt-0.5">
                      {member.profile?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                      member.role === 'owner'
                        ? 'bg-[#0B5D3B] text-white'
                        : member.role === 'admin'
                        ? 'bg-[#D9A400]/20 text-[#9A7400] dark:text-[#E6B41D]'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {member.role}
                  </span>

                  <span className="text-[11px] text-neutral-400 tabular-nums hidden sm:inline">
                    Joined {formatDate(member.joined_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
