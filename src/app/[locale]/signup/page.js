'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { BookOpen, Mail, Lock, User, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
    const t = useTranslations()
    const router = useRouter()
    const { locale } = useParams()
    const supabase = createClient()

    const [form, setForm] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSignup(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Client-side validation
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            setLoading(false)
            return
        }

        if (form.username.length < 3) {
            setError('Username must be at least 3 characters.')
            setLoading(false)
            return
        }

        if (!/^[a-z0-9_]+$/.test(form.username)) {
            setError('Username can only contain lowercase letters, numbers and underscores.')
            setLoading(false)
            return
        }

        // Check username uniqueness before signup
        const { data: existingUsername } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', form.username.toLowerCase())
            .single()

        if (existingUsername) {
            setError('This username is already taken. Please choose another.')
            setLoading(false)
            return
        }

        // Create account
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    full_name: form.fullName,
                    username: form.username.toLowerCase(),
                },
                emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
            },
        })

        if (error) {
            // Friendly error messages
            if (
                error.message.includes('already registered') ||
                error.message.includes('already been registered') ||
                error.message.includes('User already registered')
            ) {
                setError('An account with this email already exists. Please login instead.')
            } else {
                setError(error.message)
            }
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
                <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
                    <Link href={`/${locale}`} className="flex items-center gap-2 w-fit">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Kathavarta</span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={32} className="text-teal-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Check your email!</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            We sent a confirmation link to <strong>{form.email}</strong>.
                            Click it to activate your account.
                        </p>
                        <Link
                            href={`/${locale}/login`}
                            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors text-sm"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

            {/* Top bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
                <Link href={`/${locale}`} className="flex items-center gap-2 w-fit">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Kathavarta</span>
                </Link>
            </div>

            {/* Card */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserPlus size={26} className="text-teal-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('auth.signup')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {t('auth.have_account')}{' '}
                            <Link href={`/${locale}/login`} className="text-teal-600 hover:text-teal-700 font-medium">
                                {t('auth.login')}
                            </Link>
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">

                        {error && (
                            <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="flex flex-col gap-4">

                            {/* Full name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('auth.full_name')}
                                </label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('auth.username')}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="yourname"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers and underscores only</p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('auth.email')}
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('auth.password')}
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Password strength */}
                                {form.password && (
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= i * 3
                                                        ? i <= 1 ? 'bg-red-400'
                                                            : i <= 2 ? 'bg-yellow-400'
                                                                : i <= 3 ? 'bg-teal-400'
                                                                    : 'bg-teal-600'
                                                        : 'bg-gray-100 dark:bg-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        {t('auth.signup')}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400">or</span>
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                        </div>

                        {/* Google */}
                        <GoogleButton locale={locale} supabase={supabase} />
                    </div>

                    {/* Language links */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
                        <Link href="/en/signup" className="hover:text-teal-600">English</Link>
                        <span>·</span>
                        <Link href="/hi/signup" className="hover:text-teal-600">हिन्दी</Link>
                        <span>·</span>
                        <Link href="/gu/signup" className="hover:text-teal-600">ગુજરાતી</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function GoogleButton({ locale, supabase }) {
    const [loading, setLoading] = useState(false)

    async function handleGoogle() {
        setLoading(true)
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/${locale}/auth/callback`,
            },
        })
    }

    return (
        <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                </svg>
            )}
            Continue with Google
        </button>
    )
}