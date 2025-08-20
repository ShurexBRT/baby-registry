import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useItems, useCreateItem, useDeleteItem } from '../lib/queries'

const CATEGORIES = [
  'General',
  'Odeća',
  'Ishrana',
  'Higijena',
  'Kupanje',
  'Šetnja',
  'Spavanje',
  'Soba',
  'Zdravlje',
  'Igračke',
  'Pelene & presvlačenje',
  'Dojenje & flašice',
  'Kupovina/market',
] as const;


export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')        
  const [session, setSession] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const { data } = useItems({ status: 'all', q: '' })
  const createItem = useCreateItem()
  const deleteItem = useDeleteItem()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const sub = supabase.auth.onAuthStateChange((_e, s) => setSession(s)).data
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const check = async () => {
      if (!session) { setIsAdmin(false); return }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
      setIsAdmin(!error && data?.role === 'admin')
    }
    check()
  }, [session])

  // --- LOGIN HANDLERS ---

  const signInWithPassword = async () => {
    if (!email || !password) { alert('Unesi email i lozinku.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) alert(error.message)
  }

  const sendOtp = async () => {
    if (!email) { alert('Unesi email.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin` }
    })
    setLoading(false)
    if (error) alert(error.message)
    else alert('Proveri email za magic link / OTP.')
  }

  if (!session) {
    // Login ekran: email + password, ispod magic link
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h2 className="text-xl font-semibold">Admin prijava</h2>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={signInWithPassword}
          disabled={loading}
          className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50 w-full"
        >
          {loading ? 'Prijavljujem…' : 'Prijavi se'}
        </button>

        <div className="text-center text-sm opacity-70">— ili —</div>

        <button
          onClick={sendOtp}
          disabled={loading}
          className="px-3 py-2 rounded-xl border w-full"
        >
          Pošalji magic link
        </button>
      </div>
    )
  }

  if (isAdmin === null) return <div className="p-6">Učitavanje…</div>
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <div>Prijavljen si kao <b>{session.user.email}</b>, ali nemaš admin prava.</div>
        <button onClick={() => supabase.auth.signOut()} className="underline">Odjavi se</button>
      </div>
    )
  }

  // --- ADMIN PANEL ---
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin panel</h2>
            </div>

      <AddForm onCreate={(payload) => createItem.mutate(payload)} />

      <ul className="grid gap-3">
        {data?.map(item => (
          <li key={item.id} className="rounded-2xl border p-4 flex items-start justify-between">
            <div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm opacity-70">{item.category} • {item.quantity} {item.unit ?? 'kom'}</div>
            </div>
            <button
              onClick={() => { if (confirm('Sigurno?')) deleteItem.mutate(item.id) }}
              className="px-3 py-2 rounded-xl border"
            >
              Obriši
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AddForm({ onCreate }: { onCreate: (p:any)=>void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('kom')
  const [price, setPrice] = useState<number | ''>('')
  const [store, setStore] = useState('')
  const [priority, setPriority] = useState<'high'|'med'|'low'>('med')

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="font-medium">Dodaj stavku</div>
      <div className="grid sm:grid-cols-2 gap-2">
        <input className="border rounded-xl px-3 py-2" placeholder="Naziv *" value={title} onChange={e=>setTitle(e.target.value)} />
        <select
  className="border rounded-xl px-3 py-2"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  {CATEGORIES.map((c) => (
    <option key={c} value={c}>{c}</option>
  ))}
</select>

        <input type="number" className="border rounded-xl px-3 py-2" placeholder="Količina" value={quantity} onChange={e=>setQuantity(parseInt(e.target.value||'1'))} />
        <input className="border rounded-xl px-3 py-2" placeholder="Jedinica" value={unit} onChange={e=>setUnit(e.target.value)} />
        <input type="number" step="0.01" className="border rounded-xl px-3 py-2" placeholder="Cena (EUR)" value={price} onChange={e=>setPrice(e.target.value===''?'':parseFloat(e.target.value))} />
        <input className="border rounded-xl px-3 py-2" placeholder="Link ka prodavnici" value={store} onChange={e=>setStore(e.target.value)} />
        <select className="border rounded-xl px-3 py-2" value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option value="high">High</option>
          <option value="med">Med</option>
          <option value="low">Low</option>
        </select>
      </div>
      <button
        onClick={() => {
          if (!title.trim()) { alert('Naziv je obavezan'); return }
          onCreate({
            title,
            category,
            quantity,
            unit,
            price_estimate: (price===''?null:price),
            store_link: store,
            priority
          })
          setTitle(''); setStore(''); setPrice(''); setQuantity(1); setUnit('kom'); setCategory('General'); setPriority('med')
        }}
        className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
      >
        Sačuvaj
      </button>
    </div>
  )
}
