import { prisma } from '@/lib/prisma'
import {
  CreateMemberRequest,
  UpdateSoulProfileRequest,
  UpdatePreferenceProfileRequest,
  MemberWithAllRelations,
  AggregatedSoulProfile
} from '@/types'
import { LifeStage, InteractionStyle } from '@prisma/client'
import { generateInsights } from './insightService'

/**
 * Create a new member with default profiles
 */
export async function createMember(data: CreateMemberRequest) {
  const member = await prisma.memberCore.create({
    data: {
      externalId: data.externalId,
      displayName: data.displayName,
      primaryEmail: data.primaryEmail,
      avatarUrl: data.avatarUrl,
      metaJson: data.metaJson,
      // Create default profiles
      soulProfile: {
        create: {
          lifeStage: LifeStage.SEEDLING,
          primaryArchetype: 'The Explorer',
          valuesJson: ['curiosity', 'growth'],
        },
      },
      preferenceProfile: {
        create: {
          interactionStyle: InteractionStyle.ACTIVE,
        },
      },
      participationStats: {
        create: {
          totalSessionsAttended: 0,
          totalMessagesPosted: 0,
          totalQuestsCompleted: 0,
        },
      },
    },
    include: {
      soulProfile: true,
      preferenceProfile: true,
      participationStats: true,
      tags: true,
    },
  })

  return member
}

/**
 * Get member by ID with all relations
 */
export async function getMemberById(id: string): Promise<MemberWithAllRelations | null> {
  return prisma.memberCore.findUnique({
    where: { id },
    include: {
      soulProfile: true,
      preferenceProfile: true,
      participationStats: true,
      tags: true,
    },
  })
}

/**
 * Get member by external ID
 */
export async function getMemberByExternalId(externalId: string): Promise<MemberWithAllRelations | null> {
  return prisma.memberCore.findUnique({
    where: { externalId },
    include: {
      soulProfile: true,
      preferenceProfile: true,
      participationStats: true,
      tags: true,
    },
  })
}

/**
 * List all members with pagination
 */
export async function listMembers(params?: {
  skip?: number
  take?: number
  lifeStage?: LifeStage
}) {
  const where = params?.lifeStage
    ? { soulProfile: { lifeStage: params.lifeStage } }
    : {}

  const [members, total] = await Promise.all([
    prisma.memberCore.findMany({
      where,
      include: {
        soulProfile: true,
        preferenceProfile: true,
        participationStats: true,
        tags: true,
      },
      skip: params?.skip || 0,
      take: params?.take || 50,
      orderBy: {
        participationStats: {
          lastActiveAt: 'desc',
        },
      },
    }),
    prisma.memberCore.count({ where }),
  ])

  return { members, total }
}

/**
 * Update member's soul profile
 */
export async function updateSoulProfile(memberId: string, data: UpdateSoulProfileRequest) {
  // Check if soul profile exists
  const existing = await prisma.soulProfile.findUnique({
    where: { memberId },
  })

  if (!existing) {
    // Create if doesn't exist
    return prisma.soulProfile.create({
      data: {
        memberId,
        lifeStage: data.lifeStage || LifeStage.SEEDLING,
        primaryArchetype: data.primaryArchetype || 'The Explorer',
        secondaryArchetype: data.secondaryArchetype,
        valuesJson: data.values || [],
      },
    })
  }

  // Update existing
  const updateData: any = {}
  if (data.lifeStage) updateData.lifeStage = data.lifeStage
  if (data.primaryArchetype) updateData.primaryArchetype = data.primaryArchetype
  if (data.secondaryArchetype !== undefined) updateData.secondaryArchetype = data.secondaryArchetype
  if (data.values) updateData.valuesJson = data.values

  return prisma.soulProfile.update({
    where: { memberId },
    data: updateData,
  })
}

/**
 * Update member's preference profile
 */
export async function updatePreferenceProfile(
  memberId: string,
  data: UpdatePreferenceProfileRequest
) {
  // Check if preference profile exists
  const existing = await prisma.preferenceProfile.findUnique({
    where: { memberId },
  })

  if (!existing) {
    // Create if doesn't exist
    return prisma.preferenceProfile.create({
      data: {
        memberId,
        interactionStyle: data.interactionStyle || InteractionStyle.ACTIVE,
        contentFormatPrefsJson: data.contentFormatPrefs,
        availabilityJson: data.availability,
      },
    })
  }

  // Update existing
  const updateData: any = {}
  if (data.interactionStyle) updateData.interactionStyle = data.interactionStyle
  if (data.contentFormatPrefs !== undefined) updateData.contentFormatPrefsJson = data.contentFormatPrefs
  if (data.availability !== undefined) updateData.availabilityJson = data.availability

  return prisma.preferenceProfile.update({
    where: { memberId },
    data: updateData,
  })
}

/**
 * Get aggregated soul profile with insights
 */
export async function getAggregatedSoulProfile(memberId: string): Promise<AggregatedSoulProfile | null> {
  const member = await getMemberById(memberId)

  if (!member) {
    return null
  }

  const insights = generateInsights(member)

  return {
    core: member,
    soulProfile: member.soulProfile,
    preferenceProfile: member.preferenceProfile,
    participationStats: member.participationStats,
    tags: member.tags,
    insights,
  }
}

/**
 * Delete a member and all related data
 */
export async function deleteMember(memberId: string) {
  return prisma.memberCore.delete({
    where: { id: memberId },
  })
}
