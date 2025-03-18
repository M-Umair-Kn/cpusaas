const express = require('express');
const cors = require('cors');
const setupDatabase = require('./setupDatabase');
const DataManager = require('./utils/dataManager');
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

// Initialize the application
async function initializeApp() {
    try {
        // Ensure data directories exist
        await DataManager.ensureDirectories();
        await DataManager.log('Data directories initialized successfully');

        // Setup database
        await setupDatabase();
        await DataManager.log('Database setup completed');

        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            DataManager.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
}

// Routes
app.get('/', (req, res) => {
    res.send('CPU Scheduling Simulator API is running');
});

// Initialize the application
initializeApp(); 