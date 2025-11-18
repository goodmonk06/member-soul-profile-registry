import { getAggregatedSoulProfile } from '@/services/memberService'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface MemberDetailPageProps {
  params: {
    id: string
  }
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const profile = await getAggregatedSoulProfile(params.id)

  if (!profile) {
    notFound()
  }

  const { core, soulProfile, preferenceProfile, participationStats, tags, insights } = profile

  // Life stage emoji mapping
  const lifeStageEmoji: Record<string, string> = {
    SEEDLING: '🌱',
    GROWING: '🌿',
    MENTOR: '🌳',
    ELDER: '🏔️',
  }

  // Participation level color
  const participationLevelColors: Record<string, string> = {
    newcomer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    regular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    core: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    veteran: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/members"
        className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-6"
      >
        ← Back to Members
      </Link>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            {core.avatarUrl ? (
              <img
                src={core.avatarUrl}
                alt={core.displayName}
                className="w-20 h-20 rounded-full mr-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-4 flex items-center justify-center text-white font-bold text-3xl">
                {core.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {core.displayName}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">{core.primaryEmail}</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Member since {new Date(core.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              participationLevelColors[insights.participationLevel]
            }`}
          >
            {insights.participationLevel.charAt(0).toUpperCase() + insights.participationLevel.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Soul Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            {soulProfile && lifeStageEmoji[soulProfile.lifeStage]} Soul Profile
          </h2>
          {soulProfile ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Life Stage</label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {soulProfile.lifeStage}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Primary Archetype</label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {soulProfile.primaryArchetype}
                </p>
              </div>
              {soulProfile.secondaryArchetype && (
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">
                    Secondary Archetype
                  </label>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {soulProfile.secondaryArchetype}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                  Core Values
                </label>
                <div className="flex flex-wrap gap-2">
                  {(soulProfile.valuesJson as string[]).map((value: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No soul profile data</p>
          )}
        </div>

        {/* Participation Stats Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            📊 Participation Stats
          </h2>
          {participationStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {participationStats.totalSessionsAttended}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Sessions</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {participationStats.totalMessagesPosted}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Messages</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {participationStats.totalQuestsCompleted}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Quests</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {participationStats.streakDays} 🔥
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Day Streak</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Last active:{' '}
                  {new Date(participationStats.lastActiveAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No participation data</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preferences Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            ⚙️ Preferences
          </h2>
          {preferenceProfile ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Interaction Style
                </label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {preferenceProfile.interactionStyle}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Engagement Style
                </label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {insights.engagementStyle}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No preference data</p>
          )}
        </div>

        {/* Tags Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            🏷️ Tags
          </h2>
          <div className="space-y-3">
            {tags.length > 0 && (
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                  Current Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm"
                    >
                      {tag.tag}
                      <span className="ml-1 text-xs text-slate-500">({tag.source})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {insights.suggestedTags.length > 0 && (
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                  Suggested Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {insights.suggestedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tags.length === 0 && insights.suggestedTags.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400">No tags</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
