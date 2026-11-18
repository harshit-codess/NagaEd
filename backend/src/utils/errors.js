'use strict';

/**
 * Operational error that is safe to show to API clients.
 * Every error response has the same shape:
 *   { "error": { "code": "...", "message": "...", "details": [...]? } }
 */
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }
  static validation(details) {
    return new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }
  static invalidCredentials() {
    return new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }
  static forbidden(message = 'You are not allowed to access this resource') {
    return new AppError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }
  static conflict(message, code = 'CONFLICT') {
    return new AppError(409, code, message);
  }
}

module.exports = { AppError };
