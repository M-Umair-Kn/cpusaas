const express = require('express');
const router = express.Router();
const processController = require('../controllers/process');
const authMiddleware = require('../middlewares/auth');

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

module.exports = router; 