import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Account() {
  const [session, setSession] = useState<any>(null)
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h2 className="text-xl font-semibold">Nalog</h2>
        <p>Nisi prijavljen. <button className="underline" onClick={() => nav('/login')}>Prijavi se</button> ili <button className="underline" onClick={() => nav('/admin')}>magic link</button>.</p>
      </div>
    )
  }

  const setPassword = async () => {
    if (!pwd || pwd.length < 8) return alert('Lozinka min 8 karaktera.')
    if (pwd !== pwd2) return alert('Lozinke se ne poklapaju.')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pwd })
    setLoading(false)
    if (error) alert(error.message)
    else { alert('Lozinka postavljena.'); nav('/admin') }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Postavi/Promeni lozinku</h2>
      <p className="text-sm opacity-70">Prijavljen: <b>{session.user.email}</b></p>
      <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Nova lozinka (min 8)" value={pwd} onChange={e=>setPwd(e.target.value)} />
      <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Ponovi lozinku" value={pwd2} onChange={e=>setPwd2(e.target.value)} />
      <button onClick={setPassword} disabled={loading} className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50">
        {loading ? 'Snima…' : 'Sačuvaj lozinku'}
      </button>
    </div>
  )
}
