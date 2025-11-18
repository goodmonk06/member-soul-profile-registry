# Integration Recipes

This document provides practical patterns for integrating the Soul Profile Registry with other services in your ecosystem.

## Table of Contents

1. [Quest-Based Learning Path Engine](#quest-based-learning-path-engine)
2. [Mentor Matchmaking Orchestrator](#mentor-matchmaking-orchestrator)
3. [Gamification & Loyalty Engine](#gamification--loyalty-engine)
4. [Org Knowledge Graph Hub](#org-knowledge-graph-hub)
5. [Event-Driven Integration](#event-driven-integration)
6. [Webhook Integration](#webhook-integration)

---

## Quest-Based Learning Path Engine

### Use Case
Personalize quest recommendations based on member soul profiles, life stages, and engagement patterns.

### Integration Pattern

```typescript
// In your quest engine service
import { eventBus, DomainEventType } from 'soul-profile-registry/events'

// Subscribe to member updates
eventBus.on(DomainEventType.SOUL_PROFILE_UPDATED, async (event) => {
  const { memberId } = event.payload

  // Fetch updated profile
  const profile = await fetch(`http://soul-registry/api/members/${memberId}/profile`)
    .then(r => r.json())

  // Adjust quest recommendations
  if (profile.soulProfile.lifeStage === 'SEEDLING') {
    await assignBeginnerQuests(memberId)
  } else if (profile.insights.suggestedTags.includes('quest-master')) {
    await assignAdvancedChallenges(memberId)
  }
})

// When quest is completed, update stats
async function onQuestCompleted(memberId: string, questId: string) {
  await fetch(`http://soul-registry/api/members/${memberId}/stats/ingest-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'quest_completed',
      metadata: { questId, difficulty: 'advanced' }
    })
  })
}
```

### Recommended Data Flow

1. **Quest Recommendation**: Query `/api/members/{id}/profile` to get insights
2. **Quest Assignment**: Use life stage and tags to filter appropriate quests
3. **Quest Completion**: Post to `/api/members/{id}/stats/ingest-event`
4. **Achievement Unlocked**: Listen to `MILESTONE_REACHED` events

---

## Mentor Matchmaking Orchestrator

### Use Case
Match mentees with mentors based on values alignment, archetype compatibility, and availability.

### Integration Pattern

```typescript
import { RelationshipService } from 'soul-profile-registry/services'

async function findMentorForMentee(menteeId: string) {
  // 1. Get suggested mentors from relationship service
  const suggestions = await fetch(
    `http://soul-registry/api/members/${menteeId}/suggested-mentors`
  ).then(r => r.json())

  // 2. Cross-reference with mentor availability
  const availableMentors = await filterByAvailability(suggestions)

  // 3. Present top 3 matches to mentee
  return availableMentors.slice(0, 3)
}

async function establishMentorship(mentorId: string, menteeId: string) {
  // Create bidirectional relationship
  await fetch('http://soul-registry/api/relationships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromMemberId: mentorId,
      toMemberId: menteeId,
      relationshipType: 'MENTOR_MENTEE',
      strength: 5,
      status: 'ACTIVE',
      metadata: {
        matchReason: 'value_alignment',
        startDate: new Date().toISOString()
      }
    })
  })

  // Create history entry
  await fetch(`http://soul-registry/api/members/${menteeId}/history`, {
    method: 'POST',
    body: JSON.stringify({
      eventType: 'MENTOR_ASSIGNED',
      title: 'Mentor Assigned',
      description: `Matched with mentor ${mentorId}`,
      metadata: { mentorId }
    })
  })
}
```

### Matching Algorithm

```typescript
function calculateMentorMatch(mentor: Member, mentee: Member): number {
  let score = 0

  // Value alignment (max 30 points)
  const sharedValues = intersection(
    mentor.soulProfile.valuesJson,
    mentee.soulProfile.valuesJson
  )
  score += sharedValues.length * 10

  // Life stage compatibility (10 points)
  if (mentor.soulProfile.lifeStage in ['MENTOR', 'ELDER']) {
    score += 10
  }

  // Interaction style (10 points)
  if (mentor.preferenceProfile.interactionStyle === mentee.preferenceProfile.interactionStyle) {
    score += 10
  }

  // Experience (max 20 points)
  score += Math.min(mentor.participationStats.totalSessionsAttended / 10, 20)

  // Has mentor-potential tag (30 points)
  if (mentor.tags.some(t => t.tag === 'mentor-potential')) {
    score += 30
  }

  return score
}
```

---

## Gamification & Loyalty Engine

### Use Case
Award badges, track achievements, and recognize member contributions based on participation patterns.

### Integration Pattern

```typescript
import { eventBus, DomainEventType } from 'soul-profile-registry/events'

// Subscribe to stats updates
eventBus.on(DomainEventType.STATS_UPDATED, async (event) => {
  const { memberId, stats } = event.payload

  // Check for badge eligibility
  if (stats.totalQuestsCompleted === 10) {
    await awardBadge(memberId, 'QUEST_NOVICE')
  }

  if (stats.totalQuestsCompleted === 50) {
    await awardBadge(memberId, 'QUEST_MASTER')
  }
})

// Subscribe to streak achievements
eventBus.on(DomainEventType.STREAK_ACHIEVED, async (event) => {
  const { memberId, days } = event.payload

  if (days === 7) {
    await awardBadge(memberId, 'WEEK_WARRIOR')
    await grantLoyaltyPoints(memberId, 100)
  }

  if (days === 30) {
    await awardBadge(memberId, 'MONTH_MASTER')
    await grantLoyaltyPoints(memberId, 500)
  }
})

// Subscribe to tag applications
eventBus.on(DomainEventType.TAG_APPLIED, async (event) => {
  const { memberId, tag, source } = event.payload

  if (tag === 'mentor-potential' && source === 'SYSTEM') {
    await sendNotification(memberId, {
      title: 'You've been recognized!',
      body: 'You've been identified as a potential mentor. Would you like to join the mentor program?'
    })
  }
})
```

### Badge Definition Example

```typescript
interface Badge {
  id: string
  name: string
  description: string
  criteria: (member: AggregatedSoulProfile) => boolean
  points: number
}

const badges: Badge[] = [
  {
    id: 'FIRST_QUEST',
    name: 'Quest Beginner',
    description: 'Completed your first quest',
    criteria: (m) => m.participationStats.totalQuestsCompleted >= 1,
    points: 10
  },
  {
    id: 'SOCIAL_BUTTERFLY',
    name: 'Social Butterfly',
    description: 'Posted 100 messages in the community',
    criteria: (m) => m.participationStats.totalMessagesPosted >= 100,
    points: 50
  },
  {
    id: 'ELDER_STATUS',
    name: 'Community Elder',
    description: 'Reached Elder life stage',
    criteria: (m) => m.soulProfile?.lifeStage === 'ELDER',
    points: 200
  }
]
```

---

## Org Knowledge Graph Hub

### Use Case
Build a knowledge graph connecting members based on values, interests, expertise, and collaboration patterns.

### Integration Pattern

```typescript
// Build nodes from soul profiles
async function buildMemberNodes() {
  const members = await fetch('http://soul-registry/api/members')
    .then(r => r.json())

  const nodes = members.members.map(m => ({
    id: m.id,
    type: 'MEMBER',
    properties: {
      displayName: m.displayName,
      archetype: m.soulProfile?.primaryArchetype,
      lifeStage: m.soulProfile?.lifeStage,
      values: m.soulProfile?.valuesJson,
      participationLevel: calculateLevel(m.participationStats)
    }
  }))

  return nodes
}

// Build edges from relationships
async function buildRelationshipEdges(memberId: string) {
  const relationships = await fetch(
    `http://soul-registry/api/members/${memberId}/relationships`
  ).then(r => r.json())

  const edges = relationships.map(r => ({
    from: r.fromMemberId,
    to: r.toMemberId,
    type: r.relationshipType,
    weight: r.strength,
    properties: {
      status: r.status,
      establishedAt: r.establishedAt
    }
  }))

  return edges
}

// Build edges based on shared values
async function buildValueConnections() {
  const members = await getAllMembers()
  const edges = []

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const sharedValues = intersection(
        members[i].soulProfile.valuesJson,
        members[j].soulProfile.valuesJson
      )

      if (sharedValues.length > 0) {
        edges.push({
          from: members[i].id,
          to: members[j].id,
          type: 'SHARES_VALUES',
          weight: sharedValues.length,
          properties: { sharedValues }
        })
      }
    }
  }

  return edges
}

// Query for influencers in a cohort
async function findCohortInfluencers(cohortId: string) {
  const members = await fetch(
    `http://soul-registry/api/cohorts/${cohortId}/members`
  ).then(r => r.json())

  // Calculate influence score
  const scored = members.map(m => ({
    member: m,
    influenceScore:
      m.participationStats.totalMessagesPosted * 2 +
      m.participationStats.totalSessionsAttended +
      m.relationshipsFrom.length * 5
  }))

  return scored
    .sort((a, b) => b.influenceScore - a.influenceScore)
    .slice(0, 10)
}
```

---

## Event-Driven Integration

### Subscribing to Domain Events

```typescript
import { eventBus, DomainEventType } from 'soul-profile-registry/events'

// Subscribe to specific events
eventBus.on(DomainEventType.MEMBER_CREATED, async (event) => {
  console.log('New member:', event.payload)

  // Trigger welcome workflow
  await sendWelcomeEmail(event.payload.memberId)

  // Assign to onboarding cohort
  await assignToOnboardingCohort(event.payload.memberId)
})

eventBus.on(DomainEventType.LIFE_STAGE_CHANGED, async (event) => {
  const { memberId, oldStage, newStage } = event.payload

  console.log(`Member ${memberId} progressed: ${oldStage} → ${newStage}`)

  // Update permissions
  if (newStage === 'MENTOR') {
    await grantMentorPermissions(memberId)
  }

  // Celebrate milestone
  await createCelebrationPost(memberId, `Congratulations on reaching ${newStage}!`)
})

// Subscribe to all events
eventBus.onAny(async (event) => {
  console.log('Event occurred:', event.type, event.payload)

  // Send to external analytics
  await sendToAnalytics(event)
})
```

### Available Events

- `member.created` - New member registered
- `member.updated` - Member profile updated
- `member.deleted` - Member removed
- `soul_profile.updated` - Soul profile changed
- `soul_profile.life_stage_changed` - Life stage progression
- `soul_profile.archetype_changed` - Archetype shift
- `stats.updated` - Participation stats changed
- `stats.streak_achieved` - Streak milestone
- `stats.milestone_reached` - Achievement unlocked
- `tag.applied` - Tag added to member
- `tag.removed` - Tag removed
- `cohort.created` - New cohort created
- `cohort.member_joined` - Member joined cohort
- `relationship.established` - New connection formed
- `snapshot.created` - Profile snapshot taken

---

## Webhook Integration

### Setting Up Webhooks

```typescript
// In your external service
const webhookHandler = async (req, res) => {
  const { type, payload } = req.body

  // Verify webhook signature
  if (!verifySignature(req.headers['x-signature'], req.body)) {
    return res.status(401).send('Unauthorized')
  }

  switch (type) {
    case 'member.created':
      await handleMemberCreated(payload)
      break

    case 'stats.milestone_reached':
      await handleMilestone(payload)
      break

    case 'relationship.established':
      await handleNewRelationship(payload)
      break
  }

  res.status(200).send('OK')
}

// Configure webhook endpoint in soul-registry
await fetch('http://soul-registry/api/webhooks', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://your-service.com/webhooks/soul-registry',
    events: [
      'member.created',
      'stats.milestone_reached',
      'relationship.established'
    ],
    secret: 'your-webhook-secret'
  })
})
```

---

## Best Practices

### 1. Caching
Cache frequently accessed profiles to reduce API calls:

```typescript
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedProfile(memberId: string) {
  const cached = cache.get(memberId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const profile = await fetch(`http://soul-registry/api/members/${memberId}/profile`)
    .then(r => r.json())

  cache.set(memberId, {
    data: profile,
    timestamp: Date.now()
  })

  return profile
}
```

### 2. Batch Operations
Use batch endpoints when working with multiple members:

```typescript
// Instead of N requests
for (const memberId of memberIds) {
  await updateMember(memberId)
}

// Use bulk endpoint
await fetch('http://soul-registry/api/members/bulk-update', {
  method: 'POST',
  body: JSON.stringify({
    updates: memberIds.map(id => ({ id, data: updateData }))
  })
})
```

### 3. Error Handling
Always handle API errors gracefully:

```typescript
async function safeApiCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    logger.error('Soul registry API call failed', error)
    metrics.recordCounter('soul_registry_api_errors', 1)
    return null
  }
}
```

### 4. Rate Limiting
Respect rate limits and implement backoff:

```typescript
const rateLimiter = new RateLimiter({ maxRequests: 100, perMs: 60000 })

async function rateLimitedFetch(url: string, options?: RequestInit) {
  await rateLimiter.acquire()
  return fetch(url, options)
}
```

---

## Support

For integration questions or issues:
- Open an issue on GitHub
- Check the main README for API documentation
- Review `docs/PHASE3_OVERVIEW.md` for architecture details
