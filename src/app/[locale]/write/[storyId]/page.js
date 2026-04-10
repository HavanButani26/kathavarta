import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ChapterEditor from '@/components/ChapterEditor'
import StorySettings from '@/components/StorySettings'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus } from 'lucide-react'

export default async function StoryEditorPage({ params }) {
    const { locale, storyId } = await params
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

    const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId)
        .order('chapter_number', { ascending: true })

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Back + title */}
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href={`/${locale}/write`}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{story.title}</h1>
                        <p className="text-xs text-gray-400">{story.genre} · {story.language.toUpperCase()} · {story.status}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {story.status === 'published' && (
                            <Link
                                href={`/${locale}/story/${storyId}`}
                                className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                            >
                                View Live
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: chapter list + new chapter */}
                    <div className="lg:col-span-1 flex flex-col gap-4">

                        {/* Story settings */}
                        <StorySettings story={story} locale={locale} />

                        {/* Chapters list */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                                    <BookOpen size={15} className="text-teal-600" />
                                    Chapters ({chapters?.length || 0})
                                </h2>
                            </div>

                            {chapters?.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No chapters yet. Write your first one →</p>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {chapters.map(ch => (
                                        <Link
                                            key={ch.id}
                                            href={`/${locale}/write/${storyId}/${ch.id}`}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium">
                                                    {ch.chapter_number}
                                                </span>
                                                <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors line-clamp-1">
                                                    {ch.title}
                                                </span>
                                            </div>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${ch.status === 'published'
                                                    ? 'bg-teal-50 text-teal-600'
                                                    : 'bg-yellow-50 text-yellow-600'
                                                }`}>
                                                {ch.status === 'published' ? '✓' : '✎'}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Add new chapter */}
                            <Link
                                href={`/${locale}/write/${storyId}/new`}
                                className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-teal-300 text-teal-600 rounded-xl py-2.5 text-sm hover:bg-teal-50 transition-colors"
                            >
                                <Plus size={15} />
                                Add Chapter
                            </Link>
                        </div>
                    </div>

                    {/* Right: chapter editor */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center py-16">
                            <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Select a chapter to edit, or add a new one</p>
                            <Link
                                href={`/${locale}/write/${storyId}/new`}
                                className="inline-flex items-center gap-2 mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                            >
                                <Plus size={15} />
                                Write First Chapter
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}