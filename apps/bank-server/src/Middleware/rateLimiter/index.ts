import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

