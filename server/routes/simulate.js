import express from 'express';
import * as simulateController from '../controllers/simulate.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Run a simulation
router.post('/run', simulateController.runSimulation);

// Get all simulations for a user
router.get('/', simulateController.getSimulations);

// Get a specific simulation
router.get('/:simulationId', simulateController.getSimulation);

export default router;