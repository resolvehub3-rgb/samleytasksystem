import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Folder,
  Trash2,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { ProjectRevenue, ProjectExpense, Project } from '../types/database';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface FinancePageProps {
  revenues: ProjectRevenue[];
  expenses: ProjectExpense[];
  projects: Project[];
  onOpenCreateFinance: (type?: 'revenue' | 'expense') => void;
  onDeleteRevenue: (id: string) => Promise<any>;
  onDeleteExpense: (id: string) => Promise<any>;
}

export const FinancePage: React.FC<FinancePageProps> = ({
  revenues,
  expenses,
  projects,
  onOpenCreateFinance,
  onDeleteRevenue,
  onDeleteExpense,
}) => {
  const { activeWorkspace } = useAuth();
  const currency = activeWorkspace?.currency || 'GHS';

  const [activeTab, setActiveTab] = useState<'all' | 'revenue' | 'expenses'>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Computed metrics
  const totalRevenue = useMemo(() => {
    return revenues.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  }, [revenues]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const netProfit = totalRevenue - totalExpenses;
  const marginPercent =
    totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Combine transactions for chronological ledger
  const allTransactions = useMemo(() => {
    const revList = revenues.map((r) => ({
      id: r.id,
      type: 'revenue' as const,
      title: r.title,
      amount: Number(r.amount),
      date: r.payment_date,
      project_id: r.project_id,
      project_name: r.project?.name,
      currency: r.currency || currency,
      method: r.payment_method,
      reference: r.reference,
      category: 'Client Payment',
    }));

    const expList = expenses.map((e) => ({
      id: e.id,
      type: 'expense' as const,
      title: e.title,
      amount: Number(e.amount),
      date: e.expense_date,
      project_id: e.project_id,
      project_name: e.project?.name,
      currency: e.currency || currency,
      method: e.payment_method,
      reference: null,
      category: e.category,
    }));

    const combined = [...revList, ...expList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return combined.filter((t) => {
      const matchTab =
        activeTab === 'all' ||
        (activeTab === 'revenue' && t.type === 'revenue') ||
        (activeTab === 'expenses' && t.type === 'expense');

      const matchProject =
        selectedProject === 'all' || t.project_id === selectedProject;

      return matchTab && matchProject;
    });
  }, [revenues, expenses, activeTab, selectedProject, currency]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-[#0B5D3B]" />
            <span>Workspace Financial Overview</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real client invoice collections, partner distributions, and operating expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateFinance('expense')}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={() => onOpenCreateFinance('revenue')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Record Revenue</span>
          </button>
        </div>
      </div>

      {/* Financial Statistics Cards (No Hardcoded Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced Revenue"
          value={formatCurrency(totalRevenue, currency)}
          subtitle={`${revenues.length} payments collected`}
          icon={TrendingUp}
          variant="green"
        />

        <StatCard
          title="Total Operating Expenses"
          value={formatCurrency(totalExpenses, currency)}
          subtitle={`${expenses.length} expense entries`}
          icon={TrendingDown}
          variant="red"
        />

        <StatCard
          title="Net Profit Balance"
          value={formatCurrency(netProfit, currency)}
          subtitle={`Current cash liquidity`}
          icon={DollarSign}
          variant={netProfit >= 0 ? 'yellow' : 'red'}
        />

        <StatCard
          title="Profit Margin"
          value={`${marginPercent}%`}
          subtitle="Operating efficiency"
          icon={PieChart}
          variant="default"
        />
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Tab switch */}
        <div className="flex border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 bg-white dark:bg-neutral-800 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            All Transactions ({revenues.length + expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'revenue'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Revenue ({revenues.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Expenses ({expenses.length})
          </button>
        </div>

        {/* Project selector */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ledger Table */}
      {allTransactions.length === 0 ? (
        <EmptyState
          icon={CircleDollarSign}
          title="No financial records found"
          description="Log client project payments and recurring operational expenses to calculate real profit margins."
          actionLabel="Record Revenue"
          onAction={() => onOpenCreateFinance('revenue')}
        />
      ) : (
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Category / Method</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {allTransactions.map((tx) => (
                  <tr
                    key={`${tx.type}-${tx.id}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-neutral-500 tabular-nums">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {tx.title}
                      </div>
                      {tx.reference && (
                        <div className="text-[10px] text-neutral-400">
                          Ref: {tx.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-300">
                      {tx.project_name || 'General Workspace'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                          tx.type === 'revenue'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {tx.category} {tx.method ? `· ${tx.method}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          tx.type === 'revenue'
                            ? 'text-[#0B5D3B] dark:text-[#28A76B]'
                            : 'text-rose-600'
                        }
                      >
                        {tx.type === 'revenue' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${tx.title}?`)) {
                            if (tx.type === 'revenue') onDeleteRevenue(tx.id);
                            else onDeleteExpense(tx.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
