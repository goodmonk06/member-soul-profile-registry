import { PrismaClient, LifeStage, InteractionStyle, TagSource } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.tagAttachment.deleteMany()
  await prisma.participationStats.deleteMany()
  await prisma.preferenceProfile.deleteMany()
  await prisma.soulProfile.deleteMany()
  await prisma.memberCore.deleteMany()

  console.log('Cleared existing data')

  // Sample members with diverse profiles
  const members = [
    {
      externalId: 'auth-user-001',
      displayName: 'Sarah Chen',
      primaryEmail: 'sarah.chen@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      lifeStage: LifeStage.MENTOR,
      primaryArchetype: 'The Sage',
      secondaryArchetype: 'The Guide',
      values: ['wisdom', 'teaching', 'patience', 'growth'],
      interactionStyle: InteractionStyle.DEEP,
      stats: {
        totalSessionsAttended: 87,
        totalMessagesPosted: 124,
        totalQuestsCompleted: 45,
        streakDays: 42,
      },
      tags: ['mentor-potential', 'deep-thinker', 'committed-member'],
    },
    {
      externalId: 'auth-user-002',
      displayName: 'Marcus Johnson',
      primaryEmail: 'marcus.j@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      lifeStage: LifeStage.GROWING,
      primaryArchetype: 'The Builder',
      secondaryArchetype: 'The Collaborator',
      values: ['innovation', 'collaboration', 'excellence', 'impact'],
      interactionStyle: InteractionStyle.ACTIVE,
      stats: {
        totalSessionsAttended: 34,
        totalMessagesPosted: 89,
        totalQuestsCompleted: 12,
        streakDays: 8,
      },
      tags: ['highly-engaged', 'streak-keeper'],
    },
    {
      externalId: 'auth-user-003',
      displayName: 'Yuki Tanaka',
      primaryEmail: 'yuki.tanaka@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      lifeStage: LifeStage.SEEDLING,
      primaryArchetype: 'The Explorer',
      secondaryArchetype: null,
      values: ['curiosity', 'learning', 'adventure'],
      interactionStyle: InteractionStyle.QUIET,
      stats: {
        totalSessionsAttended: 8,
        totalMessagesPosted: 3,
        totalQuestsCompleted: 2,
        streakDays: 0,
      },
      tags: [],
    },
    {
      externalId: 'auth-user-004',
      displayName: 'Emma Rodriguez',
      primaryEmail: 'emma.r@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      lifeStage: LifeStage.ELDER,
      primaryArchetype: 'The Wisdom Keeper',
      secondaryArchetype: 'The Storyteller',
      values: ['tradition', 'community', 'legacy', 'connection'],
      interactionStyle: InteractionStyle.DEEP,
      stats: {
        totalSessionsAttended: 156,
        totalMessagesPosted: 203,
        totalQuestsCompleted: 78,
        streakDays: 95,
      },
      tags: ['veteran', 'mentor-potential', 'committed-member', 'deep-thinker'],
    },
    {
      externalId: 'auth-user-005',
      displayName: 'Alex Kim',
      primaryEmail: 'alex.kim@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=8',
      lifeStage: LifeStage.GROWING,
      primaryArchetype: 'The Connector',
      secondaryArchetype: 'The Catalyst',
      values: ['networking', 'energy', 'opportunity', 'synergy'],
      interactionStyle: InteractionStyle.FAST,
      stats: {
        totalSessionsAttended: 23,
        totalMessagesPosted: 67,
        totalQuestsCompleted: 8,
        streakDays: 3,
      },
      tags: ['highly-engaged', 'quick-responder'],
    },
    {
      externalId: 'auth-user-006',
      displayName: 'Priya Sharma',
      primaryEmail: 'priya.sharma@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      lifeStage: LifeStage.GROWING,
      primaryArchetype: 'The Analyst',
      secondaryArchetype: 'The Researcher',
      values: ['precision', 'knowledge', 'insight', 'clarity'],
      interactionStyle: InteractionStyle.DEEP,
      stats: {
        totalSessionsAttended: 45,
        totalMessagesPosted: 34,
        totalQuestsCompleted: 38,
        streakDays: 15,
      },
      tags: ['quest-master', 'steady-contributor', 'committed-member'],
    },
    {
      externalId: 'auth-user-007',
      displayName: 'Diego Silva',
      primaryEmail: 'diego.silva@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      lifeStage: LifeStage.MENTOR,
      primaryArchetype: 'The Coach',
      secondaryArchetype: 'The Motivator',
      values: ['empowerment', 'achievement', 'support', 'excellence'],
      interactionStyle: InteractionStyle.ACTIVE,
      stats: {
        totalSessionsAttended: 67,
        totalMessagesPosted: 145,
        totalQuestsCompleted: 29,
        streakDays: 21,
      },
      tags: ['mentor-potential', 'highly-engaged', 'committed-member'],
    },
    {
      externalId: 'auth-user-008',
      displayName: 'Olivia Thompson',
      primaryEmail: 'olivia.t@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=20',
      lifeStage: LifeStage.SEEDLING,
      primaryArchetype: 'The Dreamer',
      secondaryArchetype: 'The Visionary',
      values: ['imagination', 'possibility', 'creativity', 'hope'],
      interactionStyle: InteractionStyle.ACTIVE,
      stats: {
        totalSessionsAttended: 12,
        totalMessagesPosted: 18,
        totalQuestsCompleted: 5,
        streakDays: 4,
      },
      tags: [],
    },
    {
      externalId: 'auth-user-009',
      displayName: 'Jamal Hassan',
      primaryEmail: 'jamal.hassan@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=14',
      lifeStage: LifeStage.GROWING,
      primaryArchetype: 'The Craftsperson',
      secondaryArchetype: 'The Perfectionist',
      values: ['mastery', 'quality', 'dedication', 'skill'],
      interactionStyle: InteractionStyle.QUIET,
      stats: {
        totalSessionsAttended: 52,
        totalMessagesPosted: 28,
        totalQuestsCompleted: 31,
        streakDays: 12,
      },
      tags: ['quiet-regular', 'quest-master', 'streak-keeper'],
    },
    {
      externalId: 'auth-user-010',
      displayName: 'Zara Patel',
      primaryEmail: 'zara.patel@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=16',
      lifeStage: LifeStage.MENTOR,
      primaryArchetype: 'The Facilitator',
      secondaryArchetype: 'The Harmonizer',
      values: ['collaboration', 'balance', 'inclusion', 'harmony'],
      interactionStyle: InteractionStyle.ACTIVE,
      stats: {
        totalSessionsAttended: 73,
        totalMessagesPosted: 91,
        totalQuestsCompleted: 42,
        streakDays: 28,
      },
      tags: ['mentor-potential', 'steady-contributor', 'committed-member'],
    },
  ]

  for (const memberData of members) {
    console.log(`Creating member: ${memberData.displayName}`)

    const member = await prisma.memberCore.create({
      data: {
        externalId: memberData.externalId,
        displayName: memberData.displayName,
        primaryEmail: memberData.primaryEmail,
        avatarUrl: memberData.avatarUrl,
        soulProfile: {
          create: {
            lifeStage: memberData.lifeStage,
            primaryArchetype: memberData.primaryArchetype,
            secondaryArchetype: memberData.secondaryArchetype,
            valuesJson: memberData.values,
          },
        },
        preferenceProfile: {
          create: {
            interactionStyle: memberData.interactionStyle,
            contentFormatPrefsJson: {
              preferredFormats: ['video', 'text', 'interactive'],
              accessibility: [],
            },
            availabilityJson: {
              timezone: 'UTC',
              preferredTimes: ['morning', 'evening'],
            },
          },
        },
        participationStats: {
          create: {
            totalSessionsAttended: memberData.stats.totalSessionsAttended,
            totalMessagesPosted: memberData.stats.totalMessagesPosted,
            totalQuestsCompleted: memberData.stats.totalQuestsCompleted,
            streakDays: memberData.stats.streakDays,
            lastActiveAt: new Date(),
          },
        },
      },
    })

    // Add tags
    for (const tag of memberData.tags) {
      await prisma.tagAttachment.create({
        data: {
          memberId: member.id,
          tag,
          source: TagSource.SYSTEM,
        },
      })
    }

    console.log(`✅ Created ${memberData.displayName}`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
