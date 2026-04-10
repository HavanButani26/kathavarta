import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, List } from 'lucide-react'

export default async function ChapterReadPage({ params }) {
    const { locale, storyId, chapterId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: chapter } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .eq('story_id', storyId)
        .eq('status', 'published')
        .single()

    if (!chapter) notFound()

    const { data: story } = await supabase
        .from('stories')
        .select('*, profiles(username, full_name)')
        .eq('id', storyId)
        .single()

    // All chapters for navigation
    const { data: allChapters } = await supabase
        .from('chapters')
        .select('id, chapter_number, title')
        .eq('story_id', storyId)
        .eq('status', 'published')
        .order('chapter_number', { ascending: true })

    const currentIndex = allChapters?.findIndex(c => c.id === chapterId)
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
    const nextChapter = currentIndex < allChapters?.length - 1 ? allChapters[currentIndex + 1] : null

    // Increment chapter read count
    supabase
        .from('chapters')
        .update({ read_count: (chapter.read_count || 0) + 1 })
        .eq('id', chapterId)
        .then(() => { })

    // Save reading progress if logged in
    if (user) {
        supabase.from('reading_progress').upsert({
            user_id: user.id,
            story_id: storyId,
            chapter_id: chapterId,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,story_id' }).then(() => { })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            {/* Reading header */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        href={`/${locale}/story/${storyId}`}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
                    >
                        <List size={15} />
                        <span className="hidden sm:inline truncate max-w-48">{story?.title}</span>
                        <span className="sm:hidden">Contents</span>
                    </Link>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <BookOpen size={12} />
                        <span>Ch. {chapter.chapter_number} of {allChapters?.length}</span>
                    </div>

                    {/* Chapter progress dots */}
                    <div className="hidden md:flex items-center gap-1">
                        {allChapters?.map(ch => (
                            <Link key={ch.id} href={`/${locale}/story/${storyId}/${ch.id}`}>
                                <div className={`w-2 h-2 rounded-full transition-colors ${ch.id === chapterId ? 'bg-teal-600' : 'bg-gray-200 hover:bg-gray-300'
                                    }`} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reading content */}
            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* Chapter header */}
                <div className="mb-10 text-center">
                    <p className="text-sm text-teal-600 font-medium mb-2">Chapter {chapter.chapter_number}</p>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{chapter.title}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <span>{t_author(story?.profiles)}</span>
                    </div>
                    <div className="mt-4 w-16 h-0.5 bg-teal-200 mx-auto rounded-full" />
                </div>

                {/* Story content */}
                <div
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed
            prose-headings:font-bold prose-headings:text-gray-800
            prose-p:mb-4 prose-p:leading-8
            prose-blockquote:border-teal-400 prose-blockquote:text-gray-500
            prose-strong:text-gray-800 prose-strong:font-semibold"
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                    style={{ fontFamily: story?.language === 'hi' ? "'Noto Sans Devanagari', sans-serif" : story?.language === 'gu' ? "'Noto Sans Gujarati', sans-serif" : 'inherit' }}
                />

                {/* Divider */}
                <div className="flex items-center gap-4 my-12">
                    <div className="flex-1 h-px bg-gray-200" />
                    <BookOpen size={16} className="text-gray-300" />
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Chapter navigation */}
                <div className="flex items-center justify-between gap-4">
                    {prevChapter ? (
                        <Link
                            href={`/${locale}/story/${storyId}/${prevChapter.id}`}
                            className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-all flex-1 max-w-xs"
                        >
                            <ArrowLeft size={15} />
                            <div className="text-left overflow-hidden">
                                <p className="text-xs text-gray-400">Previous</p>
                                <p className="font-medium truncate">Ch. {prevChapter.chapter_number}: {prevChapter.title}</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex-1 max-w-xs" />
                    )}

                    <Link
                        href={`/${locale}/story/${storyId}`}
                        className="flex flex-col items-center gap-1 px-4 py-2 text-xs text-gray-400 hover:text-teal-600 transition-colors"
                    >
                        <List size={16} />
                        <span>Contents</span>
                    </Link>

                    {nextChapter ? (
                        <Link
                            href={`/${locale}/story/${storyId}/${nextChapter.id}`}
                            className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 transition-all flex-1 max-w-xs justify-end"
                        >
                            <div className="text-right overflow-hidden">
                                <p className="text-xs text-teal-200">Next</p>
                                <p className="font-medium truncate">Ch. {nextChapter.chapter_number}: {nextChapter.title}</p>
                            </div>
                            <ArrowRight size={15} />
                        </Link>
                    ) : (
                        <div className="flex-1 max-w-xs flex justify-end">
                            <Link
                                href={`/${locale}/story/${storyId}`}
                                className="px-5 py-3 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors"
                            >
                                Finished! View story ✓
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function t_author(profile) {
    if (!profile) return ''
    return `by ${profile.full_name || profile.username}`
}