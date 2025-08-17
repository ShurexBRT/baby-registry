import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const nav = useNavigate()
  const [ready, setReady] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (window.location.hash.includes('access_token')) {
          await supabase.auth.exchangeCodeForSession(window.location.hash)
        }
      } catch {}
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email ?? null)
      setReady(true)
    }
    init()
  }, [])

  const setPassword = async () => {
    if (!pwd || pwd.length < 8) return alert('Lozinka mora imati bar 8 karaktera.')
    if (pwd !== pwd2) return alert('Lozinke se ne poklapaju.')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pwd })
    setLoading(false)
    if (error) return alert(error.message)
    alert('Lozinka je postavljena. Možeš da se prijaviš.')
    nav('/login')
  }

  if (!ready) return <div className="p-6">Učitavanje…</div>

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Reset lozinke</h2>
      {email && <p className="text-sm opacity-70">Nalog: <b>{email}</b></p>}
      <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Nova lozinka (min 8)" value={pwd} onChange={e=>setPwd(e.target.value)} />
      <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Ponovi lozinku" value={pwd2} onChange={e=>setPwd2(e.target.value)} />
      <button onClick={setPassword} disabled={loading} className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50">
        {loading ? 'Snima…' : 'Sačuvaj lozinku'}
      </button>
    </div>
  )
}
