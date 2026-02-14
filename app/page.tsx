'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen' // Ensure this path is correct!

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setIsChecking(false)
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async () => {
    setIsRedirecting(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  // 🔄 Show Loading Screen during initial check OR during OAuth redirect
  if (isChecking || isRedirecting) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-[#030303] flex items-center justify-center p-6 overflow-hidden relative">
      
      {/* 🌌 ANIMATED BACKGROUND DECOR */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      {/* 📦 LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
          
          {/* Logo / Icon */}
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mb-8 flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            SmartMark
          </h1>
          <p className="text-slate-400 mb-10 text-lg leading-relaxed">
            Organize your digital world with AI-powered bookmarks.
          </p>

          <button
            onClick={handleLogin}
            className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span>Continue with Google</span>
            
            <div className="absolute inset-0 rounded-2xl group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-shadow pointer-events-none" />
          </button>

          <p className="mt-8 text-center text-xs text-slate-500 font-medium uppercase tracking-widest">
            Secure via Supabase Auth
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm italic">
            "The best way to predict the future is to bookmark it."
          </p>
        </div>
      </div>
    </main>
  )
}