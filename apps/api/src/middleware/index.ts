// Export all middleware
export { authMiddleware, optionalAuthMiddleware, requireRole, adminOnly, lawyerOnly } from './auth.js';
export { errorHandler, notFoundHandler, requestLogger, responseWrapper } from './error-handler.js';
export { rateLimit, rateLimiters, kvRateLimit } from './rate-limit.js';
export {
  securityHeadersMiddleware,
  csrfProtection,
  getCSRFToken,
  validateOrigin,
  sanitizeRequestBody,
  limitRequestSize,
  ipAccessControl,
  validateRequestParams,
  secureLogger,
  securityMiddleware,
  logSecurityEvent,
  redactSensitiveData,
} from './security.js';
