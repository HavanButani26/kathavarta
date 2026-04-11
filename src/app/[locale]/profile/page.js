import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProfileForm from '@/components/ProfileForm'
import Link from 'next/link'
import { User, BookOpen, Library, Settings } from 'lucide-react'

export default async function ProfilePage({ params }) {
    const { locale } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: stories } = await supabase
        .from('stories')
        .select('id, title, status, total_reads, total_likes')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    const totalReads = stories?.reduce((s, st) => s + (st.total_reads || 0), 0) || 0
    const totalLikes = stories?.reduce((s, st) => s + (st.total_likes || 0), 0) || 0
    const published = stories?.filter(s => s.status === 'published').length || 0

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} locale={locale} />

            <div className="max-w-4xl mx-auto px-4 py-10">

                <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <Settings size={22} className="text-teal-600" />
                    My Profile
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Stats */}
                    <div className="md:col-span-1 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 text-2xl font-bold mb-4">
                                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-bold text-gray-800">{profile?.full_name || 'Writer'}</p>
                            <p className="text-sm text-gray-400 mb-4">@{profile?.username}</p>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Stories', value: stories?.length || 0, icon: <BookOpen size={14} /> },
                                    { label: 'Published', value: published, icon: <BookOpen size={14} /> },
                                    { label: 'Total Reads', value: totalReads, icon: <User size={14} /> },
                                    { label: 'Total Likes', value: totalLikes, icon: <User size={14} /> },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-lg font-bold text-teal-600">{stat.value}</p>
                                        <p className="text-xs text-gray-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Links</p>
                            <div className="flex flex-col gap-1">
                                <Link href={`/${locale}/write`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 py-2 transition-colors">
                                    <BookOpen size={14} /> My Stories
                                </Link>
                                <Link href={`/${locale}/library`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 py-2 transition-colors">
                                    <Library size={14} /> My Library
                                </Link>
                                <Link href={`/${locale}/author/${profile?.username}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 py-2 transition-colors">
                                    <User size={14} /> Public Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Edit form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="font-semibold text-gray-800 mb-5">Edit Profile</h2>
                            <ProfileForm profile={profile} userId={user.id} locale={locale} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}