import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import StoryCard from '@/components/StoryCard'
import { Library, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function LibraryPage({ params }) {
    const { locale } = await params
    const supabase = await createClient()
    const t = await getTranslations({ locale })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    // Fetch saved stories
    const { data: saved } = await supabase
        .from('library')
        .select('*, stories(*, profiles(username, avatar_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch reading progress
    const { data: progress } = await supabase
        .from('reading_progress')
        .select('*, stories(id, title), chapters(id, title, chapter_number)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)

    const savedStories = saved?.map(s => s.stories).filter(Boolean) || []

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            <div className="max-w-6xl mx-auto px-4 py-10">

                <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <Library size={24} className="text-teal-600" />
                    {t('nav.library')}
                </h1>

                {/* Continue reading */}
                {progress?.length > 0 && (
                    <div className="mb-10">
                        <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Continue Reading</h2>
                        <div className="flex flex-col gap-3">
                            {progress.map(p => (
                                <Link
                                    key={p.id}
                                    href={`/${locale}/story/${p.stories?.id}/${p.chapters?.id}`}
                                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <BookOpen size={18} className="text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm group-hover:text-teal-600 transition-colors">
                                                {p.stories?.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Chapter {p.chapters?.chapter_number}: {p.chapters?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg group-hover:bg-teal-700 transition-colors flex-shrink-0">
                                        Continue →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Saved stories */}
                <div>
                    <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                        Saved Stories ({savedStories.length})
                    </h2>

                    {savedStories.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                            <Library size={40} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">No saved stories yet</p>
                            <Link
                                href={`/${locale}/browse`}
                                className="inline-flex items-center gap-2 mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                            >
                                <BookOpen size={15} />
                                Browse Stories
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {savedStories.map(story => (
                                <StoryCard key={story.id} story={story} locale={locale} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}