'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle } from 'lucide-react'

export default function ProfileForm({ profile, userId, locale }) {
    const router = useRouter()
    const supabase = createClient()

    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        language: profile?.language || 'en',
    })
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (form.username.length < 3) {
            setError('Username must be at least 3 characters')
            setLoading(false)
            return
        }

        if (!/^[a-z0-9_]+$/.test(form.username)) {
            setError('Username: lowercase letters, numbers and underscores only')
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: form.full_name,
                username: form.username.toLowerCase(),
                bio: form.bio,
                language: form.language,
            })
            .eq('id', userId)

        if (error) {
            setError(error.message)
        } else {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
            router.refresh()
        }
        setLoading(false)
    }

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'gu', label: 'ગુજરાતી' },
    ]

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="yourname"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell readers about yourself..."
                    rows={4}
                    maxLength={300}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Language</label>
                <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                    {languages.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-60"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                    <><CheckCircle size={15} /> Saved!</>
                ) : (
                    <><Save size={15} /> Save Changes</>
                )}
            </button>
        </form>
    )
}