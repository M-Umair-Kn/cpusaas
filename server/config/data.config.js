const path = require('path');

const dataConfig = {
    // Base data directory
    baseDir: path.join(__dirname, '../data'),
    
    // Specific directories
    paths: {
        exports: path.join(__dirname, '../data/exports'),
        backups: path.join(__dirname, '../data/backups'),
        logs: path.join(__dirname, '../data/logs')
    },
    
    // File naming patterns
    filePatterns: {
        databaseBackup: 'db-backup-{timestamp}.sql',
        processExport: 'process-set-{id}-{timestamp}.json',
        simulationExport: 'simulation-{id}-{timestamp}.json',
        logFile: '{date}-app.log'
    }
};

module.exports = dataConfig; 