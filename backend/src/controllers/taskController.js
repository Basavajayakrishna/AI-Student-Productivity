const pool = require('../config/database')

/**
 * GET /api/tasks
 * Retrieve tasks for the authenticated user only
 */
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error fetching user tasks:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve tasks',
      error: error.message,
    })
  }
}

/**
 * GET /api/tasks/:id
 * Retrieve a specific task owned by the authenticated user
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Task with ID '${id}' not found`,
      })
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching task by ID:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve task',
      error: error.message,
    })
  }
}

/**
 * POST /api/tasks
 * Create a task associated with authenticated user (user_id from req.user.id)
 */
const createTask = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, subject, description, due_date, priority, status } = req.body

    // Validate title presence
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Task title is required',
      })
    }

    const query = `
      INSERT INTO tasks (title, subject, description, due_date, priority, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const values = [
      title.trim(),
      subject || null,
      description || null,
      due_date || null,
      priority || 'Medium',
      status || 'pending',
      userId,
    ]

    const result = await pool.query(query, values)

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating task:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task',
      error: error.message,
    })
  }
}

/**
 * PUT /api/tasks/:id
 * Update a task owned by the authenticated user
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { title, subject, description, due_date, priority, status } = req.body

    // Verify task exists and belongs to user
    const existingResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Task with ID '${id}' not found`,
      })
    }

    const currentTask = existingResult.rows[0]

    const updatedTitle = title !== undefined ? title.trim() : currentTask.title
    if (!updatedTitle) {
      return res.status(400).json({
        status: 'fail',
        message: 'Task title cannot be empty',
      })
    }

    const updatedSubject = subject !== undefined ? subject : currentTask.subject
    const updatedDescription = description !== undefined ? description : currentTask.description
    const updatedDueDate = due_date !== undefined ? due_date : currentTask.due_date
    const updatedPriority = priority !== undefined ? priority : currentTask.priority
    const updatedStatus = status !== undefined ? status : currentTask.status

    const query = `
      UPDATE tasks
      SET title = $1, subject = $2, description = $3, due_date = $4, priority = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `
    const values = [
      updatedTitle,
      updatedSubject,
      updatedDescription,
      updatedDueDate,
      updatedPriority,
      updatedStatus,
      id,
      userId,
    ]

    const result = await pool.query(query, values)

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating task:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task',
      error: error.message,
    })
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task owned by the authenticated user
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Task with ID '${id}' not found`,
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error deleting task:', error.message)
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task',
      error: error.message,
    })
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}
