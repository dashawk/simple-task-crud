import { query } from '../config/database.js'
import NotFoundError from '../common/errors/NotFoundError.js'
import AppError from '../common/errors/AppError.js'

/**
 * Get all tasks from the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllTasks = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC')

    return res.response({
      message: 'Tasks retrieved successfully',
      tasks: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    throw new AppError('Failed to retrieve tasks', 500)
  }
}

/**
 * Get a specific task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getTask = async (req, res, next) => {
  try {
    const { taskID } = req.params

    // Validate task ID
    if (!taskID || isNaN(parseInt(taskID))) {
      throw new AppError('Invalid task ID provided', 400)
    }

    const result = await query('SELECT * FROM tasks WHERE id = $1', [taskID])

    if (result.rows.length === 0) {
      throw new NotFoundError('Task not found')
    }

    return res.response({
      message: 'Task retrieved successfully',
      task: result.rows[0]
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to retrieve task', 500)
  }
}

/**
 * Create a new task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, completed = false } = req.body

    // Validate required fields
    if (!title || title.trim().length === 0) {
      throw new AppError('Title is required and cannot be empty', 400)
    }

    if (title.length > 255) {
      throw new AppError('Title cannot exceed 255 characters', 400)
    }

    // Validate completed field if provided
    if (completed !== undefined && typeof completed !== 'boolean') {
      throw new AppError('Completed field must be a boolean value', 400)
    }

    const result = await query(
      'INSERT INTO tasks (title, description, completed) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description || null, completed]
    )

    return res.response(
      {
        message: 'Task created successfully',
        task: result.rows[0]
      },
      201
    )
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // Log the actual database error for debugging
    console.error('Database error in createTask:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack
    })

    // Specific error messages based on PostgreSQL error codes
    if (error.code === '42P01') {
      throw new AppError(
        'Database table does not exist. Please ensure the database schema is properly initialized.',
        500
      )
    }

    if (error.code === '28000') {
      throw new AppError(
        'Database authentication failed. Please check your database credentials.',
        500
      )
    }

    if (error.code === 'ECONNREFUSED') {
      throw new AppError(
        'Cannot connect to database. Please check your database connection settings.',
        500
      )
    }

    throw new AppError(`Failed to create task: ${error.message}`, 500)
  }
}

/**
 * Update an existing task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateTask = async (req, res, next) => {
  try {
    const { taskID } = req.params
    const { title, description, completed } = req.body

    // Validate task ID
    if (!taskID || isNaN(parseInt(taskID))) {
      throw new AppError('Invalid task ID provided', 400)
    }

    // Check if task exists
    const existingTask = await query('SELECT * FROM tasks WHERE id = $1', [
      taskID
    ])

    if (existingTask.rows.length === 0) {
      throw new NotFoundError('Task not found')
    }

    // Validate input fields
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        throw new AppError('Title cannot be empty', 400)
      }
      if (title.length > 255) {
        throw new AppError('Title cannot exceed 255 characters', 400)
      }
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      throw new AppError('Completed field must be a boolean value', 400)
    }

    // Build dynamic update query
    const updates = []
    const values = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title.trim())
      paramCount++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(description)
      paramCount++
    }

    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`)
      values.push(completed)
      paramCount++
    }

    // If no fields to update
    if (updates.length === 0) {
      throw new AppError('No valid fields provided for update', 400)
    }

    // Add task ID as the last parameter
    values.push(taskID)

    const updateQuery = `
      UPDATE tasks
      SET ${updates.join(', ')}, updated_at = now()
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await query(updateQuery, values)

    return res.response({
      message: 'Task updated successfully',
      task: result.rows[0]
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to update task', 500)
  }
}

/**
 * Delete a task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { taskID } = req.params

    // Validate task ID
    if (!taskID || isNaN(parseInt(taskID))) {
      throw new AppError('Invalid task ID provided', 400)
    }

    // Check if task exists and delete it
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING *', [
      taskID
    ])

    if (result.rows.length === 0) {
      throw new NotFoundError('Task not found')
    }

    return res.response({
      message: 'Task deleted successfully',
      task: result.rows[0]
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to delete task', 500)
  }
}
