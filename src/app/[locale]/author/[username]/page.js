import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import StoryCard from '@/components/StoryCard'
import FollowButton from '@/components/FollowButton'
import { BookOpen, Heart, Eye, Users, UserCheck } from 'lucide-react'

export default async function AuthorPage({ params }) {
    const { locale, username } = await params
    const supabase = await createClient()
    const t = await getTranslations({ locale })

    const { data: { user } } = await supabase.auth.getUser()

    // Get author profile
    const { data: author } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (!author) notFound()

    // Get author's published stories
    const { data: stories } = await supabase
        .from('stories')
        .select('*, profiles(username, avatar_url)')
        .eq('author_id', author.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

    // Get follower + following counts
    const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', author.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', author.id),
    ])

    // Check if current user follows this author
    let isFollowing = false
    if (user && user.id !== author.id) {
        const { data } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', author.id)
            .single()
        isFollowing = !!data
    }

    // Total reads + likes across all stories
    const totalReads = stories?.reduce((sum, s) => sum + (s.total_reads || 0), 0) || 0
    const totalLikes = stories?.reduce((sum, s) => sum + (s.total_likes || 0), 0) || 0

    const isOwnProfile = user?.id === author.id

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            <div className="max-w-5xl mx-auto px-4 py-10">

                {/* Profile header */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

                    {/* Banner */}
                    <div className="h-28 bg-linear-to-r from-teal-500 via-teal-600 to-teal-700" />

                    {/* Avatar + info */}
                    <div className="px-6 pb-6">
                        <div className="flex items-end justify-between -mt-8 mb-4">
                            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-teal-600 bg-teal-50">
                                {author.full_name?.charAt(0) || author.username?.charAt(0)}
                            </div>
                            <div className="flex items-center gap-2 mt-8">
                                {isOwnProfile ? (
                                    <a
                                        href={`/${locale}/profile`}
                                        className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Edit Profile
                                    </a>
                                ) : (
                                    <FollowButton
                                        authorId={author.id}
                                        userId={user?.id}
                                        locale={locale}
                                        initialFollowing={isFollowing}
                                        initialCount={followerCount || 0}
                                    />
                                )}
                            </div>
                        </div>

                        <h1 className="text-xl font-bold text-gray-800">
                            {author.full_name || author.username}
                        </h1>
                        <p className="text-sm text-gray-400 mb-3">@{author.username}</p>
                        {author.bio && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-xl">{author.bio}</p>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{stories?.length || 0}</p>
                                <p className="text-xs text-gray-400">Stories</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{followerCount || 0}</p>
                                <p className="text-xs text-gray-400">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{followingCount || 0}</p>
                                <p className="text-xs text-gray-400">Following</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{totalReads}</p>
                                <p className="text-xs text-gray-400">Total Reads</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{totalLikes}</p>
                                <p className="text-xs text-gray-400">Total Likes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stories */}
                <h2 className="font-bold text-gray-800 mb-4 text-lg">
                    Stories by {author.full_name || author.username}
                </h2>

                {stories?.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                        <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No published stories yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {stories?.map(story => (
                            <StoryCard key={story.id} story={story} locale={locale} />
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}