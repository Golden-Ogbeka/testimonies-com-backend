import { rateLimit } from 'express-rate-limit';
import { ErrorCodes } from './error-codes';

/**
 * Fixed rate limit for auth endpoints (login, signup, OTP, password reset) to reduce brute-force.
 * Industry-standard: 10 requests per 15 minutes per IP. Not configurable via env.
 */
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_PER_WINDOW = 10;

export const authRateLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  limit: AUTH_MAX_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many auth attempts. Try again in 15 minutes.',
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  },
});
