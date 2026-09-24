import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Project,
  Task,
  Client,
  ProjectRevenue,
  ProjectExpense,
  Notification,
  Activity,
  WorkspaceMember,
  ProjectNote,
  ProjectFile,
  TaskComment,
  TaskStatus,
} from '../types/database';

export const useWorkspaceData = () => {
  const { activeWorkspace, user } = useAuth();
  const workspaceId = activeWorkspace?.id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [revenues, setRevenues] = useState<ProjectRevenue[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all workspace data
  const fetchAllData = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Execute queries in parallel
      const [
        projectsRes,
        tasksRes,
        clientsRes,
        revenuesRes,
        expensesRes,
        notificationsRes,
        activitiesRes,
        membersRes,
        notesRes,
        filesRes,
        commentsRes,
      ] = await Promise.all([
        supabase
          .from('projects')
          .select('*, client:clients(*)')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false }),

        supabase
          .from('tasks')
          .select('*, project:projects(*), assignee:profiles!tasks_assignee_id_fkey(*), creator:profiles!tasks_creator_id_fkey(*)')
          .eq('workspace_id', workspaceId)
          .order('position', { ascending: true }),

        supabase
          .from('clients')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('name', { ascending: true }),

        supabase
          .from('project_revenue')
          .select('*, project:projects(*)')
          .eq('workspace_id', workspaceId)
          .order('payment_date', { ascending: false }),

        supabase
          .from('project_expenses')
          .select('*, project:projects(*)')
          .eq('workspace_id', workspaceId)
          .order('expense_date', { ascending: false }),

        supabase
          .from('notifications')
          .select('*, actor:profiles(*)')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('activities')
          .select('*, actor:profiles(*)')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })
          .limit(100),

        supabase
          .from('workspace_members')
          .select('*, profile:profiles(*)')
          .eq('workspace_id', workspaceId),

        supabase
          .from('project_notes')
          .select('*, author:profiles(*)')
          .eq('workspace_id', workspaceId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false }),

        supabase
          .from('files')
          .select('*, uploader:profiles(*)')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false }),

        supabase
          .from('task_comments')
          .select('*, author:profiles(*)')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: true }),
      ]);

      if (projectsRes.error) console.error('Projects query error:', projectsRes.error);
      if (tasksRes.error) console.error('Tasks query error:', tasksRes.error);

      setProjects((projectsRes.data as Project[]) || []);
      setTasks((tasksRes.data as Task[]) || []);
      setClients((clientsRes.data as Client[]) || []);
      setRevenues((revenuesRes.data as ProjectRevenue[]) || []);
      setExpenses((expensesRes.data as ProjectExpense[]) || []);
      setNotifications((notificationsRes.data as Notification[]) || []);
      setActivities((activitiesRes.data as Activity[]) || []);
      setMembers((membersRes.data as WorkspaceMember[]) || []);
      setNotes((notesRes.data as ProjectNote[]) || []);
      setFiles((filesRes.data as ProjectFile[]) || []);
      setComments((commentsRes.data as TaskComment[]) || []);
    } catch (err: any) {
      console.error('Error fetching workspace records:', err);
      setError(err?.message || 'Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user?.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Set up real-time subscriptions for multi-user collaboration
  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`workspace-realtime-${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          // Refetch tasks and activities to keep relations intact
          supabase
            .from('tasks')
            .select('*, project:projects(*), assignee:profiles!tasks_assignee_id_fkey(*), creator:profiles!tasks_creator_id_fkey(*)')
            .eq('workspace_id', workspaceId)
            .order('position', { ascending: true })
            .then(({ data }) => {
              if (data) setTasks(data as Task[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('projects')
            .select('*, client:clients(*)')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data) setProjects(data as Project[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('task_comments')
            .select('*, author:profiles(*)')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
              if (data) setComments(data as TaskComment[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_notes', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('project_notes')
            .select('*, author:profiles(*)')
            .eq('workspace_id', workspaceId)
            .order('is_pinned', { ascending: false })
            .then(({ data }) => {
              if (data) setNotes(data as ProjectNote[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_revenue', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('project_revenue')
            .select('*, project:projects(*)')
            .eq('workspace_id', workspaceId)
            .order('payment_date', { ascending: false })
            .then(({ data }) => {
              if (data) setRevenues(data as ProjectRevenue[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_expenses', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('project_expenses')
            .select('*, project:projects(*)')
            .eq('workspace_id', workspaceId)
            .order('expense_date', { ascending: false })
            .then(({ data }) => {
              if (data) setExpenses(data as ProjectExpense[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('notifications')
            .select('*, actor:profiles(*)')
            .eq('workspace_id', workspaceId)
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
            .limit(50)
            .then(({ data }) => {
              if (data) setNotifications(data as Notification[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('activities')
            .select('*, actor:profiles(*)')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(100)
            .then(({ data }) => {
              if (data) setActivities(data as Activity[]);
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_members', filter: `workspace_id=eq.${workspaceId}` },
        () => {
          supabase
            .from('workspace_members')
            .select('*, profile:profiles(*)')
            .eq('workspace_id', workspaceId)
            .then(({ data }) => {
              if (data) setMembers(data as WorkspaceMember[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, user?.id]);

  // Real-time calculated dashboard statistics
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'Completed' || !t.due_date) return false;
      const due = new Date(t.due_date);
      due.setHours(23, 59, 59, 999);
      return due < now;
    }).length;

    const upcomingDeadlines = tasks.filter(t => {
      if (t.status === 'Completed' || !t.due_date) return false;
      const due = new Date(t.due_date);
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    const totalRevenue = revenues.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const netProjectValue = totalRevenue - totalExpenses;

    const unreadNotifications = notifications.filter(n => !n.is_read).length;

    return {
      activeProjects,
      completedProjects,
      pendingTasks,
      completedTasks,
      overdueTasks,
      upcomingDeadlines,
      totalRevenue,
      totalExpenses,
      netProjectValue,
      unreadNotifications,
    };
  }, [projects, tasks, revenues, expenses, notifications]);

  // Project Helper
  const getProjectProgress = useCallback((projectId: string): { completed: number; total: number; percentage: number } => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    const total = projectTasks.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = projectTasks.filter(t => t.status === 'Completed').length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }, [tasks]);

  // MUTATION ACTIONS
  // 1. Projects
  const createProject = async (projectData: Partial<Project>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        workspace_id: workspaceId,
        created_by: user.id,
      })
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'created_project',
      entity_type: 'project',
      entity_id: data.id,
      description: `Created project "${data.name}"`,
    });

    setProjects(prev => [data as Project, ...prev]);
    return data as Project;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('workspace_id', workspaceId)
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'updated_project',
      entity_type: 'project',
      entity_id: projectId,
      description: `Updated project "${data.name}"`,
    });

    setProjects(prev => prev.map(p => (p.id === projectId ? (data as Project) : p)));
    return data as Project;
  };

  const deleteProject = async (projectId: string) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const target = projects.find(p => p.id === projectId);
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'deleted_project',
      entity_type: 'project',
      entity_id: projectId,
      description: `Deleted project "${target?.name || projectId}"`,
    });

    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.project_id !== projectId));
  };

  // 2. Tasks
  const createTask = async (taskData: Partial<Task>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const maxPos = tasks.reduce((max, t) => Math.max(max, t.position || 0), 0);
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        workspace_id: workspaceId,
        creator_id: user.id,
        position: maxPos + 10,
      })
      .select('*, project:projects(*), assignee:profiles!tasks_assignee_id_fkey(*), creator:profiles!tasks_creator_id_fkey(*)')
      .single();

    if (error) throw error;

    // Send notification if assigned to another user (e.g. wife)
    if (data.assignee_id && data.assignee_id !== user.id) {
      await supabase.from('notifications').insert({
        workspace_id: workspaceId,
        user_id: data.assignee_id,
        actor_id: user.id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You were assigned task "${data.title}"`,
        link: `/tasks?id=${data.id}`,
      });
    }

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'created_task',
      entity_type: 'task',
      entity_id: data.id,
      description: `Created task "${data.title}"`,
    });

    setTasks(prev => [...prev, data as Task]);
    return data as Task;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('workspace_id', workspaceId)
      .select('*, project:projects(*), assignee:profiles!tasks_assignee_id_fkey(*), creator:profiles!tasks_creator_id_fkey(*)')
      .single();

    if (error) throw error;

    // If status changed to Completed, notify creator/assignee
    if (updates.status === 'Completed' && data.creator_id !== user.id) {
      await supabase.from('notifications').insert({
        workspace_id: workspaceId,
        user_id: data.creator_id,
        actor_id: user.id,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${data.title}" was marked completed`,
        link: `/tasks?id=${taskId}`,
      });
    }

    setTasks(prev => prev.map(t => (t.id === taskId ? (data as Task) : t)));
    return data as Task;
  };

  // Optimistic Kanban status update with instant UI reflect + Supabase sync
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!workspaceId || !user) return;
    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask || oldTask.status === newStatus) return;

    // Optimistic local update
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('workspace_id', workspaceId)
        .select('*, project:projects(*), assignee:profiles!tasks_assignee_id_fkey(*), creator:profiles!tasks_creator_id_fkey(*)')
        .single();

      if (error) {
        // Rollback
        setTasks(prev => prev.map(t => (t.id === taskId ? oldTask : t)));
        throw error;
      }

      await supabase.from('activities').insert({
        workspace_id: workspaceId,
        actor_id: user.id,
        action: 'moved_task_status',
        entity_type: 'task',
        entity_id: taskId,
        description: `Moved task "${data.title}" to ${newStatus}`,
      });

      if (newStatus === 'Completed' && data.creator_id !== user.id) {
        await supabase.from('notifications').insert({
          workspace_id: workspaceId,
          user_id: data.creator_id,
          actor_id: user.id,
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${data.title}" was completed`,
          link: `/tasks?id=${taskId}`,
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert state
      setTasks(prev => prev.map(t => (t.id === taskId ? oldTask : t)));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const taskToDelete = tasks.find(t => t.id === taskId);
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'deleted_task',
      entity_type: 'task',
      entity_id: taskId,
      description: `Deleted task "${taskToDelete?.title || taskId}"`,
    });

    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // 3. Clients
  const createClient = async (clientData: Partial<Client>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        workspace_id: workspaceId,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'created_client',
      entity_type: 'client',
      entity_id: data.id,
      description: `Added client "${data.name}"`,
    });

    setClients(prev => [...prev, data as Client]);
    return data as Client;
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) throw error;
    setClients(prev => prev.map(c => (c.id === clientId ? (data as Client) : c)));
    return data as Client;
  };

  const deleteClient = async (clientId: string) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // 4. Finance (Revenue & Expenses)
  const addRevenue = async (revenueData: Partial<ProjectRevenue>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('project_revenue')
      .insert({
        ...revenueData,
        workspace_id: workspaceId,
        created_by: user.id,
      })
      .select('*, project:projects(*)')
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'recorded_revenue',
      entity_type: 'revenue',
      entity_id: data.id,
      description: `Recorded revenue of ${data.currency} ${data.amount} for "${data.title}"`,
    });

    setRevenues(prev => [data as ProjectRevenue, ...prev]);
    return data as ProjectRevenue;
  };

  const deleteRevenue = async (revenueId: string) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { error } = await supabase
      .from('project_revenue')
      .delete()
      .eq('id', revenueId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    setRevenues(prev => prev.filter(r => r.id !== revenueId));
  };

  const addExpense = async (expenseData: Partial<ProjectExpense>) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('project_expenses')
      .insert({
        ...expenseData,
        workspace_id: workspaceId,
        created_by: user.id,
      })
      .select('*, project:projects(*)')
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'recorded_expense',
      entity_type: 'expense',
      entity_id: data.id,
      description: `Recorded expense of ${data.currency} ${data.amount} (${data.category})`,
    });

    setExpenses(prev => [data as ProjectExpense, ...prev]);
    return data as ProjectExpense;
  };

  const deleteExpense = async (expenseId: string) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { error } = await supabase
      .from('project_expenses')
      .delete()
      .eq('id', expenseId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  // 5. Notes
  const addNote = async (noteData: { title: string; content: string; project_id: string; is_pinned?: boolean }) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('project_notes')
      .insert({
        ...noteData,
        workspace_id: workspaceId,
        author_id: user.id,
      })
      .select('*, author:profiles(*)')
      .single();

    if (error) throw error;
    setNotes(prev => [data as ProjectNote, ...prev]);
    return data as ProjectNote;
  };

  const updateNote = async (noteId: string, updates: Partial<ProjectNote>) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('project_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('workspace_id', workspaceId)
      .select('*, author:profiles(*)')
      .single();

    if (error) throw error;
    setNotes(prev => prev.map(n => (n.id === noteId ? (data as ProjectNote) : n)));
    return data as ProjectNote;
  };

  const deleteNote = async (noteId: string) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', noteId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // 6. Comments
  const addComment = async (commentData: { content: string; project_id: string; task_id?: string }) => {
    if (!workspaceId || !user) throw new Error('No active workspace');
    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        ...commentData,
        workspace_id: workspaceId,
        author_id: user.id,
      })
      .select('*, author:profiles(*)')
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'added_comment',
      entity_type: 'comment',
      entity_id: data.id,
      description: `Commented: "${commentData.content.slice(0, 50)}..."`,
    });

    setComments(prev => [...prev, data as TaskComment]);
    return data as TaskComment;
  };

  const deleteComment = async (commentId: string) => {
    if (!workspaceId) throw new Error('No active workspace');
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  // 7. Files (Supabase Storage)
  const uploadFile = async (
    file: File,
    projectId?: string,
    taskId?: string
  ): Promise<ProjectFile> => {
    if (!workspaceId || !user) throw new Error('No active workspace');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${workspaceId}/${projectId || 'general'}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('workspace-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Storage upload warning:', uploadError);
      // Even if bucket policy needs setup, store file record
    }

    // Insert File Metadata Record
    const { data, error: dbError } = await supabase
      .from('files')
      .insert({
        workspace_id: workspaceId,
        project_id: projectId || null,
        task_id: taskId || null,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        storage_bucket: 'workspace-files',
        uploaded_by: user.id,
      })
      .select('*, uploader:profiles(*)')
      .single();

    if (dbError) throw dbError;

    await supabase.from('activities').insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: 'uploaded_file',
      entity_type: 'file',
      entity_id: data.id,
      description: `Uploaded file "${file.name}"`,
    });

    setFiles(prev => [data as ProjectFile, ...prev]);
    return data as ProjectFile;
  };

  const deleteFile = async (fileId: string) => {
    if (!workspaceId) throw new Error('No active workspace');
    const fileRecord = files.find(f => f.id === fileId);

    if (fileRecord?.file_path) {
      await supabase.storage.from(fileRecord.storage_bucket || 'workspace-files').remove([fileRecord.file_path]);
    }

    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 8. Notifications
  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  };

  const markAllNotificationsAsRead = async () => {
    if (!workspaceId || !user) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .eq('is_read', false);
  };

  // 9. Invite Partner / Member
  const inviteMember = async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!workspaceId || !user) throw new Error('No active workspace');

    // Check if user already in profiles
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existingUser) {
      // Add directly to workspace_members
      const { data: memberData, error: memberErr } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: existingUser.id,
          role,
        })
        .select('*, profile:profiles(*)')
        .single();

      if (memberErr) throw memberErr;

      await supabase.from('notifications').insert({
        workspace_id: workspaceId,
        user_id: existingUser.id,
        actor_id: user.id,
        type: 'workspace_invitation',
        title: 'Workspace Access Granted',
        message: `You were added to workspace "${activeWorkspace?.name}" as ${role}`,
      });

      await supabase.from('activities').insert({
        workspace_id: workspaceId,
        actor_id: user.id,
        action: 'added_member',
        entity_type: 'member',
        entity_id: existingUser.id,
        description: `Added partner/member ${email} (${role})`,
      });

      setMembers(prev => [...prev, memberData as WorkspaceMember]);
      return { status: 'added', member: memberData };
    } else {
      // Create Invitation record
      const { data: inviteData, error: inviteErr } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email: email.trim().toLowerCase(),
          role,
        })
        .select()
        .single();

      if (inviteErr) throw inviteErr;

      await supabase.from('activities').insert({
        workspace_id: workspaceId,
        actor_id: user.id,
        action: 'invited_member',
        entity_type: 'invitation',
        entity_id: inviteData.id,
        description: `Sent workspace invitation to ${email}`,
      });

      return { status: 'invited', invitation: inviteData };
    }
  };

  return {
    projects,
    tasks,
    clients,
    revenues,
    expenses,
    notifications,
    activities,
    members,
    notes,
    files,
    comments,
    stats,
    loading,
    error,
    refreshData: fetchAllData,
    getProjectProgress,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    createClient,
    updateClient,
    deleteClient,
    addRevenue,
    deleteRevenue,
    addExpense,
    deleteExpense,
    addNote,
    updateNote,
    deleteNote,
    addComment,
    deleteComment,
    uploadFile,
    deleteFile,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    inviteMember,
  };
};
