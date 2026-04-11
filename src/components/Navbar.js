'use client'

import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, PenSquare, Library, LogIn, Menu, X, Globe } from 'lucide-react'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ user, locale }) {
    const t = useTranslations('nav')
    const router = useRouter()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [langOpen, setLangOpen] = useState(false)

    const languages = [
        { code: 'en', label: 'English', script: 'A' },
        { code: 'hi', label: 'हिन्दी', script: 'क' },
        { code: 'gu', label: 'ગુજરાતી', script: 'ક' },
    ]

    const currentLang = languages.find(l => l.code === locale) || languages[0]

    function switchLocale(newLocale) {
        // Replace the locale segment in the current path
        const segments = pathname.split('/')
        segments[1] = newLocale
        router.push(segments.join('/'))
        setLangOpen(false)
    }

    const navLinks = [
        { href: `/${locale}`, label: t('home') },
        { href: `/${locale}/browse`, label: t('browse') },
        { href: `/${locale}/write`, label: t('write') },
        { href: `/${locale}/library`, label: t('library') },
    ]

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800">Kathavarta</span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* Language switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <Globe size={14} />
                            <span className="font-medium">{currentLang.script}</span>
                        </button>

                        {langOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setLangOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden w-40 z-50">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => switchLocale(lang.code)}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${locale === lang.code
                                                ? 'text-teal-600 font-semibold bg-teal-50'
                                                : 'text-gray-700'
                                                }`}
                                        >
                                            <span className="w-5 text-center font-semibold text-base">
                                                {lang.script}
                                            </span>
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Auth */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/${locale}/profile`}
                                className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-medium text-sm"
                            >
                                {user.email?.charAt(0).toUpperCase()}
                            </Link>
                            <LogoutButton locale={locale} />
                        </div>
                    ) : (
                        <Link
                            href={`/${locale}/login`}
                            className="flex items-center gap-1.5 bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            <LogIn size={14} />
                            {t('login')}
                        </Link>
                    )}

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-600"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm text-gray-700 hover:text-teal-600 py-2.5 border-b border-gray-50 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    )
}

function LogoutButton({ locale }) {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push(`/${locale}`)
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-2 py-1.5"
        >
            <LogOut size={14} />
        </button>
    )
}