'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { BookOpen, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const t = useTranslations()
    const router = useRouter()
    const { locale } = useParams()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push(`/${locale}`)
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Top bar */}
            <div className="bg-white border-b border-gray-100 px-4 py-4">
                <Link href={`/${locale}`} className="flex items-center gap-2 w-fit">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800">Kathavarta</span>
                </Link>
            </div>

            {/* Card */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <LogIn size={26} className="text-teal-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{t('auth.login')}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {t('auth.no_account')}{' '}
                            <Link href={`/${locale}/signup`} className="text-teal-600 hover:text-teal-700 font-medium">
                                {t('auth.signup')}
                            </Link>
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                        {/* Error */}
                        {error && (
                            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="flex flex-col gap-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t('auth.email')}
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('auth.password')}
                                    </label>
                                    <Link
                                        href={`/${locale}/forgot-password`}
                                        className="text-xs text-teal-600 hover:text-teal-700"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={16} />
                                        {t('auth.login')}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-xs text-gray-400">or continue with</span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        {/* Google login */}
                        <GoogleButton locale={locale} supabase={supabase} />
                    </div>

                    {/* Language links */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
                        <Link href="/en/login" className="hover:text-teal-600">English</Link>
                        <span>·</span>
                        <Link href="/hi/login" className="hover:text-teal-600">हिन्दी</Link>
                        <span>·</span>
                        <Link href="/gu/login" className="hover:text-teal-600">ગુજરાતી</Link>
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
                redirectTo: `${window.location.origin}/${locale}/auth/callback`
            }
        })
    }

    return (
        <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
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