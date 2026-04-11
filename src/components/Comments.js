'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function Comments({ storyId, userId, locale }) {
    const router = useRouter()
    const supabase = createClient()
    const [comments, setComments] = useState([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        fetchComments()
    }, [])

    async function fetchComments() {
        const { data } = await supabase
            .from('comments')
            .select('*, profiles(username, full_name)')
            .eq('story_id', storyId)
            .order('created_at', { ascending: false })
        setComments(data || [])
        setFetching(false)
    }

    async function submitComment(e) {
        e.preventDefault()
        if (!userId) {
            router.push(`/${locale}/login`)
            return
        }
        if (!text.trim()) return

        setLoading(true)
        const { data, error } = await supabase
            .from('comments')
            .insert({ story_id: storyId, user_id: userId, content: text.trim() })
            .select('*, profiles(username, full_name)')
            .single()

        if (!error) {
            setComments(prev => [data, ...prev])
            setText('')
        }
        setLoading(false)
    }

    async function deleteComment(commentId) {
        await supabase.from('comments').delete().eq('id', commentId)
        setComments(prev => prev.filter(c => c.id !== commentId))
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                <MessageCircle size={18} className="text-teal-600" />
                Comments ({comments.length})
            </h2>

            {/* Comment input */}
            <form onSubmit={submitComment} className="mb-6">
                {!userId ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-500 mb-2">Login to leave a comment</p>
                        <Link
                            href={`/${locale}/login`}
                            className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-medium text-sm shrink-0 mt-1">
                            {userId?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Write a comment..."
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{text.length}/500</span>
                                <button
                                    type="submit"
                                    disabled={loading || !text.trim()}
                                    className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send size={13} />
                                    )}
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* Comments list */}
            {fetching ? (
                <div className="text-center py-6">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Link href={`/${locale}/author/${comment.profiles?.username}`}>
                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-medium text-sm shrink-0">
                                    {comment.profiles?.full_name?.charAt(0) || comment.profiles?.username?.charAt(0)}
                                </div>
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Link
                                        href={`/${locale}/author/${comment.profiles?.username}`}
                                        className="text-sm font-medium text-gray-800 hover:text-teal-600 transition-colors"
                                    >
                                        {comment.profiles?.full_name || comment.profiles?.username}
                                    </Link>
                                    <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                            </div>
                            {comment.user_id === userId && (
                                <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}