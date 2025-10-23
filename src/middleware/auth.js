const supabase = require('../config/supabase');
const { verifyToken } = require('../utils/auth.js');

const authenticateToken = async (req, res, next) => {
  // Bypass authentication in development or test environment
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // Mock user object for development/testing
    req.user = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      role: 'developer'
    };
    console.log(`${process.env.NODE_ENV} mode: Authentication bypassed`);
    return next();
  }
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    try {
      // Verify the token
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      req.user = payload;
      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

module.exports = { authenticateToken };