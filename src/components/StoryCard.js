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

export default function StoryCard({ story, locale }) {
    return (
        <Link href={`/${locale}/story/${story.id}`}>
            <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">

                {/* Cover image */}
                <div className="relative h-44 bg-linear-to-br from-teal-50 to-teal-100 overflow-hidden">
                    {story.cover_url ? (
                        <img
                            src={story.cover_url}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={40} className="text-teal-300" />
                        </div>
                    )}
                    {/* Language badge */}
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-teal-700 px-2 py-0.5 rounded-full">
                        {langLabels[story.language]}
                    </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                    {/* Genre */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${genreColors[story.genre] || genreColors.general}`}>
                        {story.genre}
                    </span>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
                        {story.title}
                    </h3>

                    {/* Description */}
                    {story.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {story.description}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
                        <span className="text-xs text-gray-400">
                            by <span className="text-gray-600 font-medium">{story.profiles?.username || 'Author'}</span>
                        </span>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Heart size={12} /> {story.total_likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <BookOpen size={12} /> {story.total_reads || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}