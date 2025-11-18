/**
 * Custom error classes and centralized error handling
 */

export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Not found errors (404)
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict errors (409)
  DUPLICATE_MEMBER = 'DUPLICATE_MEMBER',
  CONFLICT = 'CONFLICT',

  // Permission errors (403)
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`

    super(ErrorCode.RESOURCE_NOT_FOUND, message, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.CONFLICT, message, 409, details)
    this.name = 'ConflictError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(ErrorCode.FORBIDDEN, message, 403)
    this.name = 'ForbiddenError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(ErrorCode.UNAUTHORIZED, message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details)
    this.name = 'DatabaseError'
  }
}

/**
 * Convert Prisma errors to AppErrors
 */
export function handlePrismaError(error: any): AppError {
  // P2002: Unique constraint violation
  if (error.code === 'P2002') {
    return new ConflictError('Resource already exists', {
      fields: error.meta?.target,
    })
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    return new NotFoundError('Resource')
  }

  // P2003: Foreign key constraint violation
  if (error.code === 'P2003') {
    return new ValidationError('Invalid reference to related resource', {
      field: error.meta?.field_name,
    })
  }

  // Default database error
  return new DatabaseError('Database operation failed', {
    code: error.code,
    message: error.message,
  })
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: Error | AppError) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: error.toJSON(),
    }
  }

  // Unhandled error - don't leak details in production
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    status: 500,
    body: {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: isProduction
          ? 'An internal error occurred'
          : error.message,
        ...(isProduction ? {} : { stack: error.stack }),
      },
    },
  }
}
