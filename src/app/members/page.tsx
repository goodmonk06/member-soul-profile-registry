import { listMembers } from '@/services/memberService'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const { members, total } = await listMembers({ take: 100 })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Community Members
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Total members: {total}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const stats = member.participationStats
          const soul = member.soulProfile

          // Calculate participation badge
          let participationBadge = 'Newcomer'
          let badgeColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'

          if (stats) {
            const totalEngagement =
              stats.totalSessionsAttended +
              stats.totalMessagesPosted +
              stats.totalQuestsCompleted

            if (totalEngagement >= 100) {
              participationBadge = 'Veteran'
              badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            } else if (totalEngagement >= 50) {
              participationBadge = 'Core Member'
              badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            } else if (totalEngagement >= 10) {
              participationBadge = 'Regular'
              badgeColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }
          }

          return (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="block bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3 flex items-center justify-center text-white font-bold text-lg">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {member.displayName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {soul?.primaryArchetype || 'Explorer'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                  {participationBadge}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Life Stage:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {soul?.lifeStage || 'SEEDLING'}
                  </span>
                </div>
                {stats && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Sessions:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {stats.totalSessionsAttended}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Messages:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {stats.totalMessagesPosted}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Quests:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {stats.totalQuestsCompleted}
                      </span>
                    </div>
                    {stats.streakDays > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Streak:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {stats.streakDays} days 🔥
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {member.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {member.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                      +{member.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No members found. Create your first member to get started!
          </p>
        </div>
      )}
    </div>
  )
}
