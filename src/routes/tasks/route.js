import { Router } from 'express'
import asyncHandler from '../../common/handlers/asyncHandler'
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask
} from '../../controller/TaskController'

const router = Router()

router.get('/', isAuthenticated, asyncHandler(getAllTasks))
router.post('/', asyncHandler(createTask))
router.get('/:taskID', asyncHandler(getTask))
router.put('/:taskID', asyncHandler(updateTask))
router.delete('/:taskID', asyncHandler(deleteTask))

export default router

// Temporary authentication middleware
function isAuthenticated(req, res, next) {
  next()
}
