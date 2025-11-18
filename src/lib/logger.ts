/**
 * Structured logging utility with context support
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: any
}

class Logger {
  private context: LogContext = {}

  constructor(private defaultContext: LogContext = {}) {
    this.context = defaultContext
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext })
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = error
      ? {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        }
      : {}

    this.log(LogLevel.ERROR, message, { ...errorContext, ...context })
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const fullContext = { ...this.context, ...context }

    const logEntry = {
      timestamp,
      level,
      message,
      ...fullContext,
    }

    // In development, pretty print
    if (process.env.NODE_ENV === 'development') {
      const levelColors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
      }

      const color = levelColors[level]
      const reset = '\x1b[0m'

      console.log(
        `${color}[${level.toUpperCase()}]${reset} ${timestamp} ${message}`,
        Object.keys(fullContext).length > 0 ? fullContext : ''
      )
    } else {
      // In production, output structured JSON
      console.log(JSON.stringify(logEntry))
    }
  }
}

// Export singleton logger
export const logger = new Logger({
  service: 'soul-profile-registry',
  version: process.env.npm_package_version || '0.1.0',
})

// Export class for creating custom loggers
export { Logger }
