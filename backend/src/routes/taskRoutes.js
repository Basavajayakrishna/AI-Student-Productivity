const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/authMiddleware')
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController')

// Protect all task endpoints with JWT middleware
router.use(authenticateToken)

router.route('/')
  .get(getAllTasks)
  .post(createTask)

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask)

module.exports = router
