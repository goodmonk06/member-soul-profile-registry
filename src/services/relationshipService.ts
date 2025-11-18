import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { emitRelationshipEstablished } from '@/lib/events'
import { businessMetrics } from '@/lib/metrics'
import { RelationshipType, RelationshipStatus } from '@prisma/client'

export interface CreateRelationshipData {
  fromMemberId: string
  toMemberId: string
  relationshipType: RelationshipType
  strength?: number
  status?: RelationshipStatus
  metadata?: Record<string, any>
}

export interface UpdateRelationshipData {
  strength?: number
  status?: RelationshipStatus
  metadata?: Record<string, any>
}

/**
 * Establish a relationship between two members
 */
export async function establishRelationship(data: CreateRelationshipData) {
  logger.info('Establishing relationship', {
    from: data.fromMemberId,
    to: data.toMemberId,
    type: data.relationshipType,
  })

  const relationship = await prisma.memberRelationship.create({
    data: {
      fromMemberId: data.fromMemberId,
      toMemberId: data.toMemberId,
      relationshipType: data.relationshipType,
      strength: data.strength || 1,
      status: data.status || RelationshipStatus.ACTIVE,
      metadata: data.metadata,
    },
    include: {
      fromMember: {
        include: {
          soulProfile: true,
        },
      },
      toMember: {
        include: {
          soulProfile: true,
        },
      },
    },
  })

  businessMetrics.relationshipEstablished(data.relationshipType)
  await emitRelationshipEstablished(data.fromMemberId, data.toMemberId, data.relationshipType)

  return relationship
}

/**
 * Get a specific relationship
 */
export async function getRelationship(fromMemberId: string, toMemberId: string, type: RelationshipType) {
  return prisma.memberRelationship.findUnique({
    where: {
      fromMemberId_toMemberId_relationshipType: {
        fromMemberId,
        toMemberId,
        relationshipType: type,
      },
    },
    include: {
      fromMember: {
        include: {
          soulProfile: true,
        },
      },
      toMember: {
        include: {
          soulProfile: true,
        },
      },
    },
  })
}

/**
 * Get all relationships for a member
 */
export async function getMemberRelationships(
  memberId: string,
  options?: {
    type?: RelationshipType
    status?: RelationshipStatus
    direction?: 'from' | 'to' | 'both'
  }
) {
  const direction = options?.direction || 'both'
  const whereClause: any = {
    AND: [],
  }

  if (options?.type) {
    whereClause.AND.push({ relationshipType: options.type })
  }

  if (options?.status) {
    whereClause.AND.push({ status: options.status })
  }

  const queries = []

  if (direction === 'from' || direction === 'both') {
    queries.push(
      prisma.memberRelationship.findMany({
        where: {
          fromMemberId: memberId,
          ...whereClause,
        },
        include: {
          toMember: {
            include: {
              soulProfile: true,
              participationStats: true,
            },
          },
        },
      })
    )
  }

  if (direction === 'to' || direction === 'both') {
    queries.push(
      prisma.memberRelationship.findMany({
        where: {
          toMemberId: memberId,
          ...whereClause,
        },
        include: {
          fromMember: {
            include: {
              soulProfile: true,
              participationStats: true,
            },
          },
        },
      })
    )
  }

  const results = await Promise.all(queries)
  return results.flat()
}

/**
 * Update a relationship
 */
export async function updateRelationship(
  fromMemberId: string,
  toMemberId: string,
  type: RelationshipType,
  data: UpdateRelationshipData
) {
  logger.info('Updating relationship', { from: fromMemberId, to: toMemberId, type })

  return prisma.memberRelationship.update({
    where: {
      fromMemberId_toMemberId_relationshipType: {
        fromMemberId,
        toMemberId,
        relationshipType: type,
      },
    },
    data,
  })
}

/**
 * End a relationship
 */
export async function endRelationship(fromMemberId: string, toMemberId: string, type: RelationshipType) {
  logger.info('Ending relationship', { from: fromMemberId, to: toMemberId, type })

  return updateRelationship(fromMemberId, toMemberId, type, {
    status: RelationshipStatus.ENDED,
  })
}

/**
 * Find similar members based on values and archetype
 */
export async function findSimilarMembers(memberId: string, limit: number = 10) {
  const member = await prisma.memberCore.findUnique({
    where: { id: memberId },
    include: {
      soulProfile: true,
    },
  })

  if (!member || !member.soulProfile) {
    return []
  }

  const memberValues = member.soulProfile.valuesJson as string[]

  // Find members with overlapping values
  const allMembers = await prisma.memberCore.findMany({
    where: {
      id: { not: memberId },
      soulProfile: {
        isNot: null,
      },
    },
    include: {
      soulProfile: true,
      participationStats: true,
    },
  })

  // Calculate similarity scores
  const scored = allMembers.map(other => {
    let score = 0
    const otherValues = (other.soulProfile?.valuesJson as string[]) || []

    // Value overlap
    const overlap = memberValues.filter(v => otherValues.includes(v))
    score += overlap.length * 3

    // Same archetype
    if (other.soulProfile?.primaryArchetype === member.soulProfile.primaryArchetype) {
      score += 5
    }

    // Same life stage
    if (other.soulProfile?.lifeStage === member.soulProfile.lifeStage) {
      score += 2
    }

    return { member: other, score }
  })

  // Sort by score and return top matches
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.member)
}

/**
 * Suggest mentor matches for a member
 */
export async function suggestMentors(menteeId: string, limit: number = 5) {
  const mentee = await prisma.memberCore.findUnique({
    where: { id: menteeId },
    include: {
      soulProfile: true,
    },
  })

  if (!mentee || !mentee.soulProfile) {
    return []
  }

  // Find potential mentors (MENTOR or ELDER life stage)
  const potentialMentors = await prisma.memberCore.findMany({
    where: {
      id: { not: menteeId },
      soulProfile: {
        lifeStage: {
          in: ['MENTOR', 'ELDER'],
        },
      },
      participationStats: {
        totalSessionsAttended: {
          gte: 20, // Experienced members
        },
      },
    },
    include: {
      soulProfile: true,
      participationStats: true,
      tags: true,
    },
  })

  const menteeValues = (mentee.soulProfile.valuesJson as string[]) || []

  // Score potential mentors
  const scored = potentialMentors.map(mentor => {
    let score = 0
    const mentorValues = (mentor.soulProfile?.valuesJson as string[]) || []

    // Value alignment
    const overlap = menteeValues.filter(v => mentorValues.includes(v))
    score += overlap.length * 2

    // Has mentor-potential tag
    if (mentor.tags.some(t => t.tag === 'mentor-potential')) {
      score += 10
    }

    // High participation
    if (mentor.participationStats && mentor.participationStats.totalSessionsAttended > 50) {
      score += 5
    }

    return { mentor, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.mentor)
}

/**
 * Delete a relationship
 */
export async function deleteRelationship(fromMemberId: string, toMemberId: string, type: RelationshipType) {
  logger.info('Deleting relationship', { from: fromMemberId, to: toMemberId, type })

  return prisma.memberRelationship.delete({
    where: {
      fromMemberId_toMemberId_relationshipType: {
        fromMemberId,
        toMemberId,
        relationshipType: type,
      },
    },
  })
}
