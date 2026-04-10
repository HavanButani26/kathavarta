import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { BookOpen, PenSquare, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import StoryCard from '@/components/StoryCard'

const genres = [
  { key: 'romance', emoji: '💕' },
  { key: 'thriller', emoji: '🔪' },
  { key: 'horror', emoji: '👻' },
  { key: 'comedy', emoji: '😂' },
  { key: 'poetry', emoji: '✍️' },
  { key: 'biography', emoji: '📖' },
  { key: 'fantasy', emoji: '🧙' },
  { key: 'spiritual', emoji: '🕉️' },
  { key: 'general', emoji: '📚' },
]

const genreColors = [
  'from-pink-50 to-pink-100 text-pink-700 border-pink-200',
  'from-orange-50 to-orange-100 text-orange-700 border-orange-200',
  'from-red-50 to-red-100 text-red-700 border-red-200',
  'from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200',
  'from-purple-50 to-purple-100 text-purple-700 border-purple-200',
  'from-blue-50 to-blue-100 text-blue-700 border-blue-200',
  'from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200',
  'from-green-50 to-green-100 text-green-700 border-green-200',
  'from-gray-50 to-gray-100 text-gray-700 border-gray-200',
]

export default async function Home({ params }) {
  const { locale } = await params
  const supabase = await createClient()

  // Load translations on the server with the correct locale
  const t = await getTranslations({ locale, namespace: '' })

  const { data: { user } } = await supabase.auth.getUser()

  const { data: trending } = await supabase
    .from('stories')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('total_likes', { ascending: false })
    .limit(6)

  const { data: newest } = await supabase
    .from('stories')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} locale={locale} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
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
        </div>
      </section>

      {/* Stats */}
      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('home.stats_languages'), value: '3' },
            { label: t('home.stats_genres'), value: '9' },
            { label: t('home.stats_free'), value: '100%' },
            { label: t('home.stats_writers'), value: '✓' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-teal-600">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending stories */}
      {trending?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t('home.trending')}</h2>
            <Link href={`/${locale}/browse`} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map(story => (
              <StoryCard key={story.id} story={story} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Genres */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('home.genres')}</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {genres.map((g, i) => (
              <Link
                key={g.key}
                href={`/${locale}/browse?genre=${g.key}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border bg-gradient-to-b ${genreColors[i]} hover:shadow-sm transition-all`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {t(`genres.${g.key}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newest stories */}
      {newest?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t('home.new')}</h2>
            <Link href={`/${locale}/browse`} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newest.map(story => (
              <StoryCard key={story.id} story={story} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 mt-16">
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
        <div className="border-t border-gray-700 text-center text-xs py-4">
          © {new Date().getFullYear()} Kathavarta. {t('footer.copyright')}
        </div>
      </footer>
    </div>
  )
}