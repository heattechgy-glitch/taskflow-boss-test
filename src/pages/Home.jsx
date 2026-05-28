import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xl font-bold">TaskFlow</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      navigate('/')
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/20 via-transparent to-purple-600/10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#3b82f6]/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                <span className="block">Organize Your Tasks</span>
                <span className="block text-[#3b82f6]">Like Never Before</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-10">
                TaskFlow brings the power of kanban boards to your fingertips. 
                Visualize your workflow, track progress, and boost productivity with our intuitive task management system.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#3b82f6]/25"
                >
                  {user ? 'Go to Dashboard' : 'Start Free Today'}
                </button>
                <Link
                  to="/features"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need to Stay Organized
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Powerful features designed to help you manage tasks efficiently and collaborate seamlessly.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-[#3b82f6]/50 transition-all group">
                <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/30 transition-colors">
                  <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Kanban Board</h3>
                <p className="text-slate-400">
                  Visualize your workflow with drag-and-drop columns. Move tasks through stages effortlessly.
                </p>
              </div>

              <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-[#3b82f6]/50 transition-all group">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Task Tracking</h3>
                <p className="text-slate-400">
                  Track task status, set priorities, and never miss a deadline with built-in reminders.
                </p>
              </div>

              <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-[#3b82f6]/50 transition-all group">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-slate-400">