'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function StoryActions({ storyId, userId, locale, initialLiked, initialSaved, initialLikes }) {
    const router = useRouter()
    const supabase = createClient()

    const [liked, setLiked] = useState(initialLiked)
    const [saved, setSaved] = useState(initialSaved)
    const [likes, setLikes] = useState(initialLikes)
    const [likeLoading, setLikeLoading] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)

    async function toggleLike() {
        if (!userId) {
            router.push(`/${locale}/login`)
            return
        }
        setLikeLoading(true)
        if (liked) {
            await supabase.from('likes').delete()
                .eq('user_id', userId).eq('story_id', storyId)
            setLiked(false)
            setLikes(l => l - 1)
        } else {
            await supabase.from('likes').insert({ user_id: userId, story_id: storyId })
            setLiked(true)
            setLikes(l => l + 1)
        }
        setLikeLoading(false)
    }

    async function toggleSave() {
        if (!userId) {
            router.push(`/${locale}/login`)
            return
        }
        setSaveLoading(true)
        if (saved) {
            await supabase.from('library').delete()
                .eq('user_id', userId).eq('story_id', storyId)
            setSaved(false)
        } else {
            await supabase.from('library').insert({ user_id: userId, story_id: storyId })
            setSaved(true)
        }
        setSaveLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={toggleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${liked
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-400'
                    }`}
            >
                <Heart size={14} className={liked ? 'fill-red-500' : ''} />
                {likes}
            </button>

            <button
                onClick={toggleSave}
                disabled={saveLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${saved
                        ? 'bg-teal-50 text-teal-600 border-teal-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-teal-200 hover:text-teal-500'
                    }`}
            >
                <Bookmark size={14} className={saved ? 'fill-teal-600' : ''} />
                {saved ? 'Saved' : 'Save'}
            </button>
        </div>
    )
}