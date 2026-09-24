import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  CheckSquare,
  Plus,
  Trash2,
  Send,
  Folder,
} from 'lucide-react';
import { Task, TaskComment, TaskChecklist, WorkspaceMember, TaskStatus, TaskPriority } from '../../types/database';
import { formatDate, formatTimeAgo, getInitials } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  comments: TaskComment[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<any>;
  onDeleteTask: (taskId: string) => Promise<any>;
  onAddComment: (commentData: { content: string; project_id: string; task_id: string }) => Promise<any>;
  onDeleteComment: (commentId: string) => Promise<any>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  members,
  comments,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onDeleteComment,
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [checklists, setChecklists] = useState<TaskChecklist[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  // Fetch checklists for this task
  useEffect(() => {
    if (!task?.id) {
      setChecklists([]);
      return;
    }

    const fetchChecklists = async () => {
      const { data } = await supabase
        .from('task_checklists')
        .select('*')
        .eq('task_id', task.id)
        .order('position', { ascending: true });

      if (data) setChecklists(data as TaskChecklist[]);
    };

    fetchChecklists();

    // Subscribe to task checklists
    const channel = supabase
      .channel(`task-checklists-${task.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_checklists', filter: `task_id=eq.${task.id}` },
        () => fetchChecklists()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [task?.id]);

  if (!isOpen || !task) return null;

  const taskComments = comments.filter((c) => c.task_id === task.id);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await onUpdateTask(task.id, { status: newStatus });
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    await onUpdateTask(task.id, { priority: newPriority });
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    await onUpdateTask(task.id, { assignee_id: newAssigneeId || null });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setLoadingComment(true);
      await onAddComment({
        content: commentText.trim(),
        project_id: task.project_id,
        task_id: task.id,
      });
      setCommentText('');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    try {
      setLoadingChecklist(true);
      const { data } = await supabase
        .from('task_checklists')
        .insert({
          task_id: task.id,
          title: newChecklistTitle.trim(),
          is_completed: false,
          position: checklists.length,
        })
        .select()
        .single();

      if (data) {
        setChecklists((prev) => [...prev, data as TaskChecklist]);
      }
      setNewChecklistTitle('');
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleToggleChecklist = async (item: TaskChecklist) => {
    const updated = !item.is_completed;
    setChecklists((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, is_completed: updated } : c))
    );

    await supabase
      .from('task_checklists')
      .update({ is_completed: updated })
      .eq('id', item.id);
  };

  const handleDeleteChecklist = async (itemId: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== itemId));
    await supabase.from('task_checklists').delete().eq('id', itemId);
  };

  const completedChecklistCount = checklists.filter((c) => c.is_completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Folder className="w-3.5 h-3.5 text-[#0B5D3B]" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {task.project?.name || 'Project Task'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {task.title}
            </h2>
            {task.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800">
            {/* Status */}
            <div>
              <span className="block text-[11px] text-neutral-500 mb-1">Status</span>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full font-semibold text-xs py-1 px-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <span className="block text-[11px] text-neutral-500 mb-1">Priority</span>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className="w-full font-semibold text-xs py-1 px-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <span className="block text-[11px] text-neutral-500 mb-1">Assignee</span>
              <select
                value={task.assignee_id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full text-xs py-1 px-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profile?.full_name || m.profile?.email || 'Partner'}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <span className="block text-[11px] text-neutral-500 mb-1">Due Date</span>
              <div className="flex items-center gap-1.5 py-1 px-2 text-neutral-700 dark:text-neutral-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#0B5D3B]" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Tags:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-neutral-600 dark:text-neutral-300">
                    #{tag}
                    {idx < (task.tags?.length || 0) - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checklist Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#0B5D3B]" />
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                  Checklist
                </h4>
                <span className="text-neutral-500 tabular-nums">
                  ({completedChecklistCount}/{checklists.length})
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 mb-3">
              {checklists.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_completed}
                      onChange={() => handleToggleChecklist(item)}
                      className="w-4 h-4 rounded-sm text-[#0B5D3B] focus:ring-[#0B5D3B]"
                    />
                    <span
                      className={`text-xs ${
                        item.is_completed
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {item.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist input */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-task or checklist step..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              />
              <button
                type="submit"
                disabled={loadingChecklist || !newChecklistTitle.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Real-time Comments Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Real-time Discussion ({taskComments.length})
            </h4>

            {/* Comments list */}
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {taskComments.length === 0 ? (
                <p className="text-neutral-400 dark:text-neutral-500 italic text-xs py-2">
                  No comments yet. Start the conversation with your partner.
                </p>
              ) : (
                taskComments.map((c) => {
                  const isAuthor = user?.id === c.author_id;
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0B5D3B]/20 text-[#0B5D3B] dark:text-[#28A76B] flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(c.author?.full_name || 'Partner')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {c.author?.full_name || 'Team Member'}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {formatTimeAgo(c.created_at)}
                            </span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300 mt-1 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      </div>

                      {isAuthor && (
                        <button
                          onClick={() => onDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment or update for your partner..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#0B5D3B]"
              />
              <button
                type="submit"
                disabled={loadingComment || !commentText.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5D3B] hover:bg-[#08492E] rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
