'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Settings, Globe, FileText } from 'lucide-react'

export default function StorySettings({ story, locale }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    async function togglePublish() {
        setLoading(true)
        const newStatus = story.status === 'published' ? 'draft' : 'published'
        const { error } = await supabase
            .from('stories')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', story.id)

        if (!error) {
            setMsg(newStatus === 'published' ? '✓ Story published!' : '✓ Moved to draft')
            setTimeout(() => setMsg(''), 3000)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
                <Settings size={15} className="text-teal-600" />
                Story Settings
            </h2>

            <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Status</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${story.status === 'published'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {story.status}
                    </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Language</span>
                    <span className="text-gray-700 font-medium">{story.language.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Genre</span>
                    <span className="text-gray-700 capitalize">{story.genre}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Reads</span>
                    <span className="text-gray-700">{story.total_reads}</span>
                </div>
            </div>

            {msg && (
                <div className="mt-3 text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2">{msg}</div>
            )}

            <button
                onClick={togglePublish}
                disabled={loading}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${story.status === 'published'
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
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