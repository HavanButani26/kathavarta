import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import StoryCard from '@/components/StoryCard'
import { Search } from 'lucide-react'

const genres = [
    'all', 'general', 'romance', 'thriller', 'horror',
    'comedy', 'poetry', 'biography', 'fantasy', 'spiritual'
]

const languages = [
    { code: 'all', label: 'All' },
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
]

export default async function BrowsePage({ params, searchParams }) {
    const { locale } = await params
    const sp = await searchParams
    const genre = sp?.genre || 'all'
    const lang = sp?.lang || 'all'
    const search = sp?.search || ''
    const sort = sp?.sort || 'latest'

    const supabase = await createClient()
    const t = await getTranslations({ locale })

    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
        .from('stories')
        .select('*, profiles(username, avatar_url)')
        .eq('status', 'published')

    if (genre !== 'all') query = query.eq('genre', genre)
    if (lang !== 'all') query = query.eq('language', lang)
    if (search) query = query.ilike('title', `%${search}%`)

    if (sort === 'popular') {
        query = query.order('total_likes', { ascending: false })
    } else if (sort === 'most_read') {
        query = query.order('total_reads', { ascending: false })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    const { data: stories } = await query.limit(24)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('nav.browse')}</h1>

                    {/* Search bar */}
                    <form method="GET" className="relative mb-6">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search stories..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                        />
                        {genre !== 'all' && <input type="hidden" name="genre" value={genre} />}
                        {lang !== 'all' && <input type="hidden" name="lang" value={lang} />}
                        {sort !== 'latest' && <input type="hidden" name="sort" value={sort} />}
                    </form>

                    {/* Filters row */}
                    <div className="flex flex-wrap gap-3">

                        {/* Genre filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {genres.map(g => (
                                <a
                                    key={g}
                                    href={`/${locale}/browse?genre=${g}&lang=${lang}&sort=${sort}${search ? `&search=${search}` : ''}`}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${genre === g
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                                        }`}
                                >
                                    {g === 'all' ? 'All Genres' : t(`genres.${g}`)}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Language + Sort */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            {languages.map(l => (
                                <a
                                    key={l.code}
                                    href={`/${locale}/browse?genre=${genre}&lang=${l.code}&sort=${sort}${search ? `&search=${search}` : ''}`}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${lang === l.code
                                        ? 'bg-gray-800 text-white border-gray-800'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {[
                                { key: 'latest', label: 'Latest' },
                                { key: 'popular', label: 'Most Liked' },
                                { key: 'most_read', label: 'Most Read' },
                            ].map(s => (
                                <a
                                    key={s.key}
                                    href={`/${locale}/browse?genre=${genre}&lang=${lang}&sort=${s.key}${search ? `&search=${search}` : ''}`}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sort === s.key
                                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                        }`}
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div >
            </div >

            {/* Stories grid */}
            < div className="max-w-6xl mx-auto px-4 py-8" >
                {stories?.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No stories found</p>
                        <p className="text-gray-300 text-sm mt-1">Try a different filter or search term</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-400 mb-4">{stories?.length} stories found</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {stories?.map(story => (
                                <StoryCard key={story.id} story={story} locale={locale} />
                            ))}
                        </div>
                    </>
                )
                }
            </div >
        </div >
    )
}