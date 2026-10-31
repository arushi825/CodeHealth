import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import Evaluation from '../controller/evaluator.controller.js';
import submitFeedback from '../controller/feedback.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

// Authenticated users: 20 analyses per 15 min (keyed by userId)
// Anonymous: 5 analyses per IP per 15 min
const evaluateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => (req.user ? 20 : 5),
  keyGenerator: (req) => (req.user ? `user_${req.user.userId}` : ipKeyGenerator(req.ip)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many analysis requests. Please try again in 15 minutes.' },
});

// 10 feedback submissions per IP per 15 minutes
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many feedback submissions. Please try again later.' },
});

const evaluatorRouter = express.Router();

// optionalAuth runs before rate limiter so we can key by userId
evaluatorRouter.post('/evaluate', optionalAuth, evaluateLimiter, Evaluation);

evaluatorRouter.post('/feedback', feedbackLimiter, submitFeedback);

export default evaluatorRouter;