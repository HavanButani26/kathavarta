'use client'

import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    BookOpen, PenSquare, Library, LogIn,
    Menu, X, Globe, LogOut, User
} from 'lucide-react'
import { useState } from 'react'
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
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Kathavarta</span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* Language switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-teal-600 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <Globe size={14} />
                            <span className="font-medium">{currentLang.script}</span>
                        </button>

                        {langOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden w-40 z-50">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => switchLocale(lang.code)}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${locale === lang.code
                                                    ? 'text-teal-600 font-semibold bg-teal-50 dark:bg-teal-900/30'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <span className="w-5 text-center font-semibold text-base">{lang.script}</span>
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Auth */}
                    {user ? (
                        <ProfileDropdown user={user} locale={locale} />
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
                        className="md:hidden text-gray-600 dark:text-gray-300 ml-1"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex flex-col gap-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 py-2.5 border-b border-gray-50 dark:border-gray-800 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    )
}

function ProfileDropdown({ user, locale }) {
    const router = useRouter()
    const supabase = createClient()
    const [open, setOpen] = useState(false)

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push(`/${locale}`)
        router.refresh()
        setOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-400 font-semibold text-sm hover:ring-2 hover:ring-teal-400 transition-all"
            >
                {user.email?.charAt(0).toUpperCase()}
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">

                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Signed in</p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                            <Link
                                href={`/${locale}/profile`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <User size={14} className="text-gray-400" />
                                My Profile
                            </Link>
                            <Link
                                href={`/${locale}/write`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <PenSquare size={14} className="text-gray-400" />
                                My Stories
                            </Link>
                            <Link
                                href={`/${locale}/library`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Library size={14} className="text-gray-400" />
                                My Library
                            </Link>
                        </div>

                        {/* Sign out */}
                        <div className="border-t border-gray-50 dark:border-gray-700 py-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}