import pool from '../config/db.js';

// Create a new process set
export const createProcessSet = async (req, res) => {
  // Check if user is a guest
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Guest users cannot save process sets' });
  }
  
  const { name, processes } = req.body;
  const userId = req.user.id;

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Create process set
    const newProcessSet = await pool.query(
      'INSERT INTO process_sets (user_id, name) VALUES ($1, $2) RETURNING process_set_id',
      [userId, name]
    );

    const processSetId = newProcessSet.rows[0].process_set_id;

    // Add processes to the set
    for (const process of processes) {
      await pool.query(
        'INSERT INTO processes (process_set_id, pid, arrival_time, burst_time, priority) VALUES ($1, $2, $3, $4, $5)',
        [
          processSetId,
          process.pid,
          process.arrival_time,
          process.burst_time,
          process.priority || null
        ]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Process set created successfully',
      processSetId
    });
  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all process sets for a user
export const getProcessSets = async (req, res) => {
  // Check if user is a guest
  if (req.user.isGuest) {
    return res.json([]); // Return empty array for guest users
  }
  
  try {
    const processSets = await pool.query(
      'SELECT * FROM process_sets WHERE user_id = $1 ORDER BY created_date DESC',
      [req.user.id]
    );

    res.json(processSets.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific process set with its processes
export const getProcessSet = async (req, res) => {
  // Check if user is a guest
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Guest users cannot access saved process sets' });
  }
  
  const { processSetId } = req.params;

  try {
    // Get process set
    const processSet = await pool.query(
      'SELECT * FROM process_sets WHERE process_set_id = $1 AND user_id = $2',
      [processSetId, req.user.id]
    );

    if (processSet.rows.length === 0) {
      return res.status(404).json({ message: 'Process set not found' });
    }

    // Get processes
    const processes = await pool.query(
      'SELECT * FROM processes WHERE process_set_id = $1 ORDER BY pid',
      [processSetId]
    );

    res.json({
      processSet: processSet.rows[0],
      processes: processes.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a process set
export const updateProcessSet = async (req, res) => {
  // Check if user is a guest
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Guest users cannot update process sets' });
  }
  
  const { processSetId } = req.params;
  const { name, processes } = req.body;

  try {
    // Check if process set exists and belongs to user
    const processSet = await pool.query(
      'SELECT * FROM process_sets WHERE process_set_id = $1 AND user_id = $2',
      [processSetId, req.user.id]
    );

    if (processSet.rows.length === 0) {
      return res.status(404).json({ message: 'Process set not found' });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Update process set name
    await pool.query(
      'UPDATE process_sets SET name = $1 WHERE process_set_id = $2',
      [name, processSetId]
    );

    // Delete existing processes
    await pool.query(
      'DELETE FROM processes WHERE process_set_id = $1',
      [processSetId]
    );

    // Add new processes
    for (const process of processes) {
      await pool.query(
        'INSERT INTO processes (process_set_id, pid, arrival_time, burst_time, priority) VALUES ($1, $2, $3, $4, $5)',
        [
          processSetId,
          process.pid,
          process.arrival_time,
          process.burst_time,
          process.priority || null
        ]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ message: 'Process set updated successfully' });
  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a process set
export const deleteProcessSet = async (req, res) => {
  // Check if user is a guest
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Guest users cannot delete process sets' });
  }
  
  const { processSetId } = req.params;

  try {
    // Check if process set exists and belongs to user
    const processSet = await pool.query(
      'SELECT * FROM process_sets WHERE process_set_id = $1 AND user_id = $2',
      [processSetId, req.user.id]
    );

    if (processSet.rows.length === 0) {
      return res.status(404).json({ message: 'Process set not found' });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Delete related simulations first (to handle foreign key constraint)
    await pool.query(
      'DELETE FROM simulations WHERE process_set_id = $1',
      [processSetId]
    );

    // Delete processes
    await pool.query(
      'DELETE FROM processes WHERE process_set_id = $1',
      [processSetId]
    );

    // Delete process set
    await pool.query(
      'DELETE FROM process_sets WHERE process_set_id = $1',
      [processSetId]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ message: 'Process set deleted successfully' });
  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};