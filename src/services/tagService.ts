import { prisma } from '@/lib/prisma'
import { TagSource } from '@prisma/client'

/**
 * Add a tag to a member
 */
export async function addTag(memberId: string, tag: string, source: TagSource = 'SYSTEM') {
  return prisma.tagAttachment.upsert({
    where: {
      memberId_tag: {
        memberId,
        tag,
      },
    },
    create: {
      memberId,
      tag,
      source,
    },
    update: {
      source, // Update source if tag already exists
    },
  })
}

/**
 * Remove a tag from a member
 */
export async function removeTag(memberId: string, tag: string) {
  return prisma.tagAttachment.delete({
    where: {
      memberId_tag: {
        memberId,
        tag,
      },
    },
  })
}

/**
 * Get all tags for a member
 */
export async function getMemberTags(memberId: string) {
  return prisma.tagAttachment.findMany({
    where: { memberId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Find members by tag
 */
export async function findMembersByTag(tag: string) {
  return prisma.memberCore.findMany({
    where: {
      tags: {
        some: { tag },
      },
    },
    include: {
      soulProfile: true,
      participationStats: true,
      tags: true,
    },
  })
}

/**
 * Get all unique tags in the system
 */
export async function getAllTags() {
  const tags = await prisma.tagAttachment.findMany({
    select: {
      tag: true,
    },
    distinct: ['tag'],
  })

  return tags.map(t => t.tag)
}
