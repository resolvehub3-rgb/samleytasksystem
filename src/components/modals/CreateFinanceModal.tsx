import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Project, ExpenseCategory } from '../../types/database';
import { revenueSchema, expenseSchema } from '../../lib/validation';

interface CreateFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultType?: 'revenue' | 'expense';
  initialProjectId?: string;
  currency: string;
  onAddRevenue: (revenueData: any) => Promise<any>;
  onAddExpense: (expenseData: any) => Promise<any>;
}

export const CreateFinanceModal: React.FC<CreateFinanceModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultType = 'revenue',
  initialProjectId,
  currency,
  onAddRevenue,
  onAddExpense,
}) => {
  const [type, setType] = useState<'revenue' | 'expense'>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId || (projects[0]?.id || ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Software');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);

      if (type === 'revenue') {
        const payload = {
          title: title.trim(),
          amount: numericAmount,
          payment_date: date,
          project_id: projectId,
          currency,
          payment_method: paymentMethod || null,
          reference: reference.trim() || null,
          notes: notes.trim() || null,
        };

        const val = revenueSchema.safeParse(payload);
        if (!val.success) {
          setError(val.error.issues[0].message);
          setLoading(false);
          return;
        }

        await onAddRevenue(payload);
      } else {
        const payload = {
          title: title.trim(),
          category,
          amount: numericAmount,
          expense_date: date,
          project_id: projectId,
          currency,
          payment_method: paymentMethod || null,
          notes: notes.trim() || null,
        };

        const val = expenseSchema.safeParse(payload);
        if (!val.success) {
          setError(val.error.issues[0].message);
          setLoading(false);
          return;
        }

        await onAddExpense(payload);
      }

      onClose();
      setTitle('');
      setAmount('');
      setReference('');
      setNotes('');
    } catch (err: any) {
      setError(err?.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === 'revenue'
                  ? 'bg-[#0B5D3B]/10 text-[#0B5D3B] dark:text-[#28A76B]'
                  : 'bg-amber-100 dark:bg-amber-950/40 text-[#D9A400]'
              }`}
            >
              {type === 'revenue' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Record {type === 'revenue' ? 'Payment Revenue' : 'Project Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 p-2 gap-2 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={() => setType('revenue')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              type === 'revenue'
                ? 'bg-white dark:bg-neutral-800 text-[#0B5D3B] dark:text-[#28A76B] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            + Client Payment (Revenue)
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-neutral-800 text-[#D9A400] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            - Business Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Title *
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'revenue'
                  ? 'e.g. Milestone 1: Design & Backend Setup'
                  : 'e.g. AWS & Supabase Server Infrastructure'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B] font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Project *
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money (MTN/Telecel)">Mobile Money (MTN/Telecel)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {type === 'expense' && (
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              >
                <option value="Domain">Domain</option>
                <option value="Hosting">Hosting / Cloud</option>
                <option value="Software">Software & SaaS Licenses</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Transportation">Transportation & Logistics</option>
                <option value="Equipment">Hardware & Equipment</option>
                <option value="Contractor">Sub-Contractor / Freelancer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {type === 'revenue' && (
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Transaction Reference / Invoice #
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-001 or MOMO Ref 987654"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Any additional context or bank memo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
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
              disabled={loading || projects.length === 0}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
                type === 'revenue'
                  ? 'bg-[#0B5D3B] hover:bg-[#08492E]'
                  : 'bg-[#D9A400] hover:bg-[#B88B00]'
              }`}
            >
              {loading ? 'Recording...' : `Record ${type === 'revenue' ? 'Revenue' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
