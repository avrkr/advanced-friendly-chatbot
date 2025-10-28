const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many chat requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Simple user validation middleware
const validateUser = (req, res, next) => {
  const userId = req.body.userId || req.params.userId;
  
  if (!userId || userId.length < 1 || userId.length > 100) {
    return res.status(400).json({ 
      error: 'Invalid user ID',
      details: 'User ID must be between 1 and 100 characters'
    });
  }
  
  next();
};

module.exports = {
  chatLimiter,
  validateUser
};