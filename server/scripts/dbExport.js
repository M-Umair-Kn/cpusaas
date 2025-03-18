const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
    DB_USER,
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT
} = process.env;

const exportDir = path.join(__dirname, '../data/backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const exportPath = path.join(exportDir, `db-backup-${timestamp}.sql`);

// Ensure backup directory exists
if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
}

// Set PGPASSWORD environment variable for authentication
process.env.PGPASSWORD = DB_PASSWORD;

const dumpProcess = spawn('pg_dump', [
    '-h', DB_HOST,
    '-U', DB_USER,
    '-p', DB_PORT,
    '-d', DB_NAME,
    '-F', 'p', // plain text format
    '-f', exportPath,
    '--no-owner', // exclude ownership info for better portability
    '--no-privileges' // exclude privilege assignments
]);

dumpProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

dumpProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

dumpProcess.on('close', (code) => {
    if (code === 0) {
        console.log(`Database successfully exported to: ${exportPath}`);
        
        // Create a metadata file with database connection info
        const metadataPath = exportPath.replace('.sql', '-metadata.json');
        const metadata = {
            exportDate: new Date().toISOString(),
            dbName: DB_NAME,
            version: '1.0.0',
            tables: ['users', 'process_sets', 'processes', 'simulations']
        };
        
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`Metadata file created at: ${metadataPath}`);
    } else {
        console.error(`Export failed with code ${code}`);
    }
}); 