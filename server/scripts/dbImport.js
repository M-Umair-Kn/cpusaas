import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const {
    DB_USER,
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT
} = process.env;

// Get the backup file path from command line arguments
const backupFile = process.argv[2];
if (!backupFile) {
    console.error('Please provide the backup file path as an argument');
    process.exit(1);
}

const fullBackupPath = path.resolve(backupFile);

if (!fs.existsSync(fullBackupPath)) {
    console.error(`Backup file not found: ${fullBackupPath}`);
    process.exit(1);
}

// Set PGPASSWORD environment variable for authentication
process.env.PGPASSWORD = DB_PASSWORD;

// First, create a fresh database
const dropDb = spawn('dropdb', [
    '-h', DB_HOST,
    '-U', DB_USER,
    '-p', DB_PORT,
    '--if-exists',
    DB_NAME
]);

dropDb.on('close', (code) => {
    if (code !== 0 && code !== 1) {
        console.error(`Failed to drop database with code ${code}`);
        // Perform any necessary cleanup
        process.exitCode = 1; // Set exit code but allow normal termination
        return; // Exit function instead of process
    }

    const createDb = spawn('createdb', [
        '-h', DB_HOST,
        '-U', DB_USER,
        '-p', DB_PORT,
        DB_NAME
    ]);

    createDb.on('close', (code) => {
        if (code !== 0) {
            console.error(`Failed to create database with code ${code}`);
            process.exit(1);
        }

        // Now restore the backup
        const restoreProcess = spawn('psql', [
            '-h', DB_HOST,
            '-U', DB_USER,
            '-p', DB_PORT,
            '-d', DB_NAME,
            '-f', fullBackupPath
        ]);

        restoreProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        restoreProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        restoreProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Database successfully restored!');
                
                // Check for metadata file
                const metadataPath = fullBackupPath.replace('.sql', '-metadata.json');
                if (fs.existsSync(metadataPath)) {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath));
                    console.log('Backup metadata:', metadata);
                }
            } else {
                console.error(`Restore failed with code ${code}`);
            }
        });
    });
});