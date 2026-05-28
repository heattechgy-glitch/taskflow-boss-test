import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isResetMode, setIsResetMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/dashboard')
      }
    }
    checkUser()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setMessage('Password reset link sent to your email!')
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to sign in with GitHub')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <svg
              className="w-10 h-10 text-[#3b82f6]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span className="text-2xl font-bold text-white">TaskFlow</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {isResetMode ? 'Reset your password' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {isResetMode ? (
            <>
              Remember your password?{' '}
              <button
                onClick={() => {
                  setIsResetMode(false)
                  setError(null)
                  setMessage(null)
                }}
                className="font-medium text-[#3b82f6] hover:text-blue-400 transition-colors"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#3b82f6] hover:text-blue-400 transition-colors"
              >
                Sign up for free
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/50 border border-red-700">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-md bg-green-900/50 border border-green-700">
              <p className="text-sm text-green-300">{message}</p>
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={isResetMode ? handlePasswordReset : handleLogin}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 bg-slate-700 text-white focus:outline-none focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {!isResetMode && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 bg-slate-700 text-white focus:outline-none focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {!isResetMode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6] border-slate-600 rounded bg-slate-700"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true)
                      setError(null)
                    }}
                    className="font-medium text-[#3b82f6] hover:text-blue-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3b82f6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : isResetMode ? (
                  'Send reset link'
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {!isResetMode && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogle