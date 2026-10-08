import { useState } from 'react'
import { login, register } from './services/api'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'register') {
        await register(
          name.trim(),
          email.trim(),
          password
        )

        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setError('')

        alert('Registration successful! Please login.')
      } else {
        const response = await login(
          email.trim(),
          password
        )

        if (response.token) {
          localStorage.setItem('token', response.token)
        }

        if (response.user) {
          localStorage.setItem(
            'user',
            JSON.stringify(response.user)
          )
        }

        onLogin(response.user)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

          {/* Logo */}

          <div className="text-center mb-8">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center">

              <span className="text-2xl">
                🎓
              </span>

            </div>

            <h1 className="mt-4 text-2xl font-bold text-white">
              AI Student Productivity
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              {mode === 'login'
                ? 'Welcome back! Sign in to continue.'
                : 'Create your student productivity account.'}
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}

            {mode === 'register' && (

              <div>

                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

              </div>

            )}

            {/* Email */}

            <div>

              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

            </div>

            {/* Password */}

            <div>

              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

            </div>

            {/* Confirm Password */}

            {mode === 'register' && (

              <div>

                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

              </div>

            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login'
                  : 'Create Account'}
            </button>

          </form>

          {/* Switch Login / Register */}

          <div className="mt-6 text-center text-sm text-slate-400">

            {mode === 'login' ? (

              <>
                Don't have an account?{' '}

                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Register
                </button>
              </>

            ) : (

              <>
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Login
                </button>
              </>

            )}

          </div>

        </div>

      </div>

    </div>
  )
}