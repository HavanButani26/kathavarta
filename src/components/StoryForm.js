'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen } from 'lucide-react'

const genres = [
    'general', 'romance', 'thriller', 'horror',
    'comedy', 'poetry', 'biography', 'fantasy', 'spiritual'
]
const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
]

export default function StoryForm({ locale, userId }) {
    const router = useRouter()
    const supabase = createClient()

    const [form, setForm] = useState({
        title: '',
        description: '',
        language: locale,
        genre: 'general',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('stories')
            .insert({
                title: form.title,
                description: form.description,
                language: form.language,
                genre: form.genre,
                author_id: userId,
                status: 'draft',
            })
            .select()
            .single()

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push(`/${locale}/write/${data.id}`)
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</div>
            )}

            {/* Title */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Story Title *</label>
                <input
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter your story title"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Short description of your story..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
            </div>

            {/* Language */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                    {languages.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                </select>
            </div>

            {/* Genre */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Genre</label>
                <select
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                    {genres.map(g => (
                        <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <BookOpen size={15} />
                )}
                {loading ? 'Creating...' : 'Create Story'}
            </button>
        </form>
    )
}