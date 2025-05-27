import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AccessContext {
  dealergroupId: string;
  trialing: boolean;
  active: boolean;
  trialEndsAt?: string;
  subscriptionStatus?: string;
}

interface AuthContextType {
  user: User | null;
  accessContext: AccessContext | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessContext, setAccessContext] = useState<AccessContext | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccessContext = async (u: User) => {
    const id = u.user_metadata.dealergroup_id;
    if (!id) {
      setAccessContext(null);
      return;
    }

    const { data: dg, error } = await supabase
      .from('dealergroups')
      .select('subscription_status, trial_end')
      .eq('id', id)
      .single();

    if (error || !dg) {
      setAccessContext(null);
      return;
    }

    const now = Date.now();
    const trialEnd = dg.trial_end ? new Date(dg.trial_end).getTime() : 0;
    const trialing = dg.subscription_status === 'trialing' && trialEnd > now;
    const active = dg.subscription_status === 'active' || trialing;

    setAccessContext({
      dealergroupId: id,
      trialing,
      active,
      trialEndsAt: dg.trial_end!,
      subscriptionStatus: dg.subscription_status!,
    });
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (session?.user && session.user.email_confirmed_at) {
        setUser(session.user);
        loadAccessContext(session.user).catch((err) =>
          console.error('[Auth] loadAccessContext failed', err)
        );
      } else {
        setUser(null);
        setAccessContext(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      await loadAccessContext(data.user);
    } else {
      setUser(null);
      setAccessContext(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessContext(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessContext, loading, refreshUser, signOut }}
    >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
          <Typography ml={2}>🔄 Initializing session…</Typography>
        </Box>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
