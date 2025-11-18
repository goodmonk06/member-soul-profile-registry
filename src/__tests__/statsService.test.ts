import { ingestStatsEvent } from '@/services/statsService'
import { prisma } from '@/lib/prisma'
import { StatsEvent } from '@/types'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    participationStats: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('StatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ingestStatsEvent', () => {
    const memberId = 'member-123'
    const baseDate = new Date('2024-01-01T12:00:00Z')

    it('should create stats record if it does not exist', async () => {
      const event: StatsEvent = {
        type: 'session_attended',
        timestamp: baseDate,
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.participationStats.create as jest.Mock).mockResolvedValue({
        id: 'stats-1',
        memberId,
        lastActiveAt: baseDate,
        streakDays: 0,
      })
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 1,
        lastActiveAt: baseDate,
        streakDays: 1,
      })

      await ingestStatsEvent(memberId, event)

      expect(prisma.participationStats.create).toHaveBeenCalledWith({
        data: {
          memberId,
          lastActiveAt: baseDate,
        },
      })
    })

    it('should increment session count for session_attended event', async () => {
      const existingStats = {
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 5,
        totalMessagesPosted: 10,
        totalQuestsCompleted: 3,
        lastActiveAt: new Date('2023-12-31T12:00:00Z'),
        streakDays: 10,
        metaJson: {},
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(existingStats)
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        ...existingStats,
        totalSessionsAttended: 6,
        streakDays: 11,
        lastActiveAt: baseDate,
      })

      await ingestStatsEvent(memberId, {
        type: 'session_attended',
        timestamp: baseDate,
      })

      expect(prisma.participationStats.update).toHaveBeenCalledWith({
        where: { memberId },
        data: expect.objectContaining({
          totalSessionsAttended: 6,
          lastActiveAt: baseDate,
        }),
      })
    })

    it('should increment message count for message_posted event', async () => {
      const existingStats = {
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 5,
        totalMessagesPosted: 10,
        totalQuestsCompleted: 3,
        lastActiveAt: new Date('2023-12-31T12:00:00Z'),
        streakDays: 10,
        metaJson: {},
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(existingStats)
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        ...existingStats,
        totalMessagesPosted: 11,
        streakDays: 11,
        lastActiveAt: baseDate,
      })

      await ingestStatsEvent(memberId, {
        type: 'message_posted',
        timestamp: baseDate,
      })

      expect(prisma.participationStats.update).toHaveBeenCalledWith({
        where: { memberId },
        data: expect.objectContaining({
          totalMessagesPosted: 11,
        }),
      })
    })

    it('should increment quest count for quest_completed event', async () => {
      const existingStats = {
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 5,
        totalMessagesPosted: 10,
        totalQuestsCompleted: 3,
        lastActiveAt: new Date('2023-12-31T12:00:00Z'),
        streakDays: 10,
        metaJson: {},
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(existingStats)
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        ...existingStats,
        totalQuestsCompleted: 4,
        streakDays: 11,
        lastActiveAt: baseDate,
      })

      await ingestStatsEvent(memberId, {
        type: 'quest_completed',
        timestamp: baseDate,
      })

      expect(prisma.participationStats.update).toHaveBeenCalledWith({
        where: { memberId },
        data: expect.objectContaining({
          totalQuestsCompleted: 4,
        }),
      })
    })

    it('should maintain streak when activity is consecutive days', async () => {
      const lastActiveAt = new Date('2023-12-31T12:00:00Z')
      const existingStats = {
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 5,
        totalMessagesPosted: 10,
        totalQuestsCompleted: 3,
        lastActiveAt,
        streakDays: 10,
        metaJson: {},
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(existingStats)
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        ...existingStats,
        streakDays: 11,
        lastActiveAt: baseDate,
      })

      await ingestStatsEvent(memberId, {
        type: 'session_attended',
        timestamp: baseDate,
      })

      const updateCall = (prisma.participationStats.update as jest.Mock).mock.calls[0][0]
      expect(updateCall.data.streakDays).toBe(11)
    })

    it('should reset streak when activity gap is more than 1 day', async () => {
      const lastActiveAt = new Date('2023-12-29T12:00:00Z') // 3 days ago
      const existingStats = {
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 5,
        totalMessagesPosted: 10,
        totalQuestsCompleted: 3,
        lastActiveAt,
        streakDays: 10,
        metaJson: {},
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(existingStats)
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        ...existingStats,
        streakDays: 1,
        lastActiveAt: baseDate,
      })

      await ingestStatsEvent(memberId, {
        type: 'session_attended',
        timestamp: baseDate,
      })

      const updateCall = (prisma.participationStats.update as jest.Mock).mock.calls[0][0]
      expect(updateCall.data.streakDays).toBe(1)
    })

    it('should merge metadata when provided', async () => {
      const existingStats = {
        id: 'stats-1',
        memberId,
        totalSessionsAttended: 5,
        totalMessagesPosted: 10,
        totalQuestsCompleted: 3,
        lastActiveAt: new Date('2023-12-31T12:00:00Z'),
        streakDays: 10,
        metaJson: { existingKey: 'value' },
      }

      ;(prisma.participationStats.findUnique as jest.Mock).mockResolvedValue(existingStats)
      ;(prisma.participationStats.update as jest.Mock).mockResolvedValue({
        ...existingStats,
        metaJson: { existingKey: 'value', newKey: 'newValue' },
      })

      await ingestStatsEvent(memberId, {
        type: 'session_attended',
        timestamp: baseDate,
        metadata: { newKey: 'newValue' },
      })

      const updateCall = (prisma.participationStats.update as jest.Mock).mock.calls[0][0]
      expect(updateCall.data.metaJson).toEqual({
        existingKey: 'value',
        newKey: 'newValue',
      })
    })
  })
})
