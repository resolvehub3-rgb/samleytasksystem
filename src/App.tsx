/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useWorkspaceData } from './hooks/useWorkspaceData';

// Navigation Components
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { MobileNav } from './components/navigation/MobileNav';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { KanbanPage } from './pages/KanbanPage';
import { CalendarPage } from './pages/CalendarPage';
import { ClientsPage } from './pages/ClientsPage';
import { FinancePage } from './pages/FinancePage';
import { FilesPage } from './pages/FilesPage';
import { TeamPage } from './pages/TeamPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

// Modals
import { SupabaseSetupModal } from './components/modals/SupabaseSetupModal';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CreateClientModal } from './components/modals/CreateClientModal';
import { CreateFinanceModal } from './components/modals/CreateFinanceModal';
import { InviteMemberModal } from './components/modals/InviteMemberModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { CreateWorkspaceModal } from './components/modals/CreateWorkspaceModal';

// Brand & Types
import { BrandLogo } from './components/common/BrandLogo';
import { Task, TaskStatus } from './types/database';

const MainApplication: React.FC = () => {
  const {
    user,
    loading: authLoading,
    activeWorkspace,
    workspaces,
    refreshWorkspaces,
  } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modals state
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState<{
    open: boolean;
    projectId?: string;
    initialStatus?: TaskStatus;
  }>({ open: false });
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [createFinanceOpen, setCreateFinanceOpen] = useState<{
    open: boolean;
    type?: 'revenue' | 'expense';
    projectId?: string;
  }>({ open: false });
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Global Keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Connect Workspace Data Hook
  const workspaceData = useWorkspaceData();

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0B100D] flex flex-col items-center justify-center font-sans">
        <BrandLogo size="lg" />
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <div className="w-2 h-2 rounded-full bg-[#0B5D3B] animate-ping" />
          <span>Synchronizing workspace session...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated -> Auth Page
  if (!user) {
    return (
      <>
        <AuthPage onOpenSupabaseSetup={() => setSetupModalOpen(true)} />
        <SupabaseSetupModal
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
        />
      </>
    );
  }

  // Authenticated but zero workspaces -> Workspace Onboarding Modal
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0B100D] flex flex-col items-center justify-center p-6 font-sans">
        <BrandLogo size="lg" />
        <CreateWorkspaceModal
          isOpen={true}
          onClose={() => refreshWorkspaces()}
          isInitialSetup={true}
        />
        <SupabaseSetupModal
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
        />
      </div>
    );
  }

  // Look up selected project if currently viewing project detail
  const currentProject = selectedProjectId
    ? workspaceData.projects.find((p) => p.id === selectedProjectId)
    : null;

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-[#0E1511] text-neutral-900 dark:text-neutral-100 flex font-sans selection:bg-[#0B5D3B]/20 selection:text-[#0B5D3B]">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedProjectId(null);
        }}
        onOpenSupabaseSetup={() => setSetupModalOpen(true)}
        onOpenCreateWorkspace={() => setCreateWorkspaceOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* TopBar */}
        <TopBar
          pageTitle={
            selectedProjectId && currentProject
              ? `Projects / ${currentProject.name}`
              : activeTab
          }
          notifications={workspaceData.notifications}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenCreateProject={() => setCreateProjectOpen(true)}
          onOpenCreateTask={() => setCreateTaskOpen({ open: true })}
          onOpenCreateFinance={() => setCreateFinanceOpen({ open: true })}
          onOpenCreateClient={() => setCreateClientOpen(true)}
          onMarkNotificationRead={workspaceData.markNotificationAsRead}
          onMarkAllNotificationsRead={workspaceData.markAllNotificationsAsRead}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto">
          {/* Projects View: Detail vs Listing */}
          {activeTab === 'projects' && (
            selectedProjectId && currentProject ? (
              <ProjectDetailPage
                project={currentProject}
                tasks={workspaceData.tasks}
                notes={workspaceData.notes}
                files={workspaceData.files}
                revenues={workspaceData.revenues}
                expenses={workspaceData.expenses}
                activities={workspaceData.activities}
                members={workspaceData.members}
                onBack={() => setSelectedProjectId(null)}
                onUpdateProject={workspaceData.updateProject}
                onDeleteProject={workspaceData.deleteProject}
                onOpenCreateTask={(projId) =>
                  setCreateTaskOpen({ open: true, projectId: projId })
                }
                onSelectTask={(task) => setSelectedTask(task)}
                onUpdateTaskStatus={workspaceData.updateTaskStatus}
                onAddNote={workspaceData.addNote}
                onDeleteNote={workspaceData.deleteNote}
                onUploadFile={workspaceData.uploadFile}
                onDeleteFile={workspaceData.deleteFile}
                onOpenCreateFinance={(projId) =>
                  setCreateFinanceOpen({ open: true, projectId: projId })
                }
                getProjectProgress={workspaceData.getProjectProgress}
              />
            ) : (
              <ProjectsPage
                projects={workspaceData.projects}
                clients={workspaceData.clients}
                getProjectProgress={workspaceData.getProjectProgress}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onOpenCreateProject={() => setCreateProjectOpen(true)}
                onDeleteProject={workspaceData.deleteProject}
              />
            )
          )}

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              workspaceData={workspaceData}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setSelectedProjectId(null);
              }}
              onSelectProject={(id) => {
                setActiveTab('projects');
                setSelectedProjectId(id);
              }}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenCreateProject={() => setCreateProjectOpen(true)}
              onOpenCreateTask={() => setCreateTaskOpen({ open: true })}
            />
          )}

          {/* Tasks View */}
          {activeTab === 'tasks' && (
            <TasksPage
              tasks={workspaceData.tasks}
              projects={workspaceData.projects}
              members={workspaceData.members}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenCreateTask={() => setCreateTaskOpen({ open: true })}
              onUpdateTaskStatus={workspaceData.updateTaskStatus}
            />
          )}

          {/* Kanban View */}
          {activeTab === 'kanban' && (
            <KanbanPage
              tasks={workspaceData.tasks}
              projects={workspaceData.projects}
              members={workspaceData.members}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenCreateTask={(projectId, initialStatus) =>
                setCreateTaskOpen({ open: true, projectId, initialStatus })
              }
              onUpdateTaskStatus={workspaceData.updateTaskStatus}
            />
          )}

          {/* Calendar View */}
          {activeTab === 'calendar' && (
            <CalendarPage
              projects={workspaceData.projects}
              tasks={workspaceData.tasks}
              onSelectProject={(id) => {
                setActiveTab('projects');
                setSelectedProjectId(id);
              }}
              onSelectTask={(task) => setSelectedTask(task)}
            />
          )}

          {/* Clients View */}
          {activeTab === 'clients' && (
            <ClientsPage
              clients={workspaceData.clients}
              projects={workspaceData.projects}
              revenues={workspaceData.revenues}
              onOpenCreateClient={() => setCreateClientOpen(true)}
              onDeleteClient={workspaceData.deleteClient}
              onSelectProject={(id) => {
                setActiveTab('projects');
                setSelectedProjectId(id);
              }}
            />
          )}

          {/* Finance View */}
          {activeTab === 'finance' && (
            <FinancePage
              revenues={workspaceData.revenues}
              expenses={workspaceData.expenses}
              projects={workspaceData.projects}
              onOpenCreateFinance={(type) =>
                setCreateFinanceOpen({ open: true, type })
              }
              onDeleteRevenue={workspaceData.deleteRevenue}
              onDeleteExpense={workspaceData.deleteExpense}
            />
          )}

          {/* Files View */}
          {activeTab === 'files' && (
            <FilesPage
              files={workspaceData.files}
              projects={workspaceData.projects}
              onUploadFile={workspaceData.uploadFile}
              onDeleteFile={workspaceData.deleteFile}
            />
          )}

          {/* Team / Partner View */}
          {activeTab === 'team' && (
            <TeamPage
              members={workspaceData.members}
              onOpenInviteModal={() => setInviteMemberOpen(true)}
            />
          )}

          {/* Activity Log View */}
          {activeTab === 'activity' && (
            <ActivityPage activities={workspaceData.activities} />
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <SettingsPage onOpenSupabaseSetup={() => setSetupModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedProjectId(null);
        }}
        onOpenMobileMenu={() => setActiveTab('settings')}
      />

      {/* Global Modals */}
      <SupabaseSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />

      <CreateWorkspaceModal
        isOpen={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />

      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        clients={workspaceData.clients}
        members={workspaceData.members}
        currency={activeWorkspace?.currency || 'GHS'}
        onSubmit={workspaceData.createProject}
      />

      <CreateTaskModal
        isOpen={createTaskOpen.open}
        onClose={() => setCreateTaskOpen({ open: false })}
        projects={workspaceData.projects}
        members={workspaceData.members}
        initialProjectId={createTaskOpen.projectId}
        initialStatus={createTaskOpen.initialStatus}
        onSubmit={workspaceData.createTask}
      />

      <CreateClientModal
        isOpen={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        onSubmit={workspaceData.createClient}
      />

      <CreateFinanceModal
        isOpen={createFinanceOpen.open}
        onClose={() => setCreateFinanceOpen({ open: false })}
        projects={workspaceData.projects}
        defaultType={createFinanceOpen.type}
        initialProjectId={createFinanceOpen.projectId}
        currency={activeWorkspace?.currency || 'GHS'}
        onAddRevenue={workspaceData.addRevenue}
        onAddExpense={workspaceData.addExpense}
      />

      <InviteMemberModal
        isOpen={inviteMemberOpen}
        onClose={() => setInviteMemberOpen(false)}
        workspaceName={activeWorkspace?.name}
        onInvite={workspaceData.inviteMember}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        members={workspaceData.members}
        comments={workspaceData.comments}
        onUpdateTask={workspaceData.updateTask}
        onDeleteTask={workspaceData.deleteTask}
        onAddComment={workspaceData.addComment}
        onDeleteComment={workspaceData.deleteComment}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        projects={workspaceData.projects}
        tasks={workspaceData.tasks}
        clients={workspaceData.clients}
        notes={workspaceData.notes}
        onSelectProject={(id) => {
          setActiveTab('projects');
          setSelectedProjectId(id);
        }}
        onSelectTask={(task) => {
          setSelectedTask(task);
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedProjectId(null);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}
