import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Workspace, WorkspaceMember, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  userRole: UserRole | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  createWorkspace: (name: string, currency?: string, timezone?: string, description?: string) => Promise<{ workspace: Workspace | null; error: any }>;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkConfiguration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [configured, setConfigured] = useState<boolean>(isSupabaseConfigured());

  const checkConfiguration = useCallback(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  // Fetch user profile from public.profiles
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if row hasn't synced yet
        const tempProfile: Profile = {
          id: userId,
          email: user?.email || '',
          full_name: (user?.user_metadata?.full_name as string) || (user?.email?.split('@')[0] ?? 'User'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(tempProfile);
      }
    } catch (err) {
      console.error('Profile fetch failed', err);
    }
  }, [user]);

  // Fetch user's workspaces
  const fetchWorkspaces = useCallback(async (userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, workspaces (*)')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching user workspace memberships:', memberError);
        return;
      }

      if (memberData && memberData.length > 0) {
        const fetchedWorkspaces = memberData
          .map((m: any) => m.workspaces)
          .filter(Boolean) as Workspace[];

        setWorkspaces(fetchedWorkspaces);

        // Retrieve remembered active workspace or choose first
        const savedWorkspaceId = localStorage.getItem('syncedge_active_workspace_id');
        const matched = fetchedWorkspaces.find(w => w.id === savedWorkspaceId);
        const currentWs = matched || fetchedWorkspaces[0];

        setActiveWorkspace(currentWs);
        if (currentWs) {
          localStorage.setItem('syncedge_active_workspace_id', currentWs.id);
          const currentMember = memberData.find((m: any) => m.workspace_id === currentWs.id);
          setUserRole((currentMember?.role as UserRole) || 'member');
        }
      } else {
        setWorkspaces([]);
        setActiveWorkspace(null);
        setUserRole(null);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    checkConfiguration();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWorkspaces(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWorkspaces(session.user.id);
      } else {
        setProfile(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchWorkspaces, checkConfiguration]);

  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
      localStorage.setItem('syncedge_active_workspace_id', ws.id);
      // Update role for active workspace
      supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', ws.id)
        .eq('user_id', user?.id)
        .single()
        .then(({ data }) => {
          if (data) setUserRole(data.role as UserRole);
        });
    }
  };

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data.user) {
      await fetchProfile(res.data.user.id);
      await fetchWorkspaces(res.data.user.id);
    }
    return { error: res.error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!res.error && res.data.user) {
      // Upsert profile in case trigger needs a moment
      await supabase.from('profiles').upsert({
        id: res.data.user.id,
        email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });
      await fetchProfile(res.data.user.id);
    }

    return { error: res.error, data: res.data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('syncedge_active_workspace_id');
    setUser(null);
    setSession(null);
    setProfile(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: res.error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('User not logged in') };
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
    }
    return { error };
  };

  const createWorkspace = async (
    name: string,
    currency = 'GHS',
    timezone = 'Africa/Accra',
    description = ''
  ): Promise<{ workspace: Workspace | null; error: any }> => {
    if (!user) return { workspace: null, error: new Error('Not logged in') };

    // 1. Insert Workspace
    const { data: wsData, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name,
        currency,
        timezone,
        description,
        owner_id: user.id,
      })
      .select()
      .single();

    if (wsError || !wsData) {
      return { workspace: null, error: wsError };
    }

    const createdWorkspace = wsData as Workspace;

    // 2. Insert Membership as 'owner'
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: createdWorkspace.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      console.error('Error setting workspace membership:', memberError);
    }

    // 3. Log Activity
    await supabase.from('activities').insert({
      workspace_id: createdWorkspace.id,
      actor_id: user.id,
      action: 'workspace_created',
      entity_type: 'workspace',
      entity_id: createdWorkspace.id,
      description: `Created workspace "${createdWorkspace.name}"`,
    });

    // 4. Update state
    setWorkspaces(prev => [...prev, createdWorkspace]);
    setActiveWorkspace(createdWorkspace);
    setUserRole('owner');
    localStorage.setItem('syncedge_active_workspace_id', createdWorkspace.id);

    return { workspace: createdWorkspace, error: null };
  };

  const refreshWorkspaces = async () => {
    if (user) {
      await fetchWorkspaces(user.id);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        workspaces,
        activeWorkspace,
        userRole,
        loading,
        configured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        createWorkspace,
        switchWorkspace,
        refreshWorkspaces,
        refreshProfile,
        checkConfiguration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
