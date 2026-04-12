'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Settings, Globe, FileText, ImageIcon, X } from 'lucide-react'

export default function StorySettings({ story, locale }) {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [msg, setMsg] = useState('')
    const [cover, setCover] = useState(story.cover_url || '')

    async function uploadCover(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)

        const ext = file.name.split('.').pop()
        const path = `covers/${story.id}.${ext}`

        const { data: { user } } = await supabase.auth.getUser()
        console.log(user)

        // 1️⃣ Upload file
        const { error } = await supabase.storage
            .from('story-images')
            .upload(path, file, { upsert: true })

        if (!error) {
            // 2️⃣ Get public URL using same path
            const { data } = supabase.storage
                .from('story-images')
                .getPublicUrl(path)

            const url = data.publicUrl

            // 3️⃣ Save URL to database
            await supabase
                .from('stories')
                .update({ cover_url: url })
                .eq('id', story.id)

            setCover(url)
            setMsg('✓ Cover updated!')
            setTimeout(() => setMsg(''), 3000)
            router.refresh()
        }

        setUploading(false)
    }

    async function removeCover() {
        await supabase.from('stories').update({ cover_url: null }).eq('id', story.id)
        setCover('')
        router.refresh()
    }

    async function togglePublish() {
        setLoading(true)
        const newStatus = story.status === 'published' ? 'draft' : 'published'
        await supabase
            .from('stories')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', story.id)
        setMsg(newStatus === 'published' ? '✓ Story published!' : '✓ Moved to draft')
        setTimeout(() => setMsg(''), 3000)
        router.refresh()
        setLoading(false)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-4 flex items-center gap-1.5">
                <Settings size={15} className="text-teal-600" />
                Story Settings
            </h2>

            {/* Cover image */}
            <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Cover Image
                </label>
                {cover ? (
                    <div className="relative rounded-xl overflow-hidden">
                        <img src={cover} alt="Cover" className="w-full h-32 object-cover rounded-xl" />
                        <button
                            onClick={removeCover}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-teal-400 transition-colors text-xs text-gray-400 dark:text-gray-500">
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                <ImageIcon size={20} className="text-gray-300" />
                                Upload Cover Image
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={uploadCover}
                        />
                    </label>
                )}
            </div>

            {/* Story info rows */}
            <div className="flex flex-col gap-2 text-sm mb-4">
                {[
                    {
                        label: 'Status',
                        value: (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${story.status === 'published'
                                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                                : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700'
                                }`}>
                                {story.status}
                            </span>
                        )
                    },
                    { label: 'Language', value: <span className="text-gray-700 dark:text-gray-300 font-medium">{story.language.toUpperCase()}</span> },
                    { label: 'Genre', value: <span className="text-gray-700 dark:text-gray-300 capitalize">{story.genre}</span> },
                    { label: 'Reads', value: <span className="text-gray-700 dark:text-gray-300">{story.total_reads}</span> },
                ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                        {row.value}
                    </div>
                ))}
            </div>

            {msg && (
                <div className="text-xs text-teal-600 bg-teal-50 dark:bg-teal-900/30 rounded-lg px-3 py-2 mb-3">
                    {msg}
                </div>
            )}

            <button
                onClick={togglePublish}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${story.status === 'published'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : story.status === 'published' ? (
                    <><FileText size={14} /> Move to Draft</>
                ) : (
                    <><Globe size={14} /> Publish Story</>
                )}
            </button>
        </div>
    )
}