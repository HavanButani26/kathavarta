'use client'

import Link from 'next/link'
import { Heart, BookOpen, Clock } from 'lucide-react'

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

const langLabels = { en: 'EN', hi: 'हि', gu: 'ગુ' }

const genreFallbacks = {
    romance: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
    thriller: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&q=80',
    horror: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=400&q=80',
    comedy: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&q=80',
    poetry: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80',
    biography: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
    fantasy: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    spiritual: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&q=80',
    general: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&q=80',
}

export default function StoryCard({ story, locale, wordCount }) {
    const coverImg = story.cover_url || genreFallbacks[story.genre] || genreFallbacks.general
    const mins = wordCount ? Math.max(1, Math.ceil(wordCount / 250)) : 5

    return (
        <Link href={`/${locale}/story/${story.id}`}>
            <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">

                {/* Cover image */}
                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        src={coverImg}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = genreFallbacks.general }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Language badge top-right */}
                    <span className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full">
                        {langLabels[story.language]}
                    </span>

                    {/* Genre badge bottom-left */}
                    <span className={`absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${genreColors[story.genre] || genreColors.general}`}>
                        {story.genre}
                    </span>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 gap-1.5">

                    {/* Title */}
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {story.title}
                    </h3>

                    {/* Author */}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        by <span className="text-gray-600 dark:text-gray-400 font-medium">{story.profiles?.username || 'Author'}</span>
                    </p>

                    {/* Footer: reading time + stats */}
                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-700">
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                            <Clock size={11} />
                            <span>{mins} min read</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-0.5">
                                <Heart size={11} /> {story.total_likes || 0}
                            </span>
                            <span className="flex items-center gap-0.5">
                                <BookOpen size={11} /> {story.total_reads || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}