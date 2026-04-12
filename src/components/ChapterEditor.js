'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { createClient } from '@/lib/supabase/client'
import {
    Bold, Italic, List, ListOrdered,
    Heading2, Quote, Undo, Redo,
    Save, Globe, FileText, AlignLeft,
    Image as ImageIcon, Link as LinkIcon, Unlink
} from 'lucide-react'

export default function ChapterEditor({ storyId, chapter, nextChapterNumber, locale }) {
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState(chapter?.title || '')
    const [status, setStatus] = useState(chapter?.status || 'draft')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [showImageModal, setShowImageModal] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [uploadingImg, setUploadingImg] = useState(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Start writing your chapter here...' }),
            CharacterCount,
            Image.configure({ inline: false, allowBase64: true }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-teal-600 underline cursor-pointer' },
            }),
        ],
        content: chapter?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-96 px-1',
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

    // Insert image from URL
    function insertImageUrl() {
        if (!imageUrl.trim()) return
        editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
        setImageUrl('')
        setShowImageModal(false)
    }

    // Upload image file to Supabase storage
    async function uploadImage(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingImg(true)
        const ext = file.name.split('.').pop()
        const path = `chapters/${storyId}/${Date.now()}.${ext}`
        const { error } = await supabase.storage
            .from('story-images')
            .upload(path, file, { upsert: true })
        if (!error) {
            const { data: urlData } = supabase.storage.from('story-images').getPublicUrl(path)
            editor.chain().focus().setImage({ src: urlData.publicUrl }).run()
            setShowImageModal(false)
        }
        setUploadingImg(false)
    }

    // Insert / update link
    function insertLink() {
        if (!linkUrl.trim()) return
        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
        editor.chain().focus().setLink({ href: url }).run()
        setLinkUrl('')
        setShowLinkModal(false)
    }

    async function handleSave(saveStatus = status, silent = false) {
        if (!title.trim()) { setError('Please enter a chapter title'); return }
        if (!editor?.getText().trim()) { setError('Please write some content'); return }

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
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Chapter Title"
                    className="w-full text-xl font-bold text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent focus:outline-none"
                />
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center gap-1 flex-wrap">
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
                                    ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {btn.icon}
                        </button>
                    ))}

                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

                    {/* Image button */}
                    <button
                        onClick={() => setShowImageModal(true)}
                        title="Insert Image"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ImageIcon size={15} />
                    </button>

                    {/* Link button */}
                    <button
                        onClick={() =>
                            editor.isActive('link')
                                ? editor.chain().focus().unsetLink().run()
                                : setShowLinkModal(true)
                        }
                        title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('link')
                                ? 'bg-teal-100 dark:bg-teal-900 text-teal-700'
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {editor.isActive('link') ? <Unlink size={15} /> : <LinkIcon size={15} />}
                    </button>

                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Undo"
                    >
                        <Undo size={15} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Redo"
                    >
                        <Redo size={15} />
                    </button>

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

            {/* Image modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <ImageIcon size={16} className="text-teal-600" /> Insert Image
                        </h3>

                        {/* Upload file */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload from device
                            </label>
                            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-6 cursor-pointer hover:border-teal-400 transition-colors text-sm text-gray-500 dark:text-gray-400">
                                {uploadingImg ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
                                ) : (
                                    <><ImageIcon size={16} /> Click to upload image</>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
                            </label>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400">or</span>
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                        </div>

                        {/* Paste URL */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Paste image URL
                            </label>
                            <input
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={insertImageUrl}
                                className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                            >
                                Insert
                            </button>
                            <button
                                onClick={() => { setShowImageModal(false); setImageUrl('') }}
                                className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <LinkIcon size={16} className="text-teal-600" /> Insert Link
                        </h3>
                        <input
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            onKeyDown={e => e.key === 'Enter' && insertLink()}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100 mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={insertLink}
                                className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
                            >
                                Add Link
                            </button>
                            <button
                                onClick={() => { setShowLinkModal(false); setLinkUrl('') }}
                                className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">{error}</div>
            )}

            {/* Save bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
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
                        className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <FileText size={14} /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                        <Globe size={14} /> Publish Chapter
                    </button>
                </div>
            </div>
        </div>
    )
}