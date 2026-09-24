import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Task, Project, WorkspaceMember, TaskStatus } from '../types/database';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  members: WorkspaceMember[];
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<any>;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  projects,
  members,
  onSelectTask,
  onOpenCreateTask,
  onUpdateTaskStatus,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        selectedStatus === 'all' || t.status === selectedStatus;

      const matchProject =
        selectedProject === 'all' || t.project_id === selectedProject;

      const matchAssignee =
        selectedAssignee === 'all' || t.assignee_id === selectedAssignee;

      return matchSearch && matchStatus && matchProject && matchAssignee;
    });
  }, [tasks, search, selectedStatus, selectedProject, selectedAssignee]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Tasks ({tasks.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track and complete daily development and client action items
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Project filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Assignee filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
          >
            <option value="all">All Assignees</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.profile?.full_name || m.profile?.email || 'Partner'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
          description={
            tasks.length === 0
              ? 'Create a task to assign action items to yourself or your partner.'
              : 'Try clearing your search filters to find what you are looking for.'
          }
          actionLabel={tasks.length === 0 ? 'Create Task' : undefined}
          onAction={tasks.length === 0 ? onOpenCreateTask : undefined}
        />
      ) : (
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-xs text-xs">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <button
                  onClick={() =>
                    onUpdateTaskStatus(
                      task.id,
                      task.status === 'Completed' ? 'To Do' : 'Completed'
                    )
                  }
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                    task.status === 'Completed'
                      ? 'border-[#0B5D3B] bg-[#0B5D3B] text-white'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-[#0B5D3B]'
                  }`}
                  title={task.status === 'Completed' ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div
                  onClick={() => onSelectTask(task)}
                  className="truncate cursor-pointer hover:underline flex-1"
                >
                  <p
                    className={`font-semibold truncate ${
                      task.status === 'Completed'
                        ? 'line-through text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                    {task.project?.name || 'General Task'} ·{' '}
                    {task.assignee?.full_name ? `Assigned: ${task.assignee.full_name}` : 'Unassigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {task.due_date && (
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500 tabular-nums">
                    <Calendar className="w-3 h-3 text-[#0B5D3B]" />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                )}

                <select
                  value={task.status}
                  onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-[10px] font-semibold py-1 px-2 rounded-sm border cursor-pointer ${
                    task.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : task.status === 'In Progress'
                      ? 'bg-[#EBF7F0] dark:bg-[#0B5D3B]/20 border-[#0B5D3B]/30 text-[#0B5D3B] dark:text-[#28A76B]'
                      : task.status === 'Review'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                      : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>

                <span className="text-[10px] text-neutral-400 font-medium hidden md:inline">
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
