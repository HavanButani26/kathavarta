import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import StoryActions from '@/components/StoryActions'
import Link from 'next/link'
import { BookOpen, Heart, Eye, ChevronRight, User, Calendar } from 'lucide-react'
import Comments from '@/components/Comments'

const langLabels = { en: 'English', hi: 'हिन्दी', gu: 'ગુજરાતી' }

export default async function StoryPage({ params }) {
    const { locale, storyId } = await params
    const supabase = await createClient()
    const t = await getTranslations({ locale })

    const { data: { user } } = await supabase.auth.getUser()

    const { data: story } = await supabase
        .from('stories')
        .select('*, profiles(id, username, full_name, avatar_url, bio)')
        .eq('id', storyId)
        .eq('status', 'published')
        .single()

    if (!story) notFound()

    // Fetch published chapters
    const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId)
        .eq('status', 'published')
        .order('chapter_number', { ascending: true })

    // Increment read count (fire and forget)
    supabase
        .from('stories')
        .update({ total_reads: story.total_reads + 1 })
        .eq('id', storyId)
        .then(() => { })

    // Check if user liked / saved this story
    let userLiked = false
    let userSaved = false

    if (user) {
        const [likeRes, saveRes] = await Promise.all([
            supabase.from('likes').select('id').eq('user_id', user.id).eq('story_id', storyId).single(),
            supabase.from('library').select('id').eq('user_id', user.id).eq('story_id', storyId).single(),
        ])
        userLiked = !!likeRes.data
        userSaved = !!saveRes.data
    }

    const genreColors = {
        romance: 'bg-pink-100 text-pink-700',
        thriller: 'bg-orange-100 text-orange-700',
        horror: 'bg-red-100 text-red-700',
        comedy: 'bg-yellow-100 text-yellow-700',
        poetry: 'bg-purple-100 text-purple-700',
        biography: 'bg-blue-100 text-blue-700',
        fantasy: 'bg-indigo-100 text-indigo-700',
        spiritual: 'bg-green-100 text-green-700',
        general: 'bg-gray-100 text-gray-700',
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            <div className="max-w-4xl mx-auto px-4 py-10">

                {/* Story header */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

                    {/* Cover */}
                    <div className="h-52 bg-linear-to-br from-teal-500 to-teal-700 relative">
                        {story.cover_url ? (
                            <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen size={56} className="text-white/40" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-6 flex items-center gap-2">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${genreColors[story.genre]}`}>
                                {t(`genres.${story.genre}`)}
                            </span>
                            <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                                {langLabels[story.language]}
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
                        {story.description && (
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">{story.description}</p>
                        )}

                        {/* Author */}
                        <Link
                            href={`/${locale}/author/${story.profiles.username}`}
                            className="flex items-center gap-3 mb-5 group w-fit"
                        >
                            <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                                {story.profiles.full_name?.charAt(0) || story.profiles.username?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 group-hover:text-teal-600 transition-colors">
                                    {story.profiles.full_name || story.profiles.username}
                                </p>
                                <p className="text-xs text-gray-400">@{story.profiles.username}</p>
                            </div>
                        </Link>

                        {/* Stats + actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Eye size={13} /> {story.total_reads} {t('story.reads')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart size={13} /> {story.total_likes}
                                </span>
                                <span className="flex items-center gap-1">
                                    <BookOpen size={13} /> {chapters?.length || 0} {t('story.chapters')}
                                </span>
                            </div>

                            {/* Like + Save buttons */}
                            <StoryActions
                                storyId={storyId}
                                userId={user?.id}
                                locale={locale}
                                initialLiked={userLiked}
                                initialSaved={userSaved}
                                initialLikes={story.total_likes}
                            />
                        </div>
                    </div>
                </div>

                {/* Chapters list */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-teal-600" />
                        {t('story.chapters')} ({chapters?.length || 0})
                    </h2>

                    {chapters?.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-6">No chapters published yet.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-50">
                            {chapters?.map(chapter => (
                                <Link
                                    key={chapter.id}
                                    href={`/${locale}/story/${storyId}/${chapter.id}`}
                                    className="flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-7 h-7 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
                                            {chapter.chapter_number}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
                                                {chapter.title}
                                            </p>
                                            <p className="text-xs text-gray-400">{chapter.read_count || 0} reads</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Author card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={18} className="text-teal-600" />
                        About the Author
                    </h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg shrink-0">
                            {story.profiles.full_name?.charAt(0) || story.profiles.username?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{story.profiles.full_name || story.profiles.username}</p>
                            <p className="text-sm text-gray-400 mb-2">@{story.profiles.username}</p>
                            {story.profiles.bio && (
                                <p className="text-sm text-gray-500 leading-relaxed">{story.profiles.bio}</p>
                            )}
                            <Link
                                href={`/${locale}/author/${story.profiles.username}`}
                                className="inline-flex items-center gap-1 mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                                View all stories <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Comments */}
                <Comments
                    storyId={storyId}
                    userId={user?.id}
                    locale={locale}
                />
            </div>
        </div>
    )
}