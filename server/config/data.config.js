import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default dataConfig;