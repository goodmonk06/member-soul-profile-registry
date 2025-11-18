import { MemberWithAllRelations } from '@/types'
import { InteractionStyle } from '@prisma/client'

/**
 * Generate insights about a member based on their profile and stats
 */
export function generateInsights(member: MemberWithAllRelations) {
  const stats = member.participationStats
  const preferences = member.preferenceProfile
  const soul = member.soulProfile

  // Calculate participation level
  let participationLevel: 'newcomer' | 'regular' | 'core' | 'veteran' = 'newcomer'

  if (stats) {
    const totalEngagement =
      stats.totalSessionsAttended +
      stats.totalMessagesPosted +
      stats.totalQuestsCompleted

    if (totalEngagement >= 100) {
      participationLevel = 'veteran'
    } else if (totalEngagement >= 50) {
      participationLevel = 'core'
    } else if (totalEngagement >= 10) {
      participationLevel = 'regular'
    }
  }

  // Determine engagement style
  let engagementStyle = 'balanced'

  if (stats) {
    const { totalSessionsAttended, totalMessagesPosted, totalQuestsCompleted } = stats

    if (totalMessagesPosted > totalSessionsAttended * 2) {
      engagementStyle = 'highly-vocal'
    } else if (totalSessionsAttended > totalMessagesPosted * 2) {
      engagementStyle = 'quiet-observer'
    } else if (totalQuestsCompleted > totalSessionsAttended) {
      engagementStyle = 'quest-focused'
    }
  }

  // Generate suggested tags based on heuristics
  const suggestedTags = generateHeuristicTags(member)

  return {
    participationLevel,
    engagementStyle,
    suggestedTags,
  }
}

/**
 * Generate heuristic tags based on member data
 * This is the core tagging logic that can be reused by other services
 */
export function generateHeuristicTags(member: MemberWithAllRelations): string[] {
  const tags: string[] = []
  const stats = member.participationStats
  const preferences = member.preferenceProfile

  if (!stats) return tags

  const { totalSessionsAttended, totalMessagesPosted, totalQuestsCompleted, streakDays } = stats

  // Participation patterns
  if (totalSessionsAttended >= 20 && totalMessagesPosted < 10) {
    tags.push('quiet-regular')
  }

  if (totalMessagesPosted > totalSessionsAttended * 2) {
    tags.push('highly-engaged')
  }

  if (streakDays >= 7) {
    tags.push('streak-keeper')
  }

  if (streakDays >= 30) {
    tags.push('committed-member')
  }

  // Burst vs consistent pattern
  const daysSinceJoin = Math.floor(
    (new Date().getTime() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  const avgActivityPerDay = (totalSessionsAttended + totalMessagesPosted + totalQuestsCompleted) / Math.max(daysSinceJoin, 1)

  if (avgActivityPerDay > 2) {
    tags.push('burst-type')
  } else if (avgActivityPerDay > 0.5) {
    tags.push('steady-contributor')
  }

  // Mentor potential
  if (totalSessionsAttended >= 50 && member.soulProfile?.lifeStage === 'MENTOR') {
    tags.push('mentor-potential')
  }

  if (totalQuestsCompleted >= 20) {
    tags.push('quest-master')
  }

  // Interaction style based tags
  if (preferences?.interactionStyle === InteractionStyle.DEEP) {
    tags.push('deep-thinker')
  }

  if (preferences?.interactionStyle === InteractionStyle.FAST) {
    tags.push('quick-responder')
  }

  return tags
}
