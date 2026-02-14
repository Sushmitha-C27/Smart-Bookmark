import { supabase } from '@/lib/supabaseClient'

export type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
  description?: string
  image_url?: string
}

export const bookmarkService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Bookmark[]
  },

  async add(url: string, title: string, userId: string) {
    // 1. Fetch metadata from our internal API
    const res = await fetch('/api/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    const metadata = await res.json()

    // 2. Insert into Supabase
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ 
        url, 
        title: title || metadata.title || 'Untitled', 
        user_id: userId,
        description: metadata.description || '',
        image_url: metadata.image || ''
      }])
      .select()
    
    if (error) throw error
    return data[0] as Bookmark
  },

  async delete(id: string) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) throw error
  }
}