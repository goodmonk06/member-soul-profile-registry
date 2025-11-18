/**
 * Domain event system for publishing and subscribing to events
 */

import { logger } from './logger'
import { metrics } from './metrics'

export enum DomainEventType {
  // Member events
  MEMBER_CREATED = 'member.created',
  MEMBER_UPDATED = 'member.updated',
  MEMBER_DELETED = 'member.deleted',

  // Soul profile events
  SOUL_PROFILE_UPDATED = 'soul_profile.updated',
  LIFE_STAGE_CHANGED = 'soul_profile.life_stage_changed',
  ARCHETYPE_CHANGED = 'soul_profile.archetype_changed',

  // Participation events
  STATS_UPDATED = 'stats.updated',
  STREAK_ACHIEVED = 'stats.streak_achieved',
  MILESTONE_REACHED = 'stats.milestone_reached',

  // Tag events
  TAG_APPLIED = 'tag.applied',
  TAG_REMOVED = 'tag.removed',
  TAGS_AUTO_GENERATED = 'tag.auto_generated',

  // Cohort events
  COHORT_CREATED = 'cohort.created',
  COHORT_UPDATED = 'cohort.updated',
  MEMBER_JOINED_COHORT = 'cohort.member_joined',
  MEMBER_LEFT_COHORT = 'cohort.member_left',

  // Relationship events
  RELATIONSHIP_ESTABLISHED = 'relationship.established',
  RELATIONSHIP_UPDATED = 'relationship.updated',
  RELATIONSHIP_ENDED = 'relationship.ended',

  // History events
  HISTORY_ENTRY_CREATED = 'history.entry_created',
  SNAPSHOT_CREATED = 'snapshot.created',
}

export interface DomainEvent<T = any> {
  id: string
  type: DomainEventType
  timestamp: Date
  payload: T
  metadata?: {
    userId?: string
    source?: string
    [key: string]: any
  }
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>

class EventBus {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map()
  private globalHandlers: EventHandler[] = []

  /**
   * Subscribe to a specific event type
   */
  on<T = any>(eventType: DomainEventType, handler: EventHandler<T>): () => void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType) || []
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): () => void {
    this.globalHandlers.push(handler)

    // Return unsubscribe function
    return () => {
      const index = this.globalHandlers.indexOf(handler)
      if (index > -1) {
        this.globalHandlers.splice(index, 1)
      }
    }
  }

  /**
   * Publish an event
   */
  async emit<T = any>(
    type: DomainEventType,
    payload: T,
    metadata?: DomainEvent['metadata']
  ): Promise<void> {
    const event: DomainEvent<T> = {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      payload,
      metadata,
    }

    logger.debug(`Event emitted: ${type}`, {
      eventId: event.id,
      payload,
    })

    metrics.recordCounter('domain_events_emitted_total', 1, {
      event_type: type,
    })

    // Call type-specific handlers
    const handlers = this.handlers.get(type) || []
    await this.executeHandlers(handlers, event)

    // Call global handlers
    await this.executeHandlers(this.globalHandlers, event)
  }

  /**
   * Execute all handlers for an event
   */
  private async executeHandlers<T>(
    handlers: EventHandler<T>[],
    event: DomainEvent<T>
  ): Promise<void> {
    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (error) {
        logger.error(`Error in event handler for ${event.type}`, error as Error, {
          eventId: event.id,
        })
        metrics.recordCounter('domain_event_handler_errors_total', 1, {
          event_type: event.type,
        })
      }
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clearHandlers(): void {
    this.handlers.clear()
    this.globalHandlers = []
  }
}

// Export singleton event bus
export const eventBus = new EventBus()

/**
 * Helper functions for emitting common events
 */
export const emitMemberCreated = (memberId: string, member: any) =>
  eventBus.emit(DomainEventType.MEMBER_CREATED, { memberId, member })

export const emitMemberUpdated = (memberId: string, changes: any) =>
  eventBus.emit(DomainEventType.MEMBER_UPDATED, { memberId, changes })

export const emitMemberDeleted = (memberId: string) =>
  eventBus.emit(DomainEventType.MEMBER_DELETED, { memberId })

export const emitLifeStageChanged = (memberId: string, oldStage: string, newStage: string) =>
  eventBus.emit(DomainEventType.LIFE_STAGE_CHANGED, { memberId, oldStage, newStage })

export const emitArchetypeChanged = (memberId: string, oldArchetype: string, newArchetype: string) =>
  eventBus.emit(DomainEventType.ARCHETYPE_CHANGED, { memberId, oldArchetype, newArchetype })

export const emitStatsUpdated = (memberId: string, stats: any) =>
  eventBus.emit(DomainEventType.STATS_UPDATED, { memberId, stats })

export const emitStreakAchieved = (memberId: string, days: number) =>
  eventBus.emit(DomainEventType.STREAK_ACHIEVED, { memberId, days })

export const emitTagApplied = (memberId: string, tag: string, source: string) =>
  eventBus.emit(DomainEventType.TAG_APPLIED, { memberId, tag, source })

export const emitTagRemoved = (memberId: string, tag: string) =>
  eventBus.emit(DomainEventType.TAG_REMOVED, { memberId, tag })

export const emitCohortCreated = (cohortId: string, cohort: any) =>
  eventBus.emit(DomainEventType.COHORT_CREATED, { cohortId, cohort })

export const emitMemberJoinedCohort = (memberId: string, cohortId: string) =>
  eventBus.emit(DomainEventType.MEMBER_JOINED_COHORT, { memberId, cohortId })

export const emitRelationshipEstablished = (fromMemberId: string, toMemberId: string, type: string) =>
  eventBus.emit(DomainEventType.RELATIONSHIP_ESTABLISHED, { fromMemberId, toMemberId, type })

export const emitSnapshotCreated = (memberId: string, snapshotId: string) =>
  eventBus.emit(DomainEventType.SNAPSHOT_CREATED, { memberId, snapshotId })
