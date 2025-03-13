const express = require('express');
const router = express.Router();
const simulateController = require('../controllers/simulate');
const authMiddleware = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Run a simulation
router.post('/run', simulateController.runSimulation);

// Get all simulations for a user
router.get('/', simulateController.getSimulations);

// Get a specific simulation
router.get('/:simulationId', simulateController.getSimulation);

module.exports = router; 