import {
  MemberCore,
  SoulProfile,
  PreferenceProfile,
  ParticipationStats,
  TagAttachment,
  LifeStage,
  InteractionStyle,
  TagSource
} from '@prisma/client'

// Re-export Prisma types
export type {
  MemberCore,
  SoulProfile,
  PreferenceProfile,
  ParticipationStats,
  TagAttachment
}
export { LifeStage, InteractionStyle, TagSource }

// Aggregated profile view combining all member data
export interface AggregatedSoulProfile {
  core: MemberCore
  soulProfile: SoulProfile | null
  preferenceProfile: PreferenceProfile | null
  participationStats: ParticipationStats | null
  tags: TagAttachment[]
  insights: {
    participationLevel: 'newcomer' | 'regular' | 'core' | 'veteran'
    engagementStyle: string
    suggestedTags: string[]
  }
}

// Event types for stats ingestion
export type StatsEventType =
  | 'session_attended'
  | 'message_posted'
  | 'quest_completed'
  | 'streak_updated'

export interface StatsEvent {
  type: StatsEventType
  metadata?: Record<string, any>
  timestamp?: Date
}

// API Request/Response types
export interface CreateMemberRequest {
  externalId: string
  displayName: string
  primaryEmail: string
  avatarUrl?: string
  metaJson?: Record<string, any>
}

export interface UpdateSoulProfileRequest {
  lifeStage?: LifeStage
  primaryArchetype?: string
  secondaryArchetype?: string
  values?: string[]
}

export interface UpdatePreferenceProfileRequest {
  interactionStyle?: InteractionStyle
  contentFormatPrefs?: Record<string, any>
  availability?: Record<string, any>
}

export interface IngestStatsEventRequest {
  type: StatsEventType
  metadata?: Record<string, any>
}

// Utility types
export type MemberWithAllRelations = MemberCore & {
  soulProfile: SoulProfile | null
  preferenceProfile: PreferenceProfile | null
  participationStats: ParticipationStats | null
  tags: TagAttachment[]
}
