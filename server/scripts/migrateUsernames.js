import pool from '../config/db.js';
import { config } from 'dotenv';

config();

async function migrateUsernames() {
  try {
    console.log('Starting username migration...');
    
    // Check if username column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='username'
    `);
    
    // Add username column if it doesn't exist
    if (columnCheck.rows.length === 0) {
      console.log('Adding username column to users table...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(50) UNIQUE
      `);
      console.log('Username column added successfully.');
    } else {
      console.log('Username column already exists in the users table.');
    }
    
    // Get users without usernames
    const result = await pool.query('SELECT user_id, email FROM users WHERE username IS NULL');
    console.log(`Found ${result.rows.length} users without usernames to migrate.`);
    
    // For each user, set username from email (without domain)
    for (const user of result.rows) {
      const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Try to insert username, if conflict occurs, add a number and try again
      while (true) {
        try {
          await pool.query('UPDATE users SET username = $1 WHERE user_id = $2', 
                         [username, user.user_id]);
          console.log(`Updated user ${user.email} with username: ${username}`);
          break;
        } catch (err) {
          if (err.code === '23505') { // Unique violation
            username = `${baseUsername}${counter++}`;
            console.log(`Username conflict, trying ${username} instead.`);
          } else {
            throw err;
          }
        }
      }
    }
    
    // Make username column NOT NULL after migration
    const nullCheck = await pool.query('SELECT COUNT(*) FROM users WHERE username IS NULL');
    if (parseInt(nullCheck.rows[0].count) === 0) {
      console.log('Adding NOT NULL constraint to username column...');
      await pool.query('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
      console.log('NOT NULL constraint added successfully.');
    } else {
      console.log(`Warning: ${nullCheck.rows[0].count} users still have NULL usernames.`);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrateUsernames();