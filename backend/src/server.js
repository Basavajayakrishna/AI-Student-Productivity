const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.resolve(__dirname, '../.env')
})

const express = require('express')
const cors = require('cors')

const pool = require('./config/database')

const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const aiRoutes = require('./routes/aiRoutes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Student Productivity Backend is running successfully.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/ai', aiRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error(
        'PostgreSQL database connection error:',
        err.message
      )
    } else {
      console.log(
        'PostgreSQL database connected successfully'
      )
    }
  })
})

module.exports = app