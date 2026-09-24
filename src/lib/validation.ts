import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(60),
  description: z.string().max(300).optional(),
  currency: z.string().min(3).max(4).default('GHS'),
  timezone: z.string().default('Africa/Accra'),
});

export const clientSchema = z.object({
  name: z.string().min(2, 'Client name is required').max(100),
  company: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(120),
  description: z.string().max(2000).optional().nullable(),
  client_id: z.string().uuid().optional().nullable().or(z.literal('')),
  start_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  budget: z.number().min(0, 'Budget cannot be negative').optional().nullable(),
  currency: z.string().default('GHS'),
});

export const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required').max(200),
  description: z.string().max(4000).optional().nullable(),
  project_id: z.string().uuid('Project must be selected'),
  assignee_id: z.string().uuid().optional().nullable().or(z.literal('')),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  start_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  estimated_hours: z.number().min(0).optional().nullable(),
  actual_hours: z.number().min(0).optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const revenueSchema = z.object({
  title: z.string().min(2, 'Payment description is required').max(150),
  amount: z.number().positive('Amount must be greater than zero'),
  payment_date: z.string().min(1, 'Payment date is required'),
  project_id: z.string().uuid('Project must be selected'),
  client_id: z.string().uuid().optional().nullable().or(z.literal('')),
  currency: z.string().default('GHS'),
  payment_method: z.string().optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const expenseSchema = z.object({
  title: z.string().min(2, 'Expense title is required').max(150),
  category: z.enum(['Domain', 'Hosting', 'Software', 'Marketing', 'Transportation', 'Equipment', 'Contractor', 'Other']),
  amount: z.number().positive('Amount must be greater than zero'),
  expense_date: z.string().min(1, 'Date is required'),
  project_id: z.string().uuid('Project must be selected'),
  currency: z.string().default('GHS'),
  payment_method: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const invitationSchema = z.object({
  email: z.string().email('Please enter a valid partner email address'),
  role: z.enum(['admin', 'member']),
});
