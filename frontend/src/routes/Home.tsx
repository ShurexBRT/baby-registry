import { useEffect, useState } from 'react'
import { useItems, useReserveItem, usePurchaseItem } from '../lib/queries'

type StatusFilter = 'all' | 'available' | 'reserved' | 'purchased'

export default function Home() {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [q, setQ] = useState('')
  const [name, setName] = useState('')       // 👈 obavezno
  const [note, setNote] = useState('')       // 👈 opciono

  const { data, isLoading, error } = useItems({ status, q })
  const reserve = useReserveItem()
  const purchase = usePurchaseItem()

  // posle uspešne akcije očistimo komentar (ime ostavljamo zbog brzine)
  useEffect(() => {
    if (reserve.isSuccess || purchase.isSuccess) setNote('')
  }, [reserve.isSuccess, purchase.isSuccess])

  const mustHaveName = (cb: () => void) => {
    if (!name.trim()) { alert('Unesite ime (obavezno)'); return }
    cb()
  }

  if (isLoading) return <div className="p-4">Učitavanje…</div>
  if (error) return <div className="p-4">Greška: {(error as Error).message}</div>

  return (
    <div className="space-y-4">
      {/* Pretraga + filter */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input
          className="border rounded-xl px-3 py-2 grow"
          placeholder="Pretraga po nazivu…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-xl px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="all">Sve</option>
          <option value="available">Slobodno</option>
          <option value="reserved">Rezervisano</option>
          <option value="purchased">Kupljeno</option>
        </select>
        
      </div>

      {/* Ime + komentar */}
      <div className="flex flex-col gap-2">
        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Vaše ime (obavezno)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="border rounded-xl px-3 py-2 min-h-[72px]"
          placeholder="Komentar / napomena (opciono)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Lista stavki */}
      <ul className="grid gap-3">
  {data!.map((item) => (
    <li key={item.id} className="rounded-2xl border p-4 flex items-start justify-between">
      <div>
        <div className="font-semibold">{item.title}</div>
        <div className="text-sm opacity-70">
          {item.category} • {item.quantity} {item.unit ?? 'kom'}
        </div>
        {item.store_link && (
          <a className="text-sm underline" href={item.store_link} target="_blank" rel="noreferrer">
            Prodavnica
          </a>
        )}
        <div className="text-xs mt-1">
          <span className={
              item.status === 'available' ? 'text-emerald-600'
            : item.status === 'reserved' ? 'text-amber-600'
            : 'text-zinc-500'
          }>
            Status: {item.status}
          </span>
          {item.reserved_by && <span className="ml-2 opacity-70">• Rezervisao: {item.reserved_by}</span>}
          {item.purchased_by && <span className="ml-2 opacity-70">• Kupio: {item.purchased_by}</span>}
        </div>

        {/* 👇 NOVO: prikaži komentar kad postoji */}
        {(item.status === 'reserved' || item.status === 'purchased') && item.reserved_note && (
          <div className="mt-2 text-sm italic text-slate-600">
            “{item.reserved_note}”
            {item.reserved_by && (
              <span className="not-italic opacity-70"> — {item.reserved_by}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {item.status === 'available' && (
          <button
            onClick={() => mustHaveName(() => reserve.mutate({ id: item.id, name, note }))}
            disabled={reserve.isPending || purchase.isPending}
            className="px-3 py-2 rounded-xl bg-amber-500 text-white text-sm disabled:opacity-50"
          >
            Rezerviši
          </button>
        )}
        {item.status !== 'purchased' && (
          <button
            onClick={() => mustHaveName(() => purchase.mutate({ id: item.id, name, note }))}
            disabled={purchase.isPending || reserve.isPending}
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm disabled:opacity-50"
          >
            Kupljeno
          </button>
        )}
      </div>
    </li>
  ))}
</ul>

    </div>
  )
}
