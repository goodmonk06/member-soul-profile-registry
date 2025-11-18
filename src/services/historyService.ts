import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { HistoryEventType } from '@prisma/client'

export interface CreateHistoryEntryData {
  memberId: string
  eventType: HistoryEventType
  title: string
  description?: string
  metadata?: Record<string, any>
  occurredAt?: Date
}

/**
 * Create a history entry for a member
 */
export async function createHistoryEntry(data: CreateHistoryEntryData) {
  logger.info('Creating history entry', {
    memberId: data.memberId,
    eventType: data.eventType,
  })

  return prisma.memberHistory.create({
    data: {
      memberId: data.memberId,
      eventType: data.eventType,
      title: data.title,
      description: data.description,
      metadata: data.metadata,
      occurredAt: data.occurredAt || new Date(),
    },
  })
}

/**
 * Get member history
 */
export async function getMemberHistory(
  memberId: string,
  options?: {
    eventType?: HistoryEventType
    limit?: number
    offset?: number
  }
) {
  const where: any = { memberId }

  if (options?.eventType) {
    where.eventType = options.eventType
  }

  return prisma.memberHistory.findMany({
    where,
    orderBy: {
      occurredAt: 'desc',
    },
    skip: options?.offset || 0,
    take: options?.limit || 50,
  })
}

/**
 * Create a profile snapshot
 */
export async function createProfileSnapshot(memberId: string, reason?: string) {
  logger.info('Creating profile snapshot', { memberId, reason })

  const member = await prisma.memberCore.findUnique({
    where: { id: memberId },
    include: {
      soulProfile: true,
      participationStats: true,
      tags: true,
    },
  })

  if (!member || !member.soulProfile) {
    throw new Error('Member or soul profile not found')
  }

  return prisma.profileSnapshot.create({
    data: {
      memberId,
      lifeStage: member.soulProfile.lifeStage,
      primaryArchetype: member.soulProfile.primaryArchetype,
      secondaryArchetype: member.soulProfile.secondaryArchetype,
      valuesJson: member.soulProfile.valuesJson,
      statsSnapshot: {
        totalSessionsAttended: member.participationStats?.totalSessionsAttended || 0,
        totalMessagesPosted: member.participationStats?.totalMessagesPosted || 0,
        totalQuestsCompleted: member.participationStats?.totalQuestsCompleted || 0,
        streakDays: member.participationStats?.streakDays || 0,
      },
      tagsSnapshot: member.tags.map(t => ({
        tag: t.tag,
        source: t.source,
      })),
      snapshotReason: reason,
    },
  })
}

/**
 * Get member snapshots
 */
export async function getMemberSnapshots(memberId: string, limit: number = 10) {
  return prisma.profileSnapshot.findMany({
    where: { memberId },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Compare two snapshots
 */
export async function compareSnapshots(snapshotId1: string, snapshotId2: string) {
  const [snapshot1, snapshot2] = await Promise.all([
    prisma.profileSnapshot.findUnique({ where: { id: snapshotId1 } }),
    prisma.profileSnapshot.findUnique({ where: { id: snapshotId2 } }),
  ])

  if (!snapshot1 || !snapshot2) {
    throw new Error('One or both snapshots not found')
  }

  return {
    snapshot1,
    snapshot2,
    changes: {
      lifeStage: snapshot1.lifeStage !== snapshot2.lifeStage
        ? { from: snapshot1.lifeStage, to: snapshot2.lifeStage }
        : null,
      primaryArchetype: snapshot1.primaryArchetype !== snapshot2.primaryArchetype
        ? { from: snapshot1.primaryArchetype, to: snapshot2.primaryArchetype }
        : null,
      values: {
        added: [],
        removed: [],
      },
      // Add more comparisons as needed
    },
  }
}

/**
 * Record engagement event
 */
export async function recordEngagementEvent(data: {
  memberId: string
  eventType: any
  sessionId?: string
  questId?: string
  relatedMemberId?: string
  duration?: number
  metadata?: Record<string, any>
}) {
  logger.info('Recording engagement event', {
    memberId: data.memberId,
    eventType: data.eventType,
  })

  return prisma.engagementEvent.create({
    data: {
      memberId: data.memberId,
      eventType: data.eventType,
      sessionId: data.sessionId,
      questId: data.questId,
      relatedMemberId: data.relatedMemberId,
      duration: data.duration,
      metadata: data.metadata,
    },
  })
}

/**
 * Get member engagement timeline
 */
export async function getMemberEngagementTimeline(
  memberId: string,
  options?: {
    limit?: number
    offset?: number
    eventType?: any
  }
) {
  const where: any = { memberId }

  if (options?.eventType) {
    where.eventType = options.eventType
  }

  return prisma.engagementEvent.findMany({
    where,
    orderBy: {
      occurredAt: 'desc',
    },
    skip: options?.offset || 0,
    take: options?.limit || 50,
  })
}
