/**
 * Central export for all adapters
 */

export * from './notifications'
export * from './storage'
export * from './analytics'

import { createNotificationAdapter, type INotificationAdapter } from './notifications'
import { createStorageAdapter, type IStorageAdapter } from './storage'
import { createAnalyticsAdapter, type IAnalyticsAdapter } from './analytics'

/**
 * Adapter registry for managing all adapters in the application
 */
class AdapterRegistry {
  private _notification?: INotificationAdapter
  private _storage?: IStorageAdapter
  private _analytics?: IAnalyticsAdapter

  get notification(): INotificationAdapter {
    if (!this._notification) {
      this._notification = createNotificationAdapter()
    }
    return this._notification
  }

  get storage(): IStorageAdapter {
    if (!this._storage) {
      this._storage = createStorageAdapter()
    }
    return this._storage
  }

  get analytics(): IAnalyticsAdapter {
    if (!this._analytics) {
      this._analytics = createAnalyticsAdapter()
    }
    return this._analytics
  }

  /**
   * Set custom adapters (useful for testing or custom implementations)
   */
  setNotificationAdapter(adapter: INotificationAdapter) {
    this._notification = adapter
  }

  setStorageAdapter(adapter: IStorageAdapter) {
    this._storage = adapter
  }

  setAnalyticsAdapter(adapter: IAnalyticsAdapter) {
    this._analytics = adapter
  }

  /**
   * Reset all adapters (useful for testing)
   */
  reset() {
    this._notification = undefined
    this._storage = undefined
    this._analytics = undefined
  }
}

// Export singleton registry
export const adapters = new AdapterRegistry()
