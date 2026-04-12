import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { BookOpen, PenSquare, ChevronRight, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import StoryCard from '@/components/StoryCard'

const genres = [
  { key: 'romance', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&q=80' },
  { key: 'thriller', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&q=80' },
  { key: 'horror', img: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=400&q=80', },
  { key: 'comedy', img: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=300&q=80' },
  { key: 'poetry', img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=80' },
  { key: 'biography', img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&q=80' },
  { key: 'fantasy', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' },
  { key: 'spiritual', img: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=300&q=80' },
  { key: 'general', img: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=300&q=80' },
]

export default async function Home({ params }) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations({ locale, namespace: '' })

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch trending stories
  const { data: trending } = await supabase
    .from('stories')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('total_likes', { ascending: false })
    .limit(6)

  // Fetch newest stories
  const { data: newest } = await supabase
    .from('stories')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch word counts from first chapters for reading time
  const storyIds = [...(trending || []), ...(newest || [])].map(s => s.id)
  const { data: firstChapters } = storyIds.length > 0
    ? await supabase
      .from('chapters')
      .select('story_id, content')
      .in('story_id', storyIds)
      .eq('chapter_number', 1)
      .eq('status', 'published')
    : { data: [] }

  // Build word count map
  const wordCountMap = {}
  firstChapters?.forEach(ch => {
    const text = ch.content?.replace(/<[^>]+>/g, '') || ''
    wordCountMap[ch.story_id] = text.split(/\s+/).filter(Boolean).length
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} locale={locale} />

      {/* Hero */}
      <section className="bg-linear-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm">
            <span>ગ</span><span>·</span><span>क</span><span>·</span><span>A</span>
            <span className="ml-1 text-teal-200">3 languages</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
            {t('home.hero_title')}
          </h1>
          <p className="text-teal-100 text-lg max-w-xl leading-relaxed">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href={`/${locale}/browse`}
              className="bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-2"
            >
              <BookOpen size={18} />
              {t('home.start_reading')}
            </Link>
            <Link
              href={`/${locale}/write`}
              className="bg-teal-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-400 transition-colors flex items-center gap-2 border border-teal-400"
            >
              <PenSquare size={18} />
              {t('home.start_writing')}
            </Link>
          </div>

          {/* Search bar */}
          <form
            action={`/${locale}/browse`}
            method="GET"
            className="w-full max-w-lg flex gap-2 mt-2"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="search"
                placeholder="Search stories, authors..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('home.stats_languages'), value: '3' },
            { label: t('home.stats_genres'), value: '9' },
            { label: t('home.stats_free'), value: '100%' },
            { label: t('home.stats_writers'), value: '✓' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-teal-600">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending stories */}
      {trending?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('home.trending')}</h2>
            <Link href={`/${locale}/browse`} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map(story => (
              <StoryCard key={story.id} story={story} locale={locale} wordCount={wordCountMap[story.id]} />
            ))}
          </div>
        </section>
      )}

      {/* Genres with images */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('home.genres')}</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {genres.map((g) => (
              <Link
                key={g.key}
                href={`/${locale}/browse?genre=${g.key}`}
                className="group flex flex-col items-center rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="w-full h-20 overflow-hidden">
                  <img
                    src={g.img}
                    alt={g.key}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-full bg-white dark:bg-gray-800 px-2 py-2 text-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                    {t(`genres.${g.key}`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newest stories */}
      {newest?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('home.new')}</h2>
            <Link href={`/${locale}/browse`} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newest.map(story => (
              <StoryCard key={story.id} story={story} locale={locale} wordCount={wordCountMap[story.id]} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-gray-400 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              <span className="text-white font-semibold">Kathavarta</span>
            </div>
            <p className="text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>
          <div>
            <p className="text-white font-medium mb-3 text-sm">{t('footer.explore')}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/browse`} className="hover:text-white transition-colors">{t('nav.browse')}</Link>
              <Link href={`/${locale}/browse?genre=poetry`} className="hover:text-white transition-colors">{t('genres.poetry')}</Link>
              <Link href={`/${locale}/browse?genre=romance`} className="hover:text-white transition-colors">{t('genres.romance')}</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-medium mb-3 text-sm">{t('footer.write')}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/write`} className="hover:text-white transition-colors">{t('footer.new_story')}</Link>
              <Link href={`/${locale}/library`} className="hover:text-white transition-colors">{t('nav.library')}</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-medium mb-3 text-sm">{t('footer.languages')}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/en" className="hover:text-white transition-colors">English</Link>
              <Link href="/hi" className="hover:text-white transition-colors">हिन्दी</Link>
              <Link href="/gu" className="hover:text-white transition-colors">ગુજરાતી</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 dark:border-gray-800 text-center text-xs py-4">
          © {new Date().getFullYear()} Kathavarta. {t('footer.copyright')}
        </div>
      </footer>
    </div>
  )
}