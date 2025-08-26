import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { SupabaseConnector } from '@/lib/powersync/SupabaseConnector';

const connector = new SupabaseConnector();

export default function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();

    const interval = setInterval(checkSession, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, []);

  async function checkSession() {
    try {
      const { data: { session: currentSession }, error } = await connector.client.auth.getSession();
      
      if (error || !currentSession) {
        setSession(null);
        router.push('/login');
        return;
      }

      setSession(currentSession);
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    session,
    loading,
    checkSession,
  };
}
