import React, { useState } from 'react';
import { Kanban as KanbanIcon, Plus, Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { Task, Project, WorkspaceMember, TaskStatus } from '../types/database';
import { formatDate } from '../utils/formatters';

interface KanbanPageProps {
  tasks: Task[];
  projects: Project[];
  members: WorkspaceMember[];
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: (projectId?: string, initialStatus?: TaskStatus) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<any>;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({
  tasks,
  projects,
  members,
  onSelectTask,
  onOpenCreateTask,
  onUpdateTaskStatus,
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'To Do', label: 'To Do', color: 'border-neutral-300 dark:border-neutral-700' },
    { status: 'In Progress', label: 'In Progress', color: 'border-[#0B5D3B]' },
    { status: 'Review', label: 'Review', color: 'border-[#D9A400]' },
    { status: 'Completed', label: 'Completed', color: 'border-emerald-500' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchProject = selectedProject === 'all' || t.project_id === selectedProject;
    const matchAssignee = selectedAssignee === 'all' || t.assignee_id === selectedAssignee;
    return matchProject && matchAssignee;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <KanbanIcon className="w-5 h-5 text-[#0B5D3B]" />
            <span>Kanban Board</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Drag cards or click arrows to move task progress in real time
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
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

          <button
            onClick={() => onOpenCreateTask(selectedProject !== 'all' ? selectedProject : undefined)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col, colIdx) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`bg-neutral-50/70 dark:bg-[#101712] rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 flex flex-col min-h-[500px] max-h-[calc(100vh-200px)] transition-colors`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full border-2 ${col.color}`} />
                  <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-400 tabular-nums px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks in Column */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-400 text-[11px]">
                    Drop task here
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className="p-3 bg-white dark:bg-[#141E18] rounded-lg border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-grab active:cursor-grabbing shadow-xs transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold text-[#0B5D3B] dark:text-[#28A76B] truncate">
                          {task.project?.name || 'General Task'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs shrink-0 ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              : task.priority === 'High'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                        <span>{task.assignee?.full_name ? task.assignee.full_name.split(' ')[0] : 'Unassigned'}</span>
                        {task.due_date && (
                          <div className="flex items-center gap-1 tabular-nums">
                            <Calendar className="w-3 h-3 text-[#0B5D3B]" />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Shift Arrows for Mobile & Mouse */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-50 dark:border-neutral-800/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        {colIdx > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTaskStatus(task.id, columns[colIdx - 1].status);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                            title={`Move back to ${columns[colIdx - 1].label}`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}

                        {colIdx < columns.length - 1 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTaskStatus(task.id, columns[colIdx + 1].status);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                            title={`Advance to ${columns[colIdx + 1].label}`}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Task to Column */}
              <button
                onClick={() => onOpenCreateTask(undefined, col.status)}
                className="mt-2 w-full py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-[#0B5D3B] hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
