export default function LoadingScreen() {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Logo */}
          <div className="w-12 h-12 bg-white rounded-xl mb-6 flex items-center justify-center animate-bounce shadow-2xl">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-pulse" style={{ width: '60%' }} />
          </div>
          
          <p className="mt-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            Verifying Session
          </p>
        </div>
      </div>
    )
  }