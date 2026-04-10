import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ChapterEditor from '@/components/ChapterEditor'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ChapterPage({ params }) {
    const { locale, storyId, chapterId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .eq('author_id', user.id)
        .single()

    if (!story) notFound()

    // Handle "new" chapter
    let chapter = null
    let nextChapterNumber = 1

    if (chapterId !== 'new') {
        const { data } = await supabase
            .from('chapters')
            .select('*')
            .eq('id', chapterId)
            .eq('story_id', storyId)
            .single()
        if (!data) notFound()
        chapter = data
    } else {
        const { data: existing } = await supabase
            .from('chapters')
            .select('chapter_number')
            .eq('story_id', storyId)
            .order('chapter_number', { ascending: false })
            .limit(1)
        nextChapterNumber = existing?.[0]?.chapter_number + 1 || 1
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href={`/${locale}/write/${storyId}`}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600" />
                    </Link>
                    <div>
                        <p className="text-xs text-gray-400">{story.title}</p>
                        <h1 className="text-lg font-bold text-gray-800">
                            {chapter ? `Chapter ${chapter.chapter_number}: ${chapter.title}` : `New Chapter ${nextChapterNumber}`}
                        </h1>
                    </div>
                </div>

                <ChapterEditor
                    storyId={storyId}
                    chapter={chapter}
                    nextChapterNumber={nextChapterNumber}
                    locale={locale}
                />
            </div>
        </div>
    )
}