import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const signUp = async () => {
    if (!email || !password) return alert('Unesi email i lozinku.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return alert(error.message)
    alert('Proveri email da potvrdiš nalog.')
    nav('/login')
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Registracija</h2>
      <input className="border rounded-xl px-3 py-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Lozinka (min 8)" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={signUp} disabled={loading} className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50">
        {loading ? 'Kreiram…' : 'Registruj se'}
      </button>
      <div className="text-sm opacity-80">Već imaš nalog? <Link className="underline" to="/login">Prijava</Link></div>
    </div>
  )
}
