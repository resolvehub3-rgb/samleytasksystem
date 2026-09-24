import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CheckSquare,
  Kanban,
  FileText,
  FolderArchive,
  CircleDollarSign,
  History,
  Plus,
  Trash2,
  Upload,
  Pin,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Project, Task, ProjectNote, ProjectFile, ProjectRevenue, ProjectExpense, Activity, WorkspaceMember, TaskStatus } from '../types/database';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate, formatTimeAgo, formatBytes } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface ProjectDetailPageProps {
  project: Project;
  tasks: Task[];
  notes: ProjectNote[];
  files: ProjectFile[];
  revenues: ProjectRevenue[];
  expenses: ProjectExpense[];
  activities: Activity[];
  members: WorkspaceMember[];
  onBack: () => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<any>;
  onDeleteProject: (id: string) => Promise<any>;
  onOpenCreateTask: (projectId: string) => void;
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<any>;
  onAddNote: (noteData: { title: string; content: string; project_id: string; is_pinned?: boolean }) => Promise<any>;
  onDeleteNote: (noteId: string) => Promise<any>;
  onUploadFile: (file: File, projectId?: string) => Promise<any>;
  onDeleteFile: (fileId: string) => Promise<any>;
  onOpenCreateFinance: (projectId: string) => void;
  getProjectProgress: (projectId: string) => { completed: number; total: number; percentage: number };
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  tasks,
  notes,
  files,
  revenues,
  expenses,
  activities,
  members,
  onBack,
  onUpdateProject,
  onDeleteProject,
  onOpenCreateTask,
  onSelectTask,
  onUpdateTaskStatus,
  onAddNote,
  onDeleteNote,
  onUploadFile,
  onDeleteFile,
  onOpenCreateFinance,
  getProjectProgress,
}) => {
  const { activeWorkspace, user } = useAuth();
  const currency = project.currency || activeWorkspace?.currency || 'GHS';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'kanban' | 'files' | 'notes' | 'finance' | 'activity'
  >('overview');

  // Filter project-specific records
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const projectNotes = notes.filter((n) => n.project_id === project.id);
  const projectFiles = files.filter((f) => f.project_id === project.id);
  const projectRevenues = revenues.filter((r) => r.project_id === project.id);
  const projectExpenses = expenses.filter((e) => e.project_id === project.id);
  const projectActivities = activities.filter((a) => a.entity_id === project.id || projectTasks.some((t) => t.id === a.entity_id));

  const progress = getProjectProgress(project.id);
  const totalRevenue = projectRevenues.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalExpense = projectExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpense;

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePinned, setNotePinned] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // File upload state
  const [uploading, setUploading] = useState(false);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      setAddingNote(true);
      await onAddNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        project_id: project.id,
        is_pinned: notePinned,
      });
      setNoteTitle('');
      setNoteContent('');
      setNotePinned(false);
    } finally {
      setAddingNote(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    try {
      setUploading(true);
      await onUploadFile(fileList[0], project.id);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const kanbanColumns: { status: TaskStatus; label: string }[] = [
    { status: 'To Do', label: 'To Do' },
    { status: 'In Progress', label: 'In Progress' },
    { status: 'Review', label: 'Review' },
    { status: 'Completed', label: 'Completed' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm(`Delete project "${project.name}" and all its tasks?`)) {
                onDeleteProject(project.id);
                onBack();
              }
            }}
            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Header Card */}
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {project.name}
              </h1>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                  project.status === 'Active'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : project.status === 'Completed'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                }`}
              >
                {project.status}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {project.priority} Priority
              </span>
            </div>

            {project.client?.name && (
              <p className="text-xs text-neutral-500 mt-1">
                Client: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{project.client.name}</span>
                {project.client.company ? ` (${project.client.company})` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenCreateTask(project.id)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>

            <button
              onClick={() => onOpenCreateFinance(project.id)}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span>Record Finance</span>
            </button>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
          <div>
            <span className="text-neutral-400 block text-[11px]">Tasks Completion</span>
            <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
              {progress.completed} / {progress.total} ({progress.percentage}%)
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Deadline</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
              {project.deadline ? formatDate(project.deadline) : 'No deadline set'}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Budget Target</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 tabular-nums font-mono">
              {project.budget ? formatCurrency(project.budget, currency) : '—'}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Net Tracked Profit</span>
            <span
              className={`font-bold tabular-nums font-mono ${
                netProfit >= 0 ? 'text-[#0B5D3B] dark:text-[#28A76B]' : 'text-rose-600'
              }`}
            >
              {formatCurrency(netProfit, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckSquare },
          { id: 'kanban', label: 'Kanban', icon: Kanban },
          { id: 'notes', label: `Partner Notes (${projectNotes.length})`, icon: FileText },
          { id: 'files', label: `Files (${projectFiles.length})`, icon: FolderArchive },
          { id: 'finance', label: `Finance (${projectRevenues.length + projectExpenses.length})`, icon: CircleDollarSign },
          { id: 'activity', label: 'Activity', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-[#0B5D3B] text-[#0B5D3B] dark:text-[#28A76B]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                Project Scope &amp; Details
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {project.description || 'No description provided for this project yet.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                Overall Progress
              </h3>
              <ProgressBar
                progress={progress.percentage}
                completedTasks={progress.completed}
                totalTasks={progress.total}
                size="md"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                Financial Snapshot
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Target Budget</span>
                  <span className="font-mono font-medium">{formatCurrency(project.budget || 0, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Collected Revenue</span>
                  <span className="font-mono font-medium text-[#0B5D3B] dark:text-[#28A76B]">{formatCurrency(totalRevenue, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Total Expenses</span>
                  <span className="font-mono font-medium text-rose-600">{formatCurrency(totalExpense, currency)}</span>
                </div>
                <div className="flex justify-between py-1.5 pt-2 font-bold">
                  <span className="text-neutral-800 dark:text-neutral-200">Net Profit</span>
                  <span className={`font-mono ${netProfit >= 0 ? 'text-[#0B5D3B] dark:text-[#28A76B]' : 'text-rose-600'}`}>
                    {formatCurrency(netProfit, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks List */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 font-medium">
              Showing {projectTasks.length} task{projectTasks.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => onOpenCreateTask(project.id)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {projectTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks in this project"
              description="Create a task to assign work to yourself or your partner."
              actionLabel="Add Task"
              onAction={() => onOpenCreateTask(project.id)}
            />
          ) : (
            <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 text-xs shadow-xs">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500'
                          : task.status === 'In Progress'
                          ? 'bg-[#0B5D3B]'
                          : task.status === 'Review'
                          ? 'bg-[#D9A400]'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    />
                    <div className="truncate">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                        {task.assignee?.full_name ? `Assigned: ${task.assignee.full_name}` : 'Unassigned'}
                        {task.due_date ? ` · Due: ${formatDate(task.due_date)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : task.status === 'In Progress'
                          ? 'bg-[#EBF7F0] dark:bg-[#0B5D3B]/20 text-[#0B5D3B] dark:text-[#28A76B]'
                          : task.status === 'Review'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                      }`}
                    >
                      {task.status}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Kanban */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = projectTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-neutral-50 dark:bg-[#101712] rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 flex flex-col max-h-[70vh]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/60 dark:border-neutral-800/80">
                  <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                    {col.label}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                  {colTasks.length === 0 ? (
                    <p className="text-center py-6 text-neutral-400 italic text-[11px]">
                      No tasks
                    </p>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className="p-3 bg-white dark:bg-[#141E18] rounded-lg border border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer shadow-xs transition-all space-y-2"
                      >
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {t.title}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                          <span>{t.assignee?.full_name ? t.assignee.full_name.split(' ')[0] : 'Unassigned'}</span>
                          {t.due_date && <span className="tabular-nums">{formatDate(t.due_date)}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => onOpenCreateTask(project.id)}
                  className="mt-2 w-full py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-[#0B5D3B] hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Notes (Collaborative Markdown Notes for Partners) */}
      {activeTab === 'notes' && (
        <div className="space-y-6 text-xs">
          {/* Create Note Box */}
          <form
            onSubmit={handleCreateNote}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs space-y-3"
          >
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Write Partner Note / Spec
            </h3>
            <input
              type="text"
              required
              placeholder="Note title (e.g. Architecture decisions, client feedback meeting)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
            <textarea
              rows={3}
              placeholder="Write thoughts, technical notes, or action items..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={notePinned}
                  onChange={(e) => setNotePinned(e.target.checked)}
                  className="rounded-sm text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                <span>Pin note to top</span>
              </label>

              <button
                type="submit"
                disabled={addingNote || !noteTitle.trim()}
                className="px-4 py-1.5 font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {addingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>

          {/* Notes Grid */}
          {projectNotes.length === 0 ? (
            <p className="text-center py-8 text-neutral-400">
              No notes created yet. Use notes to document project specifications and partner discussions.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border bg-white dark:bg-[#121A15] shadow-xs relative flex flex-col justify-between ${
                    note.is_pinned
                      ? 'border-[#0B5D3B]/40 bg-[#EBF7F0]/10'
                      : 'border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {note.is_pinned && <Pin className="w-3.5 h-3.5 text-[#0B5D3B] shrink-0" />}
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                          {note.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                    <span>By {note.author?.full_name || 'Partner'}</span>
                    <span>{formatTimeAgo(note.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Files (Supabase Storage) */}
      {activeTab === 'files' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-medium">
              Files stored directly in Supabase Storage
            </span>

            <label className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input
                type="file"
                disabled={uploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {projectFiles.length === 0 ? (
            <EmptyState
              icon={FolderArchive}
              title="No files uploaded"
              description="Upload project contracts, requirements documents, design assets, or screenshots."
            />
          ) : (
            <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 shadow-xs">
              {projectFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderArchive className="w-5 h-5 text-[#0B5D3B]" />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {file.file_name}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {formatBytes(file.file_size)} · Uploaded by {file.uploader?.full_name || 'Partner'} · {formatDate(file.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Finance */}
      {activeTab === 'finance' && (
        <div className="space-y-6 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              Project Ledger ({projectRevenues.length} revenue, {projectExpenses.length} expense)
            </h3>
            <button
              onClick={() => onOpenCreateFinance(project.id)}
              className="px-3 py-1.5 font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Column */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-bold text-xs text-[#0B5D3B] dark:text-[#28A76B]">
                  Collected Revenue
                </span>
                <span className="font-mono font-bold">{formatCurrency(totalRevenue, currency)}</span>
              </div>
              {projectRevenues.length === 0 ? (
                <p className="text-neutral-400 py-4 text-center italic">No revenue recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {projectRevenues.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{r.title}</p>
                        <p className="text-[10px] text-neutral-400">
                          {formatDate(r.payment_date)} {r.reference ? `· Ref: ${r.reference}` : ''}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-[#0B5D3B] dark:text-[#28A76B]">
                        +{formatCurrency(r.amount, r.currency || currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses Column */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-bold text-xs text-rose-600">
                  Project Expenses
                </span>
                <span className="font-mono font-bold">{formatCurrency(totalExpense, currency)}</span>
              </div>
              {projectExpenses.length === 0 ? (
                <p className="text-neutral-400 py-4 text-center italic">No expenses recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {projectExpenses.map((e) => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{e.title}</p>
                        <p className="text-[10px] text-neutral-400">
                          {formatDate(e.expense_date)} · {e.category}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-rose-600">
                        -{formatCurrency(e.amount, e.currency || currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs text-xs space-y-3">
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm mb-4">
            Audit Trail for {project.name}
          </h3>
          {projectActivities.length === 0 ? (
            <p className="text-neutral-400 py-6 text-center italic">No activity logs recorded yet</p>
          ) : (
            <div className="space-y-3">
              {projectActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/80 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-[#0B5D3B] dark:text-[#28A76B]">
                      {act.actor?.full_name || 'Partner'}:
                    </span>{' '}
                    <span className="text-neutral-800 dark:text-neutral-200">{act.description}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 tabular-nums">
                    {formatTimeAgo(act.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
