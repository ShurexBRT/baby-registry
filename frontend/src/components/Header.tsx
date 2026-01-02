import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/useAuth'

export default function Header() {
  const { session, isAdmin } = useAuth()
  const loc = useLocation()

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/" className={linkCls(loc.pathname === '/')}>Home</Link>
          {isAdmin && (
            <Link to="/admin" className={linkCls(loc.pathname.startsWith('/admin'))}>
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <span className="hidden sm:inline opacity-70">{session.user.email}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = import.meta.env.BASE_URL // na / posle odjave
                }}
                className="underline"
              >
                Odjavi se
              </button>
            </>
          ) : (
            <Link to="/login" className="underline">Prijava</Link>
          )}
        </div>
      </div>
    </header>
  )
}

function linkCls(active: boolean) {
  return `px-2 py-1 rounded-lg ${active ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
}
