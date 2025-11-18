/**
 * Metrics collection and observability
 */

import { logger } from './logger'

export interface MetricLabels {
  [key: string]: string | number
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

interface Metric {
  name: string
  type: MetricType
  value: number
  labels: MetricLabels
  timestamp: Date
}

class MetricsCollector {
  private metrics: Metric[] = []
  private enabled: boolean

  constructor() {
    this.enabled = process.env.ENABLE_METRICS === 'true'
  }

  /**
   * Record a counter metric (incrementing value)
   */
  recordCounter(name: string, value: number = 1, labels: MetricLabels = {}) {
    this.record(MetricType.COUNTER, name, value, labels)
  }

  /**
   * Record a gauge metric (point-in-time value)
   */
  recordGauge(name: string, value: number, labels: MetricLabels = {}) {
    this.record(MetricType.GAUGE, name, value, labels)
  }

  /**
   * Record a histogram metric (distribution of values)
   */
  recordHistogram(name: string, value: number, labels: MetricLabels = {}) {
    this.record(MetricType.HISTOGRAM, name, value, labels)
  }

  /**
   * Measure execution time of a function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    labels: MetricLabels = {}
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.recordHistogram(`${name}_duration_ms`, duration, {
        ...labels,
        status: 'success',
      })
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.recordHistogram(`${name}_duration_ms`, duration, {
        ...labels,
        status: 'error',
      })
      throw error
    }
  }

  /**
   * Core metric recording method
   */
  private record(
    type: MetricType,
    name: string,
    value: number,
    labels: MetricLabels
  ) {
    if (!this.enabled) {
      return
    }

    const metric: Metric = {
      name,
      type,
      value,
      labels,
      timestamp: new Date(),
    }

    this.metrics.push(metric)

    // Log metric in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Metric recorded: ${name}`, {
        type,
        value,
        labels,
      })
    }

    // In production, you would send to Prometheus, Datadog, etc.
    // For now, we just store in memory
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): Metric[] {
    return [...this.metrics]
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = []
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = []

    // Group metrics by name
    const metricsByName = new Map<string, Metric[]>()
    for (const metric of this.metrics) {
      const existing = metricsByName.get(metric.name) || []
      existing.push(metric)
      metricsByName.set(metric.name, existing)
    }

    // Format each metric group
    for (const [name, metrics] of metricsByName) {
      const type = metrics[0].type
      lines.push(`# TYPE ${name} ${type}`)

      for (const metric of metrics) {
        const labelStr = Object.entries(metric.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',')

        const metricLine = labelStr
          ? `${name}{${labelStr}} ${metric.value}`
          : `${name} ${metric.value}`

        lines.push(metricLine)
      }
      lines.push('')
    }

    return lines.join('\n')
  }
}

// Export singleton metrics collector
export const metrics = new MetricsCollector()

/**
 * Common business metrics helpers
 */
export const businessMetrics = {
  memberCreated: (lifeStage: string) => {
    metrics.recordCounter('members_created_total', 1, { lifeStage })
  },

  memberDeleted: () => {
    metrics.recordCounter('members_deleted_total', 1)
  },

  profileUpdated: (updateType: string) => {
    metrics.recordCounter('profiles_updated_total', 1, { updateType })
  },

  statsEventIngested: (eventType: string) => {
    metrics.recordCounter('stats_events_ingested_total', 1, { eventType })
  },

  tagApplied: (source: string) => {
    metrics.recordCounter('tags_applied_total', 1, { source })
  },

  cohortCreated: () => {
    metrics.recordCounter('cohorts_created_total', 1)
  },

  relationshipEstablished: (type: string) => {
    metrics.recordCounter('relationships_established_total', 1, { type })
  },

  apiRequest: (method: string, path: string, statusCode: number, durationMs: number) => {
    metrics.recordCounter('api_requests_total', 1, {
      method,
      path,
      status: statusCode,
    })
    metrics.recordHistogram('api_request_duration_ms', durationMs, {
      method,
      path,
    })
  },
}
