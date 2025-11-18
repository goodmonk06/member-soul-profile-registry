# Member Soul Profile Registry

> メンバー一人ひとりの価値観・志向・参加履歴を「ソウルプロファイル」として管理するレジストリサービス。

A comprehensive service for managing member soul profiles - capturing values, archetypes, interests, participation history, and interaction preferences for community engagement platforms.

## 📖 Concept: What is a Soul Profile?

Unlike traditional user profiles that focus on basic demographics, a **Soul Profile** captures the deeper essence of a community member:

- **Core Values**: What principles guide their actions and decisions?
- **Archetype**: What role do they naturally embody? (The Builder, The Sage, The Connector, etc.)
- **Life Stage**: Where are they in their journey? (Seedling → Growing → Mentor → Elder)
- **Participation Patterns**: How do they engage with the community?
- **Interaction Style**: How do they prefer to communicate and learn?

This holistic view enables other services to provide personalized experiences, better matchmaking, and more meaningful engagement.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API**: REST endpoints under `/api`
- **Styling**: Tailwind CSS
- **Testing**: Jest

### Domain Model

```
┌─────────────────┐
│  MemberCore     │  Core identity from auth system
├─────────────────┤
│ id              │
│ externalId      │  From external auth
│ displayName     │
│ primaryEmail    │
│ avatarUrl       │
│ joinedAt        │
└─────────────────┘
         │
         ├──────┐
         │      │
         ▼      ▼
┌─────────────────┐         ┌──────────────────┐
│  SoulProfile    │         │ PreferenceProfile│
├─────────────────┤         ├──────────────────┤
│ lifeStage       │         │ interactionStyle │
│ primaryArch...  │         │ contentFormat... │
│ secondaryArch...│         │ availabilityJson │
│ valuesJson      │         └──────────────────┘
└─────────────────┘
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│Participation... │         │  TagAttachment   │
├─────────────────┤         ├──────────────────┤
│ totalSessions   │         │ tag              │
│ totalMessages   │         │ source           │
│ totalQuests     │         │  (SYSTEM/MENTOR/ │
│ streakDays      │         │   SELF)          │
│ lastActiveAt    │         └──────────────────┘
└─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (optional, for containerized setup)

### Local Development

1. **Clone and install dependencies**

```bash
git clone <repo-url>
cd member-soul-profile-registry
npm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your database URL
```

3. **Start PostgreSQL** (if using Docker)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Seed with sample data**

```bash
npm run db:seed
```

6. **Start the development server**

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Using Docker (Full Stack)

```bash
# Build and run everything
docker-compose up --build

# The app will be available at http://localhost:3000
```

## 📡 REST API Reference

### Members

#### `GET /api/members`

List all members with optional filtering.

**Query Parameters:**
- `externalId` (string): Filter by external auth ID
- `lifeStage` (string): Filter by life stage (SEEDLING, GROWING, MENTOR, ELDER)
- `skip` (number): Pagination offset (default: 0)
- `take` (number): Number of records (default: 50)

**Response:**
```json
{
  "members": [
    {
      "id": "...",
      "displayName": "Sarah Chen",
      "soulProfile": { ... },
      "participationStats": { ... },
      "tags": [ ... ]
    }
  ],
  "total": 42
}
```

#### `POST /api/members`

Create a new member.

**Request Body:**
```json
{
  "externalId": "auth-user-123",
  "displayName": "Jane Doe",
  "primaryEmail": "jane@example.com",
  "avatarUrl": "https://...",
  "metaJson": {}
}
```

**Response:** Created member with default profiles (201)

#### `GET /api/members/[id]`

Get a single member by ID.

#### `DELETE /api/members/[id]`

Delete a member and all related data.

### Soul Profiles

#### `GET /api/members/[id]/profile`

Get aggregated soul profile with insights.

**Response:**
```json
{
  "core": { ... },
  "soulProfile": {
    "lifeStage": "GROWING",
    "primaryArchetype": "The Builder",
    "secondaryArchetype": "The Collaborator",
    "valuesJson": ["innovation", "collaboration"]
  },
  "preferenceProfile": { ... },
  "participationStats": { ... },
  "tags": [ ... ],
  "insights": {
    "participationLevel": "core",
    "engagementStyle": "highly-vocal",
    "suggestedTags": ["highly-engaged", "streak-keeper"]
  }
}
```

#### `PUT /api/members/[id]/soul`

Update soul profile.

**Request Body:**
```json
{
  "lifeStage": "MENTOR",
  "primaryArchetype": "The Guide",
  "secondaryArchetype": "The Sage",
  "values": ["wisdom", "teaching", "patience"]
}
```

### Preferences

#### `PUT /api/members/[id]/preferences`

Update preference profile.

**Request Body:**
```json
{
  "interactionStyle": "DEEP",
  "contentFormatPrefs": {
    "preferredFormats": ["video", "text"],
    "accessibility": ["captions"]
  },
  "availability": {
    "timezone": "America/Los_Angeles",
    "preferredTimes": ["evening"]
  }
}
```

### Stats & Events

#### `POST /api/members/[id]/stats/ingest-event`

Ingest a participation event to update stats.

**Request Body:**
```json
{
  "type": "session_attended",  // or: message_posted, quest_completed, streak_updated
  "metadata": {
    "sessionId": "session-123",
    "duration": 3600
  }
}
```

**Effects:**
- Increments appropriate counter
- Updates `lastActiveAt`
- Recalculates streak (consecutive days)
- Merges metadata

### Tags

#### `GET /api/members/[id]/tags`

Get all tags for a member.

#### `POST /api/members/[id]/tags`

Add a tag to a member.

**Request Body:**
```json
{
  "tag": "mentor-potential",
  "source": "SYSTEM"  // or: MENTOR, SELF
}
```

#### `DELETE /api/members/[id]/tags?tag=mentor-potential`

Remove a tag from a member.

## 🔗 Integration Scenarios

This service is designed to be a central dependency for other microservices:

### 1. Quest-Based Learning Path Engine

**Use Case**: Personalize quest recommendations based on member profiles.

```typescript
// Fetch member profile
const profile = await fetch(`/api/members/${memberId}/profile`).then(r => r.json())

// Use insights to customize quests
if (profile.soulProfile.lifeStage === 'SEEDLING') {
  // Show beginner-friendly quests
} else if (profile.insights.suggestedTags.includes('quest-master')) {
  // Offer advanced challenges
}

// Track quest completion
await fetch(`/api/members/${memberId}/stats/ingest-event`, {
  method: 'POST',
  body: JSON.stringify({ type: 'quest_completed', metadata: { questId } })
})
```

### 2. Mentor Matchmaking Orchestrator

**Use Case**: Match mentees with mentors based on values and archetypes.

```typescript
// Find potential mentors
const mentors = await fetch(`/api/members?lifeStage=MENTOR`).then(r => r.json())

// Filter by archetype compatibility
const compatibleMentors = mentors.members.filter(mentor =>
  hasArchetypeMatch(mentor.soulProfile, mentee.soulProfile)
)

// Consider interaction styles for better matches
const bestMatch = findBestMatch(compatibleMentors, mentee.preferenceProfile)
```

### 3. Gamification & Loyalty Engine

**Use Case**: Award badges and recognition based on participation patterns.

```typescript
// Check participation stats
const stats = await fetch(`/api/members/${memberId}`).then(r => r.json())

// Award badges based on stats
if (stats.participationStats.streakDays >= 30) {
  awardBadge('30-day-streak')
}

// Use heuristic tags for automated recognition
if (stats.tags.some(t => t.tag === 'mentor-potential')) {
  nominateForMentorProgram(memberId)
}
```

### 4. Org Knowledge Graph Hub

**Use Case**: Build connections based on shared values and interests.

```typescript
// Find members with similar values
const members = await fetch(`/api/members`).then(r => r.json())

const similarMembers = members.members.filter(m =>
  hasValueOverlap(m.soulProfile.valuesJson, targetMember.soulProfile.valuesJson)
)

// Build graph edges based on:
// - Shared archetypes
// - Similar engagement patterns
// - Common tags
```

## 🏷️ Heuristic Tagging System

The service includes an intelligent tagging module (`src/services/insightService.ts`) that auto-generates tags based on member behavior:

### Tag Categories

**Participation Patterns:**
- `quiet-regular`: High sessions, low messages
- `highly-engaged`: Messages >> sessions
- `burst-type`: Very high activity per day
- `steady-contributor`: Consistent moderate activity

**Commitment:**
- `streak-keeper`: 7+ day streak
- `committed-member`: 30+ day streak

**Expertise:**
- `quest-master`: 20+ quests completed
- `mentor-potential`: Experienced with MENTOR life stage

**Interaction Style:**
- `deep-thinker`: Prefers DEEP interaction style
- `quick-responder`: Prefers FAST interaction style

### Reusable Tagging Logic

Other services can import and use the tagging heuristics:

```typescript
import { generateHeuristicTags } from '@/services/insightService'

// Generate tags for any member
const suggestedTags = generateHeuristicTags(memberWithRelations)

// Use in your own logic
if (suggestedTags.includes('mentor-potential')) {
  // Invite to mentor program
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Tests cover:
# - Stats event ingestion and streak calculation
# - Heuristic tag generation
# - Insight generation
```

## 📦 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm test                 # Run tests

npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client
npm run db:reset         # Reset database (caution!)
```

## 🌐 Pages

- `/` - Home page with concept overview
- `/members` - List all members with stats cards
- `/members/[id]` - Detailed soul profile view

## 🔐 Security Considerations

- External ID (`externalId`) should come from your trusted auth system
- API endpoints currently don't enforce authentication (add middleware as needed)
- Consider rate limiting for stats ingestion endpoints
- Validate all user input via Zod schemas

## 📊 Database Schema

See `prisma/schema.prisma` for the complete schema definition.

Key models:
- `MemberCore`: Core identity
- `SoulProfile`: Values, archetypes, life stage
- `PreferenceProfile`: Interaction preferences
- `ParticipationStats`: Engagement metrics
- `TagAttachment`: Flexible tagging

## 🤝 Contributing

This is a reference implementation. Feel free to:
- Add new archetypes and values
- Extend the heuristic tagging logic
- Add new interaction styles
- Create additional API endpoints
- Enhance the UI components

## 📄 License

MIT - See LICENSE file for details

---

Built with TypeScript, Next.js, and Prisma. Designed for community engagement platforms that value depth over vanity metrics.
