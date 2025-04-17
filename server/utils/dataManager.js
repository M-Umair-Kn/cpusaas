import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataManager {
    static async ensureDirectories() {
        const dataDir = path.join(__dirname, '../data');
        const directories = [
            path.join(dataDir, 'exports'),
            path.join(dataDir, 'backups'),
            path.join(dataDir, 'logs')
        ];

        for (const dir of directories) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }

    static async log(message, level = 'info') {
        const dataDir = path.join(__dirname, '../data/logs');
        const date = new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString();
        const logFile = path.join(dataDir, `${date}-app.log`);
        
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        await fs.appendFile(logFile, logEntry);
    }
}

export default DataManager;