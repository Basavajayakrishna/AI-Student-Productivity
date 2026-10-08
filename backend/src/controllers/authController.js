const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/database')

/**
 * POST /api/auth/register
 * Register a new user account
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate email and password inputs
    if (!email || !email.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is required',
      })
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password is required',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists',
      })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert user into PostgreSQL users table
    const query = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `
    const values = [name ? name.trim() : null, normalizedEmail, passwordHash]
    const result = await pool.query(query, values)

    const newUser = result.rows[0]

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    })
  } catch (error) {
    console.error('Registration error:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error.message,
    })
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both email and password',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail])
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      })
    }

    const user = result.rows[0]

    // Verify password match
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      })
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'student_productivity_secret_change_this'
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate user',
      error: error.message,
    })
  }
}

module.exports = {
  register,
  login,
}
