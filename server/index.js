const express = require('express');
const cors = require('cors');
const setupDatabase = require('./setupDatabase');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const processRoutes = require('./routes/process');
const simulateRoutes = require('./routes/simulate');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/process', processRoutes);
app.use('/api/simulate', simulateRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('CPU Scheduling Simulator API is running');
});

// Start server after database setup
const PORT = process.env.PORT || 5000;
setupDatabase()
  .then(success => {
    if (success) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error('Failed to set up database, server not started');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error during startup:', err);
    process.exit(1);
  }); 