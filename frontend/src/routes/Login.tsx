import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"

  const loginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setMsg(error.message)
      return
    }
    // uspešno → vodi na admin
    window.location.href = `${import.meta.env.BASE_URL}admin`
  }

  const sendMagicLink = async () => {
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin`
      }
    })
    setLoading(false)
    setMsg(error ? error.message : 'Poslali smo ti link na email.')
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin prijava</h1>

      <form onSubmit={loginWithPassword} className="space-y-3">
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="Email"
          className={inputCls}
        />

        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Lozinka"
            className={inputCls + ' pr-12'}
          />
          <button
            type="button"
            onClick={()=>setShowPwd(s=>!s)}
            className="absolute inset-y-0 right-2 my-auto rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-100"
            aria-label={showPwd ? 'Sakrij lozinku' : 'Prikaži lozinku'}
          >
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Prijavljujem…' : 'Prijava'}
        </button>
      </form>

      <div className="my-4 text-center text-slate-500">— ili —</div>

      <button
        disabled={!email || loading}
        onClick={sendMagicLink}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
      >
        Pošalji magic link
      </button>

      {msg && <p className="mt-3 text-center text-sm text-slate-600">{msg}</p>}
    </div>
  )
}
