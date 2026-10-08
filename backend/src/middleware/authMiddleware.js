const jwt = require('jsonwebtoken')

/**
 * JWT Authentication Middleware
 * Verifies Authorization header bearer token and attaches user payload to req.user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.',
    })
  }

  try {
    const secret = process.env.JWT_SECRET || 'student_productivity_secret_change_this'
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token.',
    })
  }
}

module.exports = { authenticateToken }
