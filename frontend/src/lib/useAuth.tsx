import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useAuth() {
  const [session, setSession] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const sub = supabase.auth.onAuthStateChange((_e, s) => setSession(s)).data

    const checkRole = async (userId?: string) => {
      if (!userId) { setIsAdmin(false); setLoading(false); return }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()
      if (!mounted) return
      setIsAdmin(!error && data?.role === 'admin')
      setLoading(false)
    }

    checkRole(session?.user?.id)

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [/* first mount only */])

  useEffect(() => {
    if (!session?.user?.id) { setIsAdmin(false); return }
    supabase
      .from('profiles')
      .select('role').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(data?.role === 'admin'))
  }, [session?.user?.id])

  return { session, isAdmin, loading }
}
