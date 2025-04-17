import express from 'express';
import * as processController from '../controllers/process.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new process set
router.post('/', processController.createProcessSet);

// Get all process sets
router.get('/', processController.getProcessSets);

// Get a specific process set
router.get('/:processSetId', processController.getProcessSet);

// Update a process set
router.put('/:processSetId', processController.updateProcessSet);

// Delete a process set
router.delete('/:processSetId', processController.deleteProcessSet);

export default router;