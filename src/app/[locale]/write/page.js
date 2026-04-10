import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StoryForm from '@/components/StoryForm'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { PenSquare, BookOpen, Plus } from 'lucide-react'

export default async function WritePage({ params }) {
    const { locale } = await params
    const supabase = await createClient()
    const t = await getTranslations({ locale })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    // Fetch user's existing stories
    const { data: stories } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <PenSquare size={24} className="text-teal-600" />
                            {t('nav.write')}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Create and manage your stories</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* New story form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                                <Plus size={18} className="text-teal-600" />
                                New Story
                            </h2>
                            <StoryForm locale={locale} userId={user.id} />
                        </div>
                    </div>

                    {/* Existing stories */}
                    <div className="lg:col-span-2">
                        <h2 className="font-semibold text-gray-800 mb-4">Your Stories ({stories?.length || 0})</h2>
                        {stories?.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No stories yet. Create your first one!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {stories.map(story => (
                                    <StoryListItem key={story.id} story={story} locale={locale} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StoryListItem({ story, locale }) {
    const statusColors = {
        draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        published: 'bg-teal-50 text-teal-700 border-teal-200',
    }
    const langLabels = { en: 'EN', hi: 'हि', gu: 'ગુ' }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-sm transition-all">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">{story.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[story.status]}`}>
                        {story.status}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {langLabels[story.language]}
                    </span>
                </div>
                <p className="text-xs text-gray-400">{story.genre} · {story.total_reads} reads · {story.total_likes} likes</p>
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href={`/${locale}/write/${story.id}`}
                    className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Edit / Chapters
                </Link>
                {story.status === 'published' && (
                    <Link
                        href={`/${locale}/story/${story.id}`}
                        className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        View
                    </Link>
                )}
            </div>
        </div>
    )
}