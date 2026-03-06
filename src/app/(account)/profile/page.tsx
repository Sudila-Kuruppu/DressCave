import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-client'
import Link from 'next/link'
import { ProfileForm } from '@/components/auth/ProfileForm'

interface MeasurementData {
  unit_system: string
  height?: string | null
  bust?: string | null
  waist?: string | null
  hips?: string | null
  inseam?: string | null
  shoulders?: string | null
  sleeve_length?: string | null
  dress_length?: string | null
  updated_at: string
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/profile')
  }

  // Fetch user profile data on server side
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user measurements
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: MeasurementData | null }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Form Section - Editable */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ProfileForm
              userId={user.id}
              userEmail={user.email || ''}
              initialProfile={profile || undefined}
            />
          </div>

          {/* Measurements Section - Display Only */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Measurements</h2>
              <Link
                href="/measurements"
                className="inline-flex items-center px-4 py-2 bg-[#FF6F61] text-white rounded-md hover:bg-[#E86355] focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] focus:ring-offset-2"
              >
                Edit Measurements
              </Link>
            </div>

            {measurements ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <label className="text-sm font-medium text-gray-700">Unit System</label>
                    <p className="text-gray-900 font-semibold">{measurements.unit_system === 'inches' ? 'Inches' : 'Centimeters'}</p>
                  </div>
                  {measurements.height && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Height</label>
                      <p className="text-gray-900 font-semibold">{measurements.height} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.bust && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Bust</label>
                      <p className="text-gray-900 font-semibold">{measurements.bust} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.waist && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Waist</label>
                      <p className="text-gray-900 font-semibold">{measurements.waist} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.hips && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Hips</label>
                      <p className="text-gray-900 font-semibold">{measurements.hips} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.inseam && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Inseam</label>
                      <p className="text-gray-900 font-semibold">{measurements.inseam} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.shoulders && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Shoulders</label>
                      <p className="text-gray-900 font-semibold">{measurements.shoulders} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.sleeve_length && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Sleeve Length</label>
                      <p className="text-gray-900 font-semibold">{measurements.sleeve_length} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                  {measurements.dress_length && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-700">Dress Length</label>
                      <p className="text-gray-900 font-semibold">{measurements.dress_length} {measurements.unit_system === 'inches' ? 'in' : 'cm'}</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Last updated: {new Date(measurements.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't saved your measurements yet.</p>
                <Link
                  href="/measurements"
                  className="inline-flex items-center px-4 py-2 bg-[#FF6F61] text-white rounded-md hover:bg-[#E86355] focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] focus:ring-offset-2"
                >
                  Add Your Measurements
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Account Navigation Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
          <nav className="space-y-3">
            <Link
              href="/profile"
              className="block text-[#FF6F61] hover:text-[#E86355] font-medium"
              aria-current="page"
            >
              My Profile
            </Link>
            <Link
              href="/measurements"
              className="block text-[#4FA1A0] hover:text-[#5DB8B7] font-medium"
            >
              My Measurements
            </Link>
            <Link
              href="/"
              className="block text-[#4FA1A0] hover:text-[#5DB8B7] font-medium"
            >
              ← Back to Shop
            </Link>
          </nav>
        </div>
      </div>
    </main>
  )
}

export const metadata = {
  title: 'My Profile - DressCave',
  description: 'View and manage your profile and measurements',
}
