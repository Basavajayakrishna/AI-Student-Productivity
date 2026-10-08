const path = require('path')
const dotenv = require('dotenv')

// Ensure dotenv is loaded with absolute path to backend/.env before creating Pool
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'student_productivity',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err)
})

module.exports = pool


