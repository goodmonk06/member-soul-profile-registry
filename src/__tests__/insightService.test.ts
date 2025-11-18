import { generateHeuristicTags, generateInsights } from '@/services/insightService'
import { MemberWithAllRelations } from '@/types'
import { LifeStage, InteractionStyle } from '@prisma/client'

describe('InsightService', () => {
  const baseMember: MemberWithAllRelations = {
    id: 'member-1',
    externalId: 'ext-1',
    displayName: 'Test User',
    avatarUrl: null,
    joinedAt: new Date('2024-01-01'),
    primaryEmail: 'test@example.com',
    metaJson: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    soulProfile: {
      id: 'soul-1',
      memberId: 'member-1',
      lifeStage: LifeStage.GROWING,
      primaryArchetype: 'The Builder',
      secondaryArchetype: null,
      valuesJson: ['growth', 'collaboration'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    preferenceProfile: {
      id: 'pref-1',
      memberId: 'member-1',
      interactionStyle: InteractionStyle.ACTIVE,
      contentFormatPrefsJson: null,
      availabilityJson: null,
      updatedAt: new Date('2024-01-01'),
    },
    participationStats: {
      id: 'stats-1',
      memberId: 'member-1',
      totalSessionsAttended: 30,
      totalMessagesPosted: 50,
      totalQuestsCompleted: 10,
      lastActiveAt: new Date(),
      streakDays: 5,
      metaJson: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    tags: [],
  }

  describe('generateHeuristicTags', () => {
    it('should tag quiet-regular when sessions high but messages low', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 25,
          totalMessagesPosted: 5,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('quiet-regular')
    })

    it('should tag highly-engaged when messages exceed sessions significantly', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 10,
          totalMessagesPosted: 25,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('highly-engaged')
    })

    it('should tag streak-keeper for 7+ day streak', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          streakDays: 10,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('streak-keeper')
    })

    it('should tag committed-member for 30+ day streak', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          streakDays: 35,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('committed-member')
      expect(tags).toContain('streak-keeper') // Should also have streak-keeper
    })

    it('should tag mentor-potential for experienced mentors', () => {
      const member = {
        ...baseMember,
        soulProfile: {
          ...baseMember.soulProfile!,
          lifeStage: LifeStage.MENTOR,
        },
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 60,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('mentor-potential')
    })

    it('should tag quest-master for 20+ quests completed', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalQuestsCompleted: 25,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('quest-master')
    })

    it('should tag deep-thinker for DEEP interaction style', () => {
      const member = {
        ...baseMember,
        preferenceProfile: {
          ...baseMember.preferenceProfile!,
          interactionStyle: InteractionStyle.DEEP,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('deep-thinker')
    })

    it('should tag quick-responder for FAST interaction style', () => {
      const member = {
        ...baseMember,
        preferenceProfile: {
          ...baseMember.preferenceProfile!,
          interactionStyle: InteractionStyle.FAST,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('quick-responder')
    })

    it('should return empty array when no stats exist', () => {
      const member = {
        ...baseMember,
        participationStats: null,
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toEqual([])
    })

    it('should tag steady-contributor for consistent activity', () => {
      // Member for 100 days with ~75 total activities = 0.75 per day
      const joinedAt = new Date()
      joinedAt.setDate(joinedAt.getDate() - 100)

      const member = {
        ...baseMember,
        joinedAt,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 25,
          totalMessagesPosted: 25,
          totalQuestsCompleted: 25,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('steady-contributor')
    })

    it('should tag burst-type for very active members', () => {
      // Member for 10 days with 30 total activities = 3 per day
      const joinedAt = new Date()
      joinedAt.setDate(joinedAt.getDate() - 10)

      const member = {
        ...baseMember,
        joinedAt,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 10,
          totalMessagesPosted: 10,
          totalQuestsCompleted: 10,
        },
      }

      const tags = generateHeuristicTags(member)
      expect(tags).toContain('burst-type')
    })
  })

  describe('generateInsights', () => {
    it('should classify as newcomer for low engagement', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 2,
          totalMessagesPosted: 3,
          totalQuestsCompleted: 1,
        },
      }

      const insights = generateInsights(member)
      expect(insights.participationLevel).toBe('newcomer')
    })

    it('should classify as regular for moderate engagement', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 5,
          totalMessagesPosted: 5,
          totalQuestsCompleted: 2,
        },
      }

      const insights = generateInsights(member)
      expect(insights.participationLevel).toBe('regular')
    })

    it('should classify as core for high engagement', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 20,
          totalMessagesPosted: 25,
          totalQuestsCompleted: 10,
        },
      }

      const insights = generateInsights(member)
      expect(insights.participationLevel).toBe('core')
    })

    it('should classify as veteran for very high engagement', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 40,
          totalMessagesPosted: 50,
          totalQuestsCompleted: 20,
        },
      }

      const insights = generateInsights(member)
      expect(insights.participationLevel).toBe('veteran')
    })

    it('should identify highly-vocal engagement style', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 10,
          totalMessagesPosted: 30, // 3x sessions
          totalQuestsCompleted: 5,
        },
      }

      const insights = generateInsights(member)
      expect(insights.engagementStyle).toBe('highly-vocal')
    })

    it('should identify quiet-observer engagement style', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 30,
          totalMessagesPosted: 10, // 1/3 of sessions
          totalQuestsCompleted: 5,
        },
      }

      const insights = generateInsights(member)
      expect(insights.engagementStyle).toBe('quiet-observer')
    })

    it('should identify quest-focused engagement style', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          totalSessionsAttended: 10,
          totalMessagesPosted: 15,
          totalQuestsCompleted: 20, // More than sessions
        },
      }

      const insights = generateInsights(member)
      expect(insights.engagementStyle).toBe('quest-focused')
    })

    it('should include suggested tags from heuristics', () => {
      const member = {
        ...baseMember,
        participationStats: {
          ...baseMember.participationStats!,
          streakDays: 15,
          totalQuestsCompleted: 25,
        },
      }

      const insights = generateInsights(member)
      expect(insights.suggestedTags).toContain('streak-keeper')
      expect(insights.suggestedTags).toContain('committed-member')
      expect(insights.suggestedTags).toContain('quest-master')
    })
  })
})
