import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabaseClient'

export type Item = {
  id: string
  title: string
  category: string
  description?: string
  quantity: number
  unit?: string
  price_estimate?: number
  store_link?: string
  image_url?: string
  priority: 'high' | 'med' | 'low'
  status: 'available' | 'reserved' | 'purchased'
  reserved_by?: string
  reserved_at?: string
  purchased_by?: string
  purchased_at?: string
  updated_at?: string
}

export function useItems(params: { status: 'all' | 'available' | 'reserved' | 'purchased'; q: string }) {
  const { status, q } = params
  return useQuery({
    queryKey: ['items', status, q],
    queryFn: async () => {
      let qb = supabase.from('items').select('*')
      if (status !== 'all') qb = qb.eq('status', status)
      if (q.trim()) qb = qb.ilike('title', `%${q.trim()}%`)
      qb = qb.order('priority', { ascending: true }).order('updated_at', { ascending: false })
      const { data, error } = await qb
      if (error) throw error
      return data as Item[]
    },
    staleTime: 30_000,
  })
}

export function useReserveItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, note }: { id: string; name: string; note?: string }) => {
      const { data, error } = await supabase.rpc('reserve_item', {
        p_item: id,
        p_name: name,
        p_note: note ?? null, // snimamo komentar u audit_log.details
      })
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function usePurchaseItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, note }: { id: string; name: string; note?: string }) => {
      const { data, error } = await supabase.rpc('purchase_item', {
        p_item: id,
        p_name: name,
        p_note: note ?? null, // snimamo komentar u audit_log.details
      })
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}

/** Admin: create/delete (RLS dozvoljava samo adminima iz `profiles`) */
export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Item>) => {
      const { error } = await supabase.from('items').insert({
        title: payload.title,
        category: payload.category ?? 'General',
        description: payload.description ?? null,
        quantity: payload.quantity ?? 1,
        unit: payload.unit ?? 'kom',
        price_estimate: payload.price_estimate ?? null,
        store_link: payload.store_link ?? null,
        image_url: payload.image_url ?? null,
        priority: payload.priority ?? 'med',
        status: 'available',
      } as any)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}
