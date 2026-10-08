const express = require('express')

const router = express.Router()

const { chatWithTutor, generateStudyPlan } = require('../controllers/aiController')
const { authenticateToken } = require('../middleware/authMiddleware')

router.post('/chat', authenticateToken, chatWithTutor)
router.post('/study-plan', authenticateToken, generateStudyPlan)

module.exports = router