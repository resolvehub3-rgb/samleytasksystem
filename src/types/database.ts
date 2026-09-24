export type UserRole = 'owner' | 'admin' | 'member';

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ExpenseCategory =
  | 'Domain'
  | 'Hosting'
  | 'Software'
  | 'Marketing'
  | 'Transportation'
  | 'Equipment'
  | 'Contractor'
  | 'Other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string | null;
  description?: string | null;
  currency: string;
  timezone: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: UserRole;
  token: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
}

export interface Client {
  id: string;
  workspace_id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  client_id?: string | null;
  name: string;
  description?: string | null;
  start_date?: string | null;
  deadline?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number | null;
  currency: string;
  cover_image?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  client?: Client | null;
  assigned_members?: string[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role?: string;
  added_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description?: string | null;
  assignee_id?: string | null;
  creator_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: string | null;
  due_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  tags?: string[] | null;
  position: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  assignee?: Profile | null;
  creator?: Profile | null;
  checklist_count?: number;
  completed_checklist_count?: number;
}

export interface TaskChecklist {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

export interface TaskComment {
  id: string;
  workspace_id: string;
  project_id: string;
  task_id?: string | null;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ProjectNote {
  id: string;
  workspace_id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ProjectFile {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  task_id?: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  storage_bucket: string;
  uploaded_by: string;
  created_at: string;
  uploader?: Profile;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_reassigned'
  | 'deadline_changed'
  | 'comment_added'
  | 'mention'
  | 'project_updated'
  | 'task_completed'
  | 'workspace_invitation';

export interface Notification {
  id: string;
  workspace_id: string;
  user_id: string;
  actor_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface ProjectRevenue {
  id: string;
  workspace_id: string;
  project_id: string;
  client_id?: string | null;
  title: string;
  amount: number;
  payment_date: string;
  currency: string;
  payment_method?: string | null;
  reference?: string | null;
  notes?: string | null;
  created_by: string;
  created_at: string;
  project?: Project;
}

export interface ProjectExpense {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  currency: string;
  payment_method?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
  created_by: string;
  created_at: string;
  project?: Project;
}

export interface Activity {
  id: string;
  workspace_id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  actor?: Profile;
}
