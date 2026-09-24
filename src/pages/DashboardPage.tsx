import React from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  ArrowRight,
  FolderPlus,
  CheckSquare,
  Activity as ActivityIcon,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaceData } from '../hooks/useWorkspaceData';
import { formatCurrency, formatDate, formatTimeAgo } from '../utils/formatters';
import { Task, Project } from '../types/database';

interface DashboardPageProps {
  workspaceData: ReturnType<typeof useWorkspaceData>;
  onNavigateTab: (tab: string) => void;
  onSelectProject: (projectId: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  workspaceData,
  onNavigateTab,
  onSelectProject,
  onSelectTask,
  onOpenCreateProject,
  onOpenCreateTask,
}) => {
  const { profile, user, activeWorkspace } = useAuth();
  const {
    projects,
    tasks,
    activities,
    stats,
    loading,
    getProjectProgress,
    updateTaskStatus,
  } = workspaceData;

  const currency = activeWorkspace?.currency || 'GHS';
  const firstName =
    profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Partner';

  // Greeting based on current hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
      ? 'Good afternoon'
      : 'Good evening';

  // Priority tasks (not completed, sorted by due date)
  const priorityTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  // Active / Recent Projects
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time project overview for{' '}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {activeWorkspace?.name || 'Workspace'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#D9A400]" />
            <span>Add Task</span>
          </button>

          <button
            onClick={onOpenCreateProject}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Grid (Tabular Numerals, 0 Hardcoded Values) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle={`${stats.completedProjects} completed`}
          icon={FolderGit2}
          variant="green"
          onClick={() => onNavigateTab('projects')}
        />

        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          subtitle={`${stats.completedTasks} completed`}
          icon={Clock}
          variant="default"
          onClick={() => onNavigateTab('tasks')}
        />

        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          subtitle={`${stats.upcomingDeadlines} due this week`}
          icon={AlertTriangle}
          variant={stats.overdueTasks > 0 ? 'red' : 'default'}
          onClick={() => onNavigateTab('tasks')}
        />

        <StatCard
          title="Net Project Value"
          value={formatCurrency(stats.netProjectValue, currency)}
          subtitle={`Rev: ${formatCurrency(stats.totalRevenue, currency)} · Exp: ${formatCurrency(stats.totalExpenses, currency)}`}
          icon={DollarSign}
          variant="yellow"
          onClick={() => onNavigateTab('finance')}
        />
      </div>

      {/* Main Content Layout: Left 2 Cols (Projects + Tasks), Right 1 Col (Activity Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Projects + Urgent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Section */}
          <div className="bg-white dark:bg-[#121A15] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Active Projects
                </h2>
                <p className="text-xs text-neutral-500">
                  Current deliverables and progress
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-xs font-semibold text-[#0B5D3B] dark:text-[#28A76B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                icon={FolderPlus}
                title="No projects yet"
                description="Create your first project to start tracking deliverables, tasks, and budgets with your partner."
                actionLabel="Create Project"
                onAction={onOpenCreateProject}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentProjects.map((project) => {
                  const progress = getProjectProgress(project.id);
                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="p-4 rounded-lg border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-[#0B5D3B] dark:group-hover:text-[#28A76B] transition-colors truncate">
                            {project.name}
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm shrink-0 ${
                              project.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                : project.status === 'Completed'
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>

                        {project.client?.name && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 truncate">
                            Client: {project.client.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 mt-2">
                        <ProgressBar
                          progress={progress.percentage}
                          completedTasks={progress.completed}
                          totalTasks={progress.total}
                          size="sm"
                        />

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#0B5D3B]" />
                            <span>
                              {project.deadline ? formatDate(project.deadline) : 'No deadline'}
                            </span>
                          </div>
                          {project.budget && project.budget > 0 ? (
                            <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                              {formatCurrency(project.budget, project.currency || currency)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Urgent / Priority Tasks Section */}
          <div className="bg-white dark:bg-[#121A15] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Upcoming &amp; Priority Tasks
                </h2>
                <p className="text-xs text-neutral-500">
                  Immediate action items for you and your partner
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-[#0B5D3B] dark:text-[#28A76B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {priorityTasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No pending tasks"
                description="All tasks are completed or none have been assigned yet."
                actionLabel="Create Task"
                onAction={onOpenCreateTask}
              />
            ) : (
              <div className="space-y-2">
                {priorityTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'Completed')}
                        className="w-4 h-4 rounded-sm border border-neutral-300 dark:border-neutral-600 hover:border-[#0B5D3B] hover:bg-[#0B5D3B]/10 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                        title="Mark as completed"
                      >
                        {task.status === 'Completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5D3B]" />
                        )}
                      </button>

                      <div
                        onClick={() => onSelectTask(task)}
                        className="truncate cursor-pointer hover:underline"
                      >
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {task.project?.name || 'General Task'} ·{' '}
                          {task.assignee?.full_name ? `Assigned to ${task.assignee.full_name}` : 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.due_date && (
                        <span className="text-[11px] text-neutral-500 tabular-nums">
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : task.priority === 'High'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-time Activity Feed & Quick Partner Summary */}
        <div className="space-y-6">
          {/* Real-time Activity Stream */}
          <div className="bg-white dark:bg-[#121A15] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-[#0B5D3B]" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Workspace Activity
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('activity')}
                className="text-xs font-semibold text-[#0B5D3B] dark:text-[#28A76B] hover:underline cursor-pointer"
              >
                History
              </button>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">
                No activity recorded yet. As you and your partner create tasks and updates, live events will appear here.
              </p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 text-xs">
                {activities.slice(0, 10).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/80"
                  >
                    <p className="text-neutral-800 dark:text-neutral-200 leading-snug">
                      <span className="font-semibold text-[#0B5D3B] dark:text-[#28A76B]">
                        {act.actor?.full_name || 'Partner'}:
                      </span>{' '}
                      {act.description}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      {formatTimeAgo(act.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
