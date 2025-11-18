import { z } from 'zod'
import { LifeStage, InteractionStyle, TagSource } from '@prisma/client'

// Member validation schemas
export const createMemberSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
  displayName: z.string().min(1, 'Display name is required'),
  primaryEmail: z.string().email('Invalid email format'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  metaJson: z.record(z.any()).optional(),
})

export const updateSoulProfileSchema = z.object({
  lifeStage: z.nativeEnum(LifeStage).optional(),
  primaryArchetype: z.string().min(1).optional(),
  secondaryArchetype: z.string().optional(),
  values: z.array(z.string()).optional(),
})

export const updatePreferenceProfileSchema = z.object({
  interactionStyle: z.nativeEnum(InteractionStyle).optional(),
  contentFormatPrefs: z.record(z.any()).optional(),
  availability: z.record(z.any()).optional(),
})

export const ingestStatsEventSchema = z.object({
  type: z.enum(['session_attended', 'message_posted', 'quest_completed', 'streak_updated']),
  metadata: z.record(z.any()).optional(),
})

export const createTagSchema = z.object({
  tag: z.string().min(1),
  source: z.nativeEnum(TagSource).optional().default('SYSTEM'),
})
