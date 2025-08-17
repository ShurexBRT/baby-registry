import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav('/admin')
    })
  }, [nav])

  const signIn = async () => {
    if (!email || !password) { alert('Unesi email i lozinku.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) alert(error.message)
    else nav('/admin')
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Prijava (lozinka)</h2>
      <input className="border rounded-xl px-3 py-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Lozinka" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={signIn} disabled={loading} className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50">
        {loading ? 'Prijavljujem…' : 'Prijavi se'}
      </button>
      <div className="text-sm opacity-80">
        Ili koristi <Link className="underline" to="/admin">magic link</Link>
      </div>
    </div>
  )
}
