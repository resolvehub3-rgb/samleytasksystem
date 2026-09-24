import React, { useState, useMemo } from 'react';
import {
  FolderPlus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Project, ProjectStatus, Client } from '../types/database';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface ProjectsPageProps {
  projects: Project[];
  clients: Client[];
  getProjectProgress: (projectId: string) => { completed: number; total: number; percentage: number };
  onSelectProject: (projectId: string) => void;
  onOpenCreateProject: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  clients,
  getProjectProgress,
  onSelectProject,
  onOpenCreateProject,
  onDeleteProject,
}) => {
  const { activeWorkspace } = useAuth();
  const currency = activeWorkspace?.currency || 'GHS';

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        selectedStatus === 'all' || p.status === selectedStatus;

      const matchClient =
        selectedClient === 'all' || p.client_id === selectedClient;

      return matchSearch && matchStatus && matchClient;
    });
  }, [projects, searchQuery, selectedStatus, selectedClient]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Projects ({projects.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your client deliverables, software milestones, and timelines
          </p>
        </div>

        <button
          onClick={onOpenCreateProject}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Client filter */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-hidden"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5 bg-white dark:bg-neutral-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neutral-100 dark:bg-neutral-700 text-[#0B5D3B] dark:text-[#28A76B]'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-neutral-100 dark:bg-neutral-700 text-[#0B5D3B] dark:text-[#28A76B]'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title={projects.length === 0 ? 'No projects yet' : 'No matching projects'}
          description={
            projects.length === 0
              ? 'Create your first project to start tracking deliverables, tasks, and budgets with your partner.'
              : 'Try clearing your search filters to find what you are looking for.'
          }
          actionLabel={projects.length === 0 ? 'Create Project' : undefined}
          onAction={projects.length === 0 ? onOpenCreateProject : undefined}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const progress = getProjectProgress(project.id);
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#121A15] transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-[#0B5D3B] dark:group-hover:text-[#28A76B] transition-colors truncate">
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
                    <p className="text-xs text-neutral-500 mb-2 truncate">
                      Client: <span className="text-neutral-700 dark:text-neutral-300 font-medium">{project.client.name}</span>
                    </p>
                  )}

                  {project.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                  <ProgressBar
                    progress={progress.percentage}
                    completedTasks={progress.completed}
                    totalTasks={progress.total}
                    size="sm"
                  />

                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0B5D3B]" />
                      <span>{project.deadline ? formatDate(project.deadline) : 'No deadline'}</span>
                    </div>

                    {project.budget && project.budget > 0 ? (
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {formatCurrency(project.budget, project.currency || currency)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">Project Name</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tasks Progress</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project.id);
                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-white">
                        {project.name}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-300">
                        {project.client?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5">
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
                      </td>
                      <td className="px-4 py-3.5 w-44">
                        <ProgressBar
                          progress={progress.percentage}
                          completedTasks={progress.completed}
                          totalTasks={progress.total}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 tabular-nums">
                        {project.deadline ? formatDate(project.deadline) : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {project.budget ? formatCurrency(project.budget, project.currency || currency) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
