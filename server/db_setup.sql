-- Users Table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  registration_date TIMESTAMP DEFAULT NOW()
);

-- Process Sets
CREATE TABLE process_sets (
  process_set_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  name VARCHAR(100) NOT NULL,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Processes
CREATE TABLE processes (
  process_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_set_id UUID REFERENCES process_sets(process_set_id),
  pid VARCHAR(10) NOT NULL,
  arrival_time INT NOT NULL CHECK (arrival_time >= 0),
  burst_time INT NOT NULL CHECK (burst_time > 0),
  priority INT
);

-- Simulations
CREATE TABLE simulations (
  simulation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  process_set_id UUID REFERENCES process_sets(process_set_id),
  algorithm VARCHAR(50) NOT NULL, -- e.g., "SJF (Non-Preemptive)"
  time_quantum INT, -- For future RR support
  gantt_data JSON,
  metrics JSON
); 