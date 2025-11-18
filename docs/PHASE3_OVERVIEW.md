# Phase 3 Overview: Member Soul Profile Registry

## Purpose Statement

The Member Soul Profile Registry is a **central identity and engagement hub** for AI-driven community platforms. Unlike traditional user management systems that focus on authentication and basic profiles, this service maintains rich "soul profiles" that capture the deeper essence of community members - their values, archetypes, life stages, participation patterns, and interaction preferences.

This registry serves as a **single source of truth** for member intelligence, enabling other microservices (quest engines, mentor matching, gamification systems, knowledge graphs) to deliver personalized, context-aware experiences. By maintaining comprehensive participation statistics, automated tagging heuristics, and flexible preference systems, this service transforms raw member data into actionable insights that drive meaningful community engagement.

## Current Features (Phase 2 Complete)

### Core Domain Model
- ✅ **MemberCore**: Core identity with external auth integration
- ✅ **SoulProfile**: Life stages (SEEDLING → GROWING → MENTOR → ELDER), archetypes, values
- ✅ **PreferenceProfile**: Interaction styles (QUIET, ACTIVE, DEEP, FAST), content preferences
- ✅ **ParticipationStats**: Sessions, messages, quests, streaks with automatic calculation
- ✅ **TagAttachment**: Flexible tagging with SYSTEM/MENTOR/SELF sources

### API Surface
- ✅ RESTful endpoints for member CRUD
- ✅ Aggregated profile views with insights
- ✅ Stats event ingestion with automatic updates
- ✅ Tag management endpoints
- ✅ Input validation using Zod schemas

### UI & DX
- ✅ Member listing page with stats cards
- ✅ Detailed member profile pages
- ✅ Docker infrastructure (app + PostgreSQL)
- ✅ Seed script with 10 diverse sample members
- ✅ Test suite for stats and tagging logic

### Intelligent Features
- ✅ Heuristic tagging system (quiet-regular, highly-engaged, mentor-potential, etc.)
- ✅ Insight generation (participation levels, engagement styles)
- ✅ Streak tracking with automatic calculation

## Current Limitations

1. **Single-dimensional tracking**: No historical snapshots or change tracking
2. **Limited relationships**: No member-to-member connections or cohort management
3. **No event system**: Changes don't emit events for other services
4. **Basic logging**: No structured logging or observability
5. **Limited extensibility**: No plugin system or adapter interfaces
6. **Minimal test coverage**: Only core service logic tested
7. **No CLI tools**: Manual operations require custom scripts
8. **Static archetypes**: No way to define custom archetypes or extend the type system

## Phase 3 Plan

### 1. Domain Deepening (New Entities)

**MemberHistory**
- Track significant life events and milestones
- Capture narrative progression through the community
- Enable "story of growth" features

**ProfileSnapshot**
- Periodic snapshots of soul profiles for change tracking
- Compare member evolution over time
- Analytics on community-wide trends

**EngagementEvent**
- Detailed event log beyond simple stats
- Rich metadata about participation context
- Foundation for advanced analytics

**Cohort**
- Group members by shared characteristics
- Bulk operations and cohort-based features
- Segmentation for targeted interventions

**MemberRelationship**
- Mentor-mentee connections
- Peer relationships and collaborations
- Network analysis capabilities

### 2. Multiple Vertical Slices

**Slice 1: Member Lifecycle Management** (ALREADY COMPLETE)
- Create → List → Detail → Update → Delete
- Soul profile and preference management
- Stats tracking

**Slice 2: Cohort Management** (NEW)
- Create cohorts with criteria
- Auto-assign members to cohorts
- Cohort-level analytics
- Bulk operations on cohort members

**Slice 3: Relationship & Network** (NEW)
- Establish mentor-mentee relationships
- Track peer collaborations
- Find similar members by values/archetype
- Relationship strength scoring

**Slice 4: Historical Analytics** (NEW)
- Create profile snapshots
- View member evolution timeline
- Compare current vs. past states
- Community-wide trend analysis

### 3. Extensibility & Integration Points

**Event System**
- Domain events: MemberCreated, ProfileUpdated, TagApplied, etc.
- Event handlers for side effects
- Webhook support for external systems

**Adapter Interfaces**
- `INotificationAdapter`: Email, Slack, in-app notifications
- `IMetricsAdapter`: Prometheus, Datadog, custom metrics
- `IStorageAdapter`: S3, local filesystem for avatars/attachments
- `IAnalyticsAdapter`: Segment, Mixpanel, custom analytics

**Plugin Registry**
- Pluggable archetype providers
- Custom tagging heuristics
- Insight generators

### 4. Infrastructure Enhancements

**Logging**
- Structured logging with context
- Request tracing
- Log levels and filtering

**Error Handling**
- Centralized error handler middleware
- Consistent error shapes
- Error codes and categories

**Metrics & Observability**
- Request latency tracking
- Event counters
- Business metrics (member growth, engagement rates)

**CLI Tools**
- Member management commands
- Cohort operations
- Data migration utilities
- Report generation

### 5. Testing & Quality

**Test Coverage**
- Unit tests for all services
- Integration tests for vertical slices
- E2E tests for critical paths
- Test factories and fixtures

**Test Data**
- Multiple realistic personas
- Edge cases and boundary conditions
- Performance test datasets

### 6. Documentation Expansion

**Integration Recipes**
- Quest engine integration patterns
- Mentor matching algorithms
- Gamification system hooks
- Knowledge graph population

**Domain Notes**
- Detailed archetype taxonomy
- Life stage progression criteria
- Tagging heuristic explanations

**API Documentation**
- OpenAPI/Swagger specs
- Example requests/responses
- Integration code samples

## Success Criteria

After Phase 3, this repository should be:

1. **Production-ready**: Robust error handling, logging, metrics
2. **Extensible**: Clear plugin points for custom logic
3. **Well-tested**: >80% coverage with meaningful tests
4. **Richly documented**: Clear integration patterns and recipes
5. **Developer-friendly**: CLI tools, comprehensive seeds, great DX
6. **Network-aware**: Understands member relationships and cohorts
7. **Time-aware**: Tracks history and evolution
8. **Event-driven**: Emits events for ecosystem integration

## Future Extensions (Phase 4+)

- Real-time collaboration features
- AI-powered archetype suggestions
- Automated mentor matching
- Predictive engagement modeling
- Multi-community federation
- GraphQL API surface
- Advanced privacy controls
- GDPR compliance tooling
