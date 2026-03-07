import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again later',
      details: null,
    },
  },
});
