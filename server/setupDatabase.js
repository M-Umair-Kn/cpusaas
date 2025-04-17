import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

async function setupDatabase() {
  // Connection to PostgreSQL server with 'postgres' database to create our database
  const serverPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default database first
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    // Check if our database exists
    const dbCheckResult = await serverPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'cpu_scheduling']
    );

    // Create our database if it doesn't exist
    if (dbCheckResult.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME || 'cpu_scheduling'}...`);
      await serverPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'cpu_scheduling'}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database ${process.env.DB_NAME || 'cpu_scheduling'} already exists`);
    }

    // Close connection to server
    await serverPool.end();

    // Connect to our new database to create tables
    const appPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cpu_scheduling',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    // Check if tables already exist
    const tableCheckResult = await appPool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public'"
    );

    if (tableCheckResult.rowCount === 0) {
      // Tables don't exist, create them
      console.log('Creating tables...');
      
      // Read SQL file
      const sqlScript = fs.readFileSync(path.join(__dirname, 'db_setup.sql'), 'utf8');
      
      // Split script into individual statements
      const statements = sqlScript
        .split(';')
        .filter(statement => statement.trim() !== '');
      
      // Execute each statement
      for (const statement of statements) {
        await appPool.query(statement);
      }
      
      console.log('Tables created successfully');
    } else {
      console.log('Tables already exist, skipping creation');
    }
    
    await appPool.end();
    return true;
  } catch (err) {
    console.error('Database setup error:', err);
    return false;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('Database setup completed successfully');
      } else {
        console.log('Database setup failed');
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

// Export for use in other files
export default setupDatabase;