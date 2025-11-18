import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { emitCohortCreated, emitMemberJoinedCohort } from '@/lib/events'
import { businessMetrics } from '@/lib/metrics'

export interface CreateCohortData {
  name: string
  description?: string
  criteria?: Record<string, any>
  metadata?: Record<string, any>
}

export interface UpdateCohortData {
  name?: string
  description?: string
  criteria?: Record<string, any>
  metadata?: Record<string, any>
  isActive?: boolean
}

/**
 * Create a new cohort
 */
export async function createCohort(data: CreateCohortData) {
  logger.info('Creating new cohort', { name: data.name })

  const cohort = await prisma.cohort.create({
    data: {
      name: data.name,
      description: data.description,
      criteria: data.criteria,
      metadata: data.metadata,
    },
    include: {
      memberships: {
        include: {
          member: true,
        },
      },
    },
  })

  businessMetrics.cohortCreated()
  await emitCohortCreated(cohort.id, cohort)

  return cohort
}

/**
 * Get cohort by ID
 */
export async function getCohortById(id: string) {
  return prisma.cohort.findUnique({
    where: { id },
    include: {
      memberships: {
        where: { leftAt: null },
        include: {
          member: {
            include: {
              soulProfile: true,
              participationStats: true,
            },
          },
        },
      },
    },
  })
}

/**
 * List all cohorts
 */
export async function listCohorts(params?: {
  skip?: number
  take?: number
  isActive?: boolean
}) {
  const where = params?.isActive !== undefined
    ? { isActive: params.isActive }
    : {}

  const [cohorts, total] = await Promise.all([
    prisma.cohort.findMany({
      where,
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      skip: params?.skip || 0,
      take: params?.take || 50,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.cohort.count({ where }),
  ])

  return { cohorts, total }
}

/**
 * Update a cohort
 */
export async function updateCohort(id: string, data: UpdateCohortData) {
  logger.info('Updating cohort', { cohortId: id })

  return prisma.cohort.update({
    where: { id },
    data,
  })
}

/**
 * Add a member to a cohort
 */
export async function addMemberToCohort(cohortId: string, memberId: string, metadata?: Record<string, any>) {
  logger.info('Adding member to cohort', { cohortId, memberId })

  const membership = await prisma.cohortMembership.create({
    data: {
      cohortId,
      memberId,
      metadata,
    },
    include: {
      cohort: true,
      member: true,
    },
  })

  await emitMemberJoinedCohort(memberId, cohortId)

  return membership
}

/**
 * Remove a member from a cohort
 */
export async function removeMemberFromCohort(cohortId: string, memberId: string) {
  logger.info('Removing member from cohort', { cohortId, memberId })

  return prisma.cohortMembership.updateMany({
    where: {
      cohortId,
      memberId,
      leftAt: null,
    },
    data: {
      leftAt: new Date(),
    },
  })
}

/**
 * Get members in a cohort
 */
export async function getCohortMembers(cohortId: string) {
  return prisma.cohortMembership.findMany({
    where: {
      cohortId,
      leftAt: null,
    },
    include: {
      member: {
        include: {
          soulProfile: true,
          participationStats: true,
          tags: true,
        },
      },
    },
  })
}

/**
 * Auto-assign members to cohorts based on criteria
 */
export async function autoAssignToCohorts(memberId: string) {
  logger.info('Auto-assigning member to cohorts', { memberId })

  const member = await prisma.memberCore.findUnique({
    where: { id: memberId },
    include: {
      soulProfile: true,
      participationStats: true,
      tags: true,
    },
  })

  if (!member) {
    return []
  }

  // Get all active cohorts with criteria
  const cohorts = await prisma.cohort.findMany({
    where: {
      isActive: true,
      criteria: { not: null },
    },
  })

  const assignments = []

  for (const cohort of cohorts) {
    const criteria = cohort.criteria as Record<string, any>

    // Simple criteria matching (can be extended)
    let matches = true

    if (criteria.lifeStage && member.soulProfile?.lifeStage !== criteria.lifeStage) {
      matches = false
    }

    if (criteria.minSessions && (member.participationStats?.totalSessionsAttended || 0) < criteria.minSessions) {
      matches = false
    }

    if (criteria.tags && Array.isArray(criteria.tags)) {
      const memberTags = member.tags.map(t => t.tag)
      const hasRequiredTags = criteria.tags.every((tag: string) => memberTags.includes(tag))
      if (!hasRequiredTags) {
        matches = false
      }
    }

    if (matches) {
      try {
        const membership = await addMemberToCohort(cohort.id, memberId, {
          assignedBy: 'auto',
          criteria: criteria,
        })
        assignments.push(membership)
      } catch (error) {
        // Membership might already exist
        logger.warn('Could not add member to cohort', { cohortId: cohort.id, memberId, error })
      }
    }
  }

  return assignments
}

/**
 * Delete a cohort
 */
export async function deleteCohort(id: string) {
  logger.info('Deleting cohort', { cohortId: id })

  return prisma.cohort.delete({
    where: { id },
  })
}
