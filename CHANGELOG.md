# Changelog

All notable changes to the Member Soul Profile Registry will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 3 Enhancements

#### Domain Model Expansion
- **MemberHistory**: Track significant life events and milestones with timeline view
- **ProfileSnapshot**: Periodic snapshots for change tracking and evolution analysis
- **EngagementEvent**: Detailed event log for advanced analytics
- **Cohort**: Group management with auto-assignment based on criteria
- **MemberRelationship**: Network connections (mentor-mentee, peers, etc.)
- New enums: `HistoryEventType`, `EngagementEventType`, `RelationshipType`, `RelationshipStatus`

#### Infrastructure & Extensibility
- **Logging System**: Structured logging with contextual information (`src/lib/logger.ts`)
- **Error Handling**: Centralized error classes and Prisma error mapping (`src/lib/errors.ts`)
- **Metrics Collection**: Observability infrastructure with Prometheus export (`src/lib/metrics.ts`)
- **Event System**: Domain event bus for pub/sub patterns (`src/lib/events.ts`)
- **Adapter Interfaces**: Pluggable adapters for notifications, storage, and analytics
  - `INotificationAdapter`: Email, Slack, console implementations
  - `IStorageAdapter`: S3, local, no-op implementations
  - `IAnalyticsAdapter`: Segment, Mixpanel, console implementations

#### Services
- **CohortService**: Cohort CRUD, member management, auto-assignment logic
- **RelationshipService**: Establish connections, find similar members, suggest mentors
- **HistoryService**: Timeline tracking, snapshots, engagement events

#### Configuration
- Enhanced `.env.example` with adapter configuration options
- Configurable observability (metrics, logging levels)

### Changed
- Database schema significantly expanded with new tables and relationships
- Enhanced type safety with comprehensive TypeScript types

### Documentation
- Added `docs/PHASE3_OVERVIEW.md` with detailed architecture and roadmap
- Documented all new adapters and extension points
- Added inline code documentation for new services

## [0.1.0] - Initial Release

### Added
- Core domain model (MemberCore, SoulProfile, PreferenceProfile, ParticipationStats, TagAttachment)
- RESTful API endpoints for member management
- Heuristic tagging system with auto-generation
- Stats event ingestion with streak tracking
- Web UI for member listing and detailed profiles
- Docker infrastructure (app + PostgreSQL)
- Seed script with 10 diverse sample members
- Test suite for core business logic
- Comprehensive README with integration examples
