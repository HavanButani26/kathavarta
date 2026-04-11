'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), [])
    if (!mounted) return (
        <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700" />
    )

    const options = [
        { key: 'light', icon: <Sun size={15} />, label: 'Light' },
        { key: 'dark', icon: <Moon size={15} />, label: 'Dark' },
        { key: 'system', icon: <Monitor size={15} />, label: 'System' },
    ]

    const current = options.find(o => o.key === theme) || options[2]

    return (
        <div className="relative group">
            <button
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={`Theme: ${current.label}`}
            >
                {current.icon}
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden w-32 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                {options.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${theme === opt.key
                                ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}