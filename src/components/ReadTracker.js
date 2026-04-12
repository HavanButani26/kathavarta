'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Generates a simple guest ID stored in localStorage
function getGuestId() {
    if (typeof window === 'undefined') return null
    let id = localStorage.getItem('kv_guest_id')
    if (!id) {
        id = 'guest_' + Math.random().toString(36).slice(2) + Date.now()
        localStorage.setItem('kv_guest_id', id)
    }
    return id
}

export default function ReadTracker({ storyId, userId }) {
    useEffect(() => {
        const supabase = createClient()
        const guestId = userId ? null : getGuestId()

        supabase.rpc('increment_story_read', {
            p_story_id: storyId,
            p_user_id: userId || null,
            p_guest_id: guestId,
        }).then(() => { })
    }, [storyId, userId])

    return null // invisible component
}