import { prisma } from '@/lib/prisma'
import { StatsEvent } from '@/types'

/**
 * Ingest a stats event and update participation stats accordingly
 */
export async function ingestStatsEvent(memberId: string, event: StatsEvent) {
  const timestamp = event.timestamp || new Date()

  // Get or create stats record
  let stats = await prisma.participationStats.findUnique({
    where: { memberId },
  })

  if (!stats) {
    stats = await prisma.participationStats.create({
      data: {
        memberId,
        lastActiveAt: timestamp,
      },
    })
  }

  // Calculate streak
  const daysSinceLastActive = Math.floor(
    (timestamp.getTime() - stats.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  let newStreakDays = stats.streakDays

  if (daysSinceLastActive === 1) {
    // Consecutive day
    newStreakDays += 1
  } else if (daysSinceLastActive === 0) {
    // Same day, keep streak
    newStreakDays = stats.streakDays
  } else if (daysSinceLastActive > 1) {
    // Broke the streak
    newStreakDays = 1
  }

  // Update stats based on event type
  const updateData: any = {
    lastActiveAt: timestamp,
    streakDays: newStreakDays,
  }

  switch (event.type) {
    case 'session_attended':
      updateData.totalSessionsAttended = stats.totalSessionsAttended + 1
      break
    case 'message_posted':
      updateData.totalMessagesPosted = stats.totalMessagesPosted + 1
      break
    case 'quest_completed':
      updateData.totalQuestsCompleted = stats.totalQuestsCompleted + 1
      break
    case 'streak_updated':
      // Streak already calculated above
      break
  }

  // Merge metadata if provided
  if (event.metadata) {
    const currentMeta = (stats.metaJson as Record<string, any>) || {}
    updateData.metaJson = {
      ...currentMeta,
      ...event.metadata,
    }
  }

  return prisma.participationStats.update({
    where: { memberId },
    data: updateData,
  })
}

/**
 * Get stats summary for a member
 */
export async function getMemberStats(memberId: string) {
  return prisma.participationStats.findUnique({
    where: { memberId },
  })
}

/**
 * Get top members by specific metric
 */
export async function getTopMembers(metric: 'sessions' | 'messages' | 'quests' | 'streak', limit = 10) {
  const orderBy: any = {}

  switch (metric) {
    case 'sessions':
      orderBy.totalSessionsAttended = 'desc'
      break
    case 'messages':
      orderBy.totalMessagesPosted = 'desc'
      break
    case 'quests':
      orderBy.totalQuestsCompleted = 'desc'
      break
    case 'streak':
      orderBy.streakDays = 'desc'
      break
  }

  return prisma.participationStats.findMany({
    orderBy,
    take: limit,
    include: {
      member: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })
}
