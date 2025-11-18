/**
 * Notification adapter interface and implementations
 */

export interface NotificationPayload {
  to: string | string[]
  subject?: string
  title?: string
  body: string
  data?: Record<string, any>
}

export interface INotificationAdapter {
  /**
   * Send a notification
   */
  send(payload: NotificationPayload): Promise<void>

  /**
   * Send bulk notifications
   */
  sendBulk(payloads: NotificationPayload[]): Promise<void>
}

/**
 * Console logger implementation (for development)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log('[NOTIFICATION]', {
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
    })
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload)
    }
  }
}

/**
 * No-op implementation (for testing or when notifications are disabled)
 */
export class NoOpNotificationAdapter implements INotificationAdapter {
  async send(_payload: NotificationPayload): Promise<void> {
    // Do nothing
  }

  async sendBulk(_payloads: NotificationPayload[]): Promise<void> {
    // Do nothing
  }
}

/**
 * Email notification adapter (stub for external email service)
 */
export class EmailNotificationAdapter implements INotificationAdapter {
  constructor(private config: {
    apiKey?: string
    fromEmail?: string
  }) {}

  async send(payload: NotificationPayload): Promise<void> {
    // TODO: Implement actual email sending via SendGrid, Mailgun, etc.
    console.log('[EMAIL] Would send:', payload)
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    // TODO: Implement bulk email sending
    console.log('[EMAIL] Would send bulk:', payloads.length, 'emails')
  }
}

/**
 * Slack notification adapter (stub for Slack integration)
 */
export class SlackNotificationAdapter implements INotificationAdapter {
  constructor(private config: {
    webhookUrl?: string
    channel?: string
  }) {}

  async send(payload: NotificationPayload): Promise<void> {
    // TODO: Implement Slack webhook
    console.log('[SLACK] Would send:', payload)
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload)
    }
  }
}

// Export default adapter based on environment
export function createNotificationAdapter(): INotificationAdapter {
  const adapterType = process.env.NOTIFICATION_ADAPTER || 'console'

  switch (adapterType) {
    case 'email':
      return new EmailNotificationAdapter({
        apiKey: process.env.EMAIL_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
      })

    case 'slack':
      return new SlackNotificationAdapter({
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL,
      })

    case 'noop':
      return new NoOpNotificationAdapter()

    case 'console':
    default:
      return new ConsoleNotificationAdapter()
  }
}
