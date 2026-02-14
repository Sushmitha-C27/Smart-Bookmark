'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { bookmarkService, Bookmark } from '@/services/bookmarks'
import { toast, Toaster } from 'sonner'
import LoadingScreen from '@/components/LoadingScreen'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/')

      setUser(session.user)
      
      try {
        const initialData = await bookmarkService.fetchAll()
        setBookmarks(initialData)
        channel = await setupRealtime(session.user)
      } catch (err) {
        toast.error('Failed to load library')
      }
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [router])

  const setupRealtime = async (currentUser: any) => {
    const sessionTag = Math.random().toString(36).substring(7)
    
    const channel = supabase
      .channel(`live-sync-${currentUser.id}-${sessionTag}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks', 
        filter: `user_id=eq.${currentUser.id}` 
      }, 
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookmarks((prev) => [payload.new as Bookmark, ...prev.filter(b => b.id !== payload.new.id)])
        }
        if (payload.eventType === 'DELETE') {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      })
      .subscribe((status) => setIsConnected(status === 'SUBSCRIBED'))
    
    return channel
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    // 🛡️ Final Check: Ensure title is provided
    if (!url.trim() || !title.trim()) {
      toast.error('Please enter both a title and a link')
      return
    }
    
    setIsLoading(true)
    const toastId = toast.loading('Saving to library...')
    
    try {
      await bookmarkService.add(url, title, user.id)
      toast.success('Bookmark saved', { id: toastId })
      setTitle('')
      setUrl('')
    } catch (err) {
      toast.error('Save failed', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this bookmark?")) return

    try {
      await bookmarkService.delete(id)
      toast.success('Removed')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  if (!user) return <LoadingScreen />

  return (
    <main className="min-h-screen bg-[#F8F9FB] text-[#1A1C1E] pb-20 font-sans selection:bg-blue-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black tracking-tighter italic uppercase">SMARTMARK.</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                {isConnected ? 'Real-time' : 'Syncing'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))} 
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-20">
        
        {/* Modern Input Bar */}
        <section className="mb-20 md:mb-28">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleAdd} className="bg-white p-2 md:p-3 rounded-[2rem] shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row gap-2 transition-all focus-within:ring-4 focus-within:ring-blue-50">
              <input 
                type="text" 
                required 
                placeholder="Bookmark Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="flex-1 bg-transparent px-6 py-3 md:py-4 outline-none text-sm font-semibold placeholder:text-slate-300" 
              />
              <div className="hidden md:block w-px h-6 bg-slate-100 self-center" />
              <input 
                type="url" 
                required 
                placeholder="https://..." 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="flex-[2] bg-transparent px-6 py-3 md:py-4 outline-none text-sm font-semibold placeholder:text-slate-300" 
              />
              <button 
                disabled={isLoading} 
                className="bg-[#1A1C1E] text-white px-8 md:px-12 py-4 rounded-[1.5rem] md:rounded-[1.8rem] font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {isLoading ? '...' : 'Save'}
              </button>
            </form>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {bookmarks.map((b) => (
            <div key={b.id} className="group bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
              
              {/* Domain Pill */}
              <div className="mb-8 self-start px-4 py-2 bg-[#F8F9FB] rounded-2xl border border-slate-50 flex items-center gap-3">
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=64`} 
                  className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" 
                  alt="" 
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                  {new URL(b.url).hostname.replace('www.', '')}
                </span>
              </div>

              {/* Title Section (Optimized Font Size) */}
              <div className="flex-1 mb-10">
                <h4 className="text-xl md:text-2xl font-extrabold text-[#1A1C1E] leading-tight tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {b.title}
                </h4>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-auto">
                <a 
                  href={b.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-[4] py-4 md:py-5 bg-[#F8F9FB] text-[#1A1C1E] font-bold text-[10px] rounded-2xl md:rounded-[2rem] flex items-center justify-center gap-2 hover:bg-[#1A1C1E] hover:text-white transition-all duration-300 uppercase tracking-widest"
                >
                  Visit Source
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                </a>
                
                <button 
                  onClick={() => handleDelete(b.id)}
                  className="flex-1 py-4 md:py-5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl md:rounded-[2rem] transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Empty State */}
        {bookmarks.length === 0 && !isLoading && (
          <div className="mt-20 text-center py-32 opacity-10">
            <p className="font-black text-6xl tracking-tighter italic uppercase">Library</p>
          </div>
        )}
      </div>
    </main>
  )
}