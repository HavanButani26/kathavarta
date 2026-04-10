'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { createClient } from '@/lib/supabase/client'
import {
    Bold, Italic, List, ListOrdered,
    Heading2, Quote, Undo, Redo,
    Save, Globe, FileText, AlignLeft
} from 'lucide-react'

export default function ChapterEditor({ storyId, chapter, nextChapterNumber, locale }) {
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState(chapter?.title || '')
    const [status, setStatus] = useState(chapter?.status || 'draft')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your chapter here...',
            }),
            CharacterCount,
        ],
        content: chapter?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-96 px-1',
            },
        },
    })

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!chapter) return
        const interval = setInterval(() => {
            if (editor && title) handleSave('draft', true)
        }, 30000)
        return () => clearInterval(interval)
    }, [editor, title])

    async function handleSave(saveStatus = status, silent = false) {
        if (!title.trim()) {
            setError('Please enter a chapter title')
            return
        }
        if (!editor?.getText().trim()) {
            setError('Please write some content')
            return
        }

        setSaving(true)
        setError('')

        const payload = {
            story_id: storyId,
            title: title.trim(),
            content: editor.getHTML(),
            status: saveStatus,
            updated_at: new Date().toISOString(),
        }

        let result
        if (chapter) {
            result = await supabase
                .from('chapters')
                .update(payload)
                .eq('id', chapter.id)
                .select()
                .single()
        } else {
            result = await supabase
                .from('chapters')
                .insert({ ...payload, chapter_number: nextChapterNumber })
                .select()
                .single()
        }

        if (result.error) {
            setError(result.error.message)
        } else {
            if (!silent) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            }
            // Update story updated_at
            await supabase
                .from('stories')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', storyId)

            if (!chapter) {
                router.replace(`/${locale}/write/${storyId}/${result.data.id}`)
            }
            router.refresh()
        }
        setSaving(false)
    }

    if (!editor) return null

    const wordCount = editor.storage.characterCount?.words() || 0
    const charCount = editor.storage.characterCount?.characters() || 0

    return (
        <div className="flex flex-col gap-4">

            {/* Chapter title */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Chapter Title"
                    className="w-full text-xl font-bold text-gray-800 placeholder-gray-300 focus:outline-none"
                />
            </div>

            {/* Editor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="border-b border-gray-100 px-4 py-2 flex items-center gap-1 flex-wrap">
                    {[
                        { icon: <Bold size={15} />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
                        { icon: <Italic size={15} />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
                        { icon: <Heading2 size={15} />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading' },
                        { icon: <Quote size={15} />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Quote' },
                        { icon: <List size={15} />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet List' },
                        { icon: <ListOrdered size={15} />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Numbered List' },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={btn.action}
                            title={btn.title}
                            className={`p-1.5 rounded-lg transition-colors ${btn.active
                                ? 'bg-teal-100 text-teal-700'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            {btn.icon}
                        </button>
                    ))}

                    <div className="w-px h-5 bg-gray-200 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Undo"
                    >
                        <Undo size={15} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Redo"
                    >
                        <Redo size={15} />
                    </button>

                    {/* Word count */}
                    <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                        <AlignLeft size={12} />
                        {wordCount} words · {charCount} chars
                    </div>
                </div>

                {/* Editor content */}
                <div className="p-6 min-h-96">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</div>
            )}

            {/* Save bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    {saved && <span className="text-teal-600 font-medium">✓ Saved!</span>}
                    {saving && (
                        <span className="flex items-center gap-1.5">
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
                            Saving...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <FileText size={14} />
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                        <Globe size={14} />
                        Publish Chapter
                    </button>
                </div>
            </div>
        </div>
    )
}