'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({ authorId, userId, locale, initialFollowing, initialCount }) {
    const router = useRouter()
    const supabase = createClient()
    const [following, setFollowing] = useState(initialFollowing)
    const [count, setCount] = useState(initialCount)
    const [loading, setLoading] = useState(false)
    const [hover, setHover] = useState(false)

    async function toggleFollow() {
        if (!userId) {
            router.push(`/${locale}/login`)
            return
        }
        setLoading(true)
        if (following) {
            await supabase.from('follows').delete()
                .eq('follower_id', userId)
                .eq('following_id', authorId)
            setFollowing(false)
            setCount(c => c - 1)
        } else {
            await supabase.from('follows').insert({
                follower_id: userId,
                following_id: authorId,
            })
            setFollowing(true)
            setCount(c => c + 1)
        }
        setLoading(false)
        router.refresh()
    }

    return (
        <button
            onClick={toggleFollow}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border transition-all ${following
                    ? hover
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
                }`}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : following ? (
                <>
                    {hover ? 'Unfollow' : <><UserCheck size={15} /> Following</>}
                </>
            ) : (
                <><UserPlus size={15} /> Follow</>
            )}
        </button>
    )
}