import React, { useState } from 'react';
import { X, UserPlus, Shield, Users } from 'lucide-react';
import { invitationSchema } from '../../lib/validation';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
  onInvite: (email: string, role: 'admin' | 'member') => Promise<any>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('admin');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const val = invitationSchema.safeParse({ email: email.trim(), role });
    if (!val.success) {
      setError(val.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      const res = await onInvite(email.trim(), role);
      if (res?.status === 'added') {
        setSuccess(`User ${email} was added directly to ${workspaceName || 'workspace'}`);
      } else {
        setSuccess(`Invitation successfully created for ${email}`);
      }
      setTimeout(() => {
        onClose();
        setEmail('');
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B5D3B]/10 text-[#0B5D3B] dark:text-[#28A76B] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Invite Partner / Team Member
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium">
              {success}
            </div>
          )}

          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Invite your business partner (or team member) to collaborate on projects, tasks, Kanban boards, and finances in real time.
          </p>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. wife@company.com or partner@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Role &amp; Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setRole('admin')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex flex-col gap-1 ${
                  role === 'admin'
                    ? 'border-[#0B5D3B] bg-[#EBF7F0]/60 dark:bg-[#0B5D3B]/10'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                  <Shield className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>Admin</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Full control: manage projects, finances, tasks, and clients.
                </p>
              </label>

              <label
                onClick={() => setRole('member')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex flex-col gap-1 ${
                  role === 'member'
                    ? 'border-[#0B5D3B] bg-[#EBF7F0]/60 dark:bg-[#0B5D3B]/10'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                  <Users className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Member</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  View and update assigned tasks, post comments, and upload files.
                </p>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
