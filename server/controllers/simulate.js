import pool from '../config/db.js';

// Helper function to calculate metrics
const calculateMetrics = (gantt, processes) => {
  const metrics = {
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    averageResponseTime: 0,
    cpuUtilization: 0,
    throughput: 0,
    processMetrics: {}
  };

  // Create a map of processes for easier access
  const processMap = {};
  processes.forEach(p => {
    processMap[p.pid] = { ...p };
    metrics.processMetrics[p.pid] = {
      waitingTime: 0,
      turnaroundTime: 0,
      responseTime: -1 // -1 means not set yet
    };
  });

  // Calculate individual process metrics
  gantt.forEach(entry => {
    const pid = entry.pid;
    const start = entry.start;
    const end = entry.end;
    const process = processMap[pid];
    
    // First time a process runs - set response time
    if (metrics.processMetrics[pid].responseTime === -1) {
      metrics.processMetrics[pid].responseTime = Math.max(0, start - process.arrival_time);
    }
    
    // Update turnaround time (completion time - arrival time)
    metrics.processMetrics[pid].turnaroundTime = end - process.arrival_time;
    
    // Waiting time = Turnaround time - Burst time
    metrics.processMetrics[pid].waitingTime = 
      metrics.processMetrics[pid].turnaroundTime - process.burst_time;
  });

  // Calculate averages
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let totalResponseTime = 0;
  const pids = Object.keys(metrics.processMetrics);
  
  pids.forEach(pid => {
    totalWaitingTime += metrics.processMetrics[pid].waitingTime;
    totalTurnaroundTime += metrics.processMetrics[pid].turnaroundTime;
    totalResponseTime += metrics.processMetrics[pid].responseTime;
  });

  metrics.averageWaitingTime = totalWaitingTime / pids.length;
  metrics.averageTurnaroundTime = totalTurnaroundTime / pids.length;
  metrics.averageResponseTime = totalResponseTime / pids.length;

  // Calculate CPU Utilization
  if (gantt.length > 0) {
    // Total time from start to finish
    const totalSimulationTime = gantt[gantt.length - 1].end - Math.min(...processes.map(p => p.arrival_time));
    
    // Total time CPU was busy (sum of all gantt chart segments)
    const totalBusyTime = gantt.reduce((sum, segment) => sum + (segment.end - segment.start), 0);
    
    metrics.cpuUtilization = (totalBusyTime / totalSimulationTime) * 100;
    
    // Calculate throughput (processes per unit time)
    metrics.throughput = processes.length / totalSimulationTime;
  }

  return metrics;
};

// First Come First Served (FCFS) algorithm
const fcfs = (processes) => {
  // Sort processes by arrival time
  const sortedProcesses = [...processes].sort((a, b) => a.arrival_time - b.arrival_time);
  
  let currentTime = 0;
  const algoName = "First Come First Serve";
  const gantt = [];
  
  sortedProcesses.forEach(process => {
    // If current time is less than arrival time, move time forward
    if (currentTime < process.arrival_time) {
      currentTime = process.arrival_time;
    }
    
    // Add process to Gantt chart
    gantt.push({
      pid: process.pid,
      start: currentTime,
      end: currentTime + process.burst_time
    });
    
    // Move time forward
    currentTime += process.burst_time;
  });
  
  return { algoName, gantt, metrics: calculateMetrics(gantt, processes) };
};

// Shortest Job First (SJF) Non-Preemptive algorithm
const sjfNonPreemptive = (processes) => {
  const remainingProcesses = [...processes].map(p => ({ ...p, remaining: p.burst_time }));
  
  let currentTime = 0;
  const algoName = "Shortest Job First";
  const gantt = [];
  
  while (remainingProcesses.length > 0) {
    // Find ready processes
    const readyProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
    
    if (readyProcesses.length === 0) {
      // No processes are ready, move time forward to the next arrival
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the process with the smallest burst time
    const shortestJob = readyProcesses.reduce(
      (min, p) => p.burst_time < min.burst_time ? p : min,
      readyProcesses[0]
    );
    
    // Add process to Gantt chart
    gantt.push({
      pid: shortestJob.pid,
      start: currentTime,
      end: currentTime + shortestJob.burst_time
    });
    
    // Move time forward
    currentTime += shortestJob.burst_time;
    
    // Remove the processed job
    const index = remainingProcesses.findIndex(p => p.pid === shortestJob.pid);
    remainingProcesses.splice(index, 1);
  }
  
  return {algoName, gantt, metrics: calculateMetrics(gantt, processes) };
};

// Shortest Remaining Time First (SRTF) Preemptive algorithm
const srtf = (processes) => {
  const remainingProcesses = [...processes].map(p => ({ ...p, remaining: p.burst_time }));
  
  let currentTime = 0;
  const algoName = "Shortest Remaining Time First";
  const gantt = [];
  let lastRunningPid = null;
  let lastStartTime = 0;
  
  while (remainingProcesses.length > 0) {
    // Find ready processes
    const readyProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
    
    if (readyProcesses.length === 0) {
      // No processes are ready, move time forward to the next arrival
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the process with the smallest remaining time
    const shortestRemainingJob = readyProcesses.reduce(
      (min, p) => p.remaining < min.remaining ? p : min,
      readyProcesses[0]
    );
    
    // If the running process changes, add the previous one to the Gantt chart
    if (lastRunningPid !== null && lastRunningPid !== shortestRemainingJob.pid) {
      gantt.push({
        pid: lastRunningPid,
        start: lastStartTime,
        end: currentTime
      });
      lastStartTime = currentTime;
    } else if (lastRunningPid === null) {
      lastStartTime = currentTime;
    }
    
    // Update the running process
    lastRunningPid = shortestRemainingJob.pid;
    
    // Determine how long this process will run
    const timeSlice = 1; // Run for 1 time unit and then reevaluate
    
    // Check if any new process arrives during this time slice
    const nextArrival = remainingProcesses
      .filter(p => p.arrival_time > currentTime)
      .reduce((min, p) => p.arrival_time < min ? p.arrival_time : min, currentTime + timeSlice);
    
    const runTime = Math.min(timeSlice, nextArrival - currentTime, shortestRemainingJob.remaining);
    
    // Update remaining time for the running process
    const runningProcessIndex = remainingProcesses.findIndex(p => p.pid === shortestRemainingJob.pid);
    remainingProcesses[runningProcessIndex].remaining -= runTime;
    
    // Move time forward
    currentTime += runTime;
    
    // If the process is complete, remove it
    if (remainingProcesses[runningProcessIndex].remaining <= 0) {
      // Add the final segment to the Gantt chart
      gantt.push({
        pid: lastRunningPid,
        start: lastStartTime,
        end: currentTime
      });
      
      // Reset tracking variables
      lastRunningPid = null;
      
      // Remove the completed process
      remainingProcesses.splice(runningProcessIndex, 1);
    }
  }
  
  // Merge adjacent Gantt entries for the same process
  const mergedGantt = [];
  for (let i = 0; i < gantt.length; i++) {
    if (i === 0 || gantt[i].pid !== gantt[i-1].pid) {
      mergedGantt.push({ ...gantt[i] });
    } else {
      mergedGantt[mergedGantt.length - 1].end = gantt[i].end;
    }
  }
  
  return { algoName, gantt: mergedGantt, metrics: calculateMetrics(mergedGantt, processes) };
};

// Priority Scheduling (Non-Preemptive) algorithm
const priorityNonPreemptive = (processes) => {
  const remainingProcesses = [...processes].map(p => ({ ...p, remaining: p.burst_time }));
  
  let currentTime = 0;
  const algoName = "Priority";
  const gantt = [];
  
  while (remainingProcesses.length > 0) {
    // Find ready processes
    const readyProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
    
    if (readyProcesses.length === 0) {
      // No processes are ready, move time forward to the next arrival
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the process with the highest priority (lower number = higher priority)
    const highestPriorityJob = readyProcesses.reduce(
      (min, p) => (p.priority < min.priority) ? p : min,
      readyProcesses[0]
    );
    
    // Add process to Gantt chart
    gantt.push({
      pid: highestPriorityJob.pid,
      start: currentTime,
      end: currentTime + highestPriorityJob.burst_time
    });
    
    // Move time forward
    currentTime += highestPriorityJob.burst_time;
    
    // Remove the processed job
    const index = remainingProcesses.findIndex(p => p.pid === highestPriorityJob.pid);
    remainingProcesses.splice(index, 1);
  }
  
  return { algoName, gantt, metrics: calculateMetrics(gantt, processes) };
};

// Priority Scheduling (Preemptive) algorithm
const priorityPreemptive = (processes) => {
  const remainingProcesses = [...processes].map(p => ({ ...p, remaining: p.burst_time }));
  
  let currentTime = 0;
  const algoName = "Priority (Preemptive)";
  const gantt = [];
  let lastRunningPid = null;
  let lastStartTime = 0;
  
  while (remainingProcesses.length > 0) {
    // Find ready processes
    const readyProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
    
    if (readyProcesses.length === 0) {
      // No processes are ready, move time forward to the next arrival
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
      currentTime = nextArrival;
      continue;
    }
    
    // Find the process with the highest priority (lower number = higher priority)
    const highestPriorityJob = readyProcesses.reduce(
      (min, p) => (p.priority < min.priority) ? p : min,
      readyProcesses[0]
    );
    
    // If the running process changes, add the previous one to the Gantt chart
    if (lastRunningPid !== null && lastRunningPid !== highestPriorityJob.pid) {
      gantt.push({
        pid: lastRunningPid,
        start: lastStartTime,
        end: currentTime
      });
      lastStartTime = currentTime;
    } else if (lastRunningPid === null) {
      lastStartTime = currentTime;
    }
    
    // Update the running process
    lastRunningPid = highestPriorityJob.pid;
    
    // Determine how long this process will run
    const timeSlice = 1; // Run for 1 time unit and then reevaluate
    
    // Check if any new process arrives during this time slice
    const nextArrival = remainingProcesses
      .filter(p => p.arrival_time > currentTime)
      .reduce((min, p) => p.arrival_time < min ? p.arrival_time : min, currentTime + timeSlice);
    
    const runTime = Math.min(timeSlice, nextArrival - currentTime, highestPriorityJob.remaining);
    
    // Update remaining time for the running process
    const runningProcessIndex = remainingProcesses.findIndex(p => p.pid === highestPriorityJob.pid);
    remainingProcesses[runningProcessIndex].remaining -= runTime;
    
    // Move time forward
    currentTime += runTime;
    
    // If the process is complete, remove it
    if (remainingProcesses[runningProcessIndex].remaining <= 0) {
      // Add the final segment to the Gantt chart
      gantt.push({
        pid: lastRunningPid,
        start: lastStartTime,
        end: currentTime
      });
      
      // Reset tracking variables
      lastRunningPid = null;
      
      // Remove the completed process
      remainingProcesses.splice(runningProcessIndex, 1);
    }
  }
  
  // Merge adjacent Gantt entries for the same process
  const mergedGantt = [];
  for (let i = 0; i < gantt.length; i++) {
    if (i === 0 || gantt[i].pid !== gantt[i-1].pid) {
      mergedGantt.push({ ...gantt[i] });
    } else {
      mergedGantt[mergedGantt.length - 1].end = gantt[i].end;
    }
  }
  
  return { algoName, gantt: mergedGantt, metrics: calculateMetrics(mergedGantt, processes) };
};

// Round Robin (RR) algorithm
const roundRobin = (processes, timeQuantum = 1) => {
  const remainingProcesses = [...processes].map(p => ({ ...p, remaining: p.burst_time }));
  
  let currentTime = 0;
  const algoName = "Round Robin";
  const gantt = [];
  const readyQueue = [];
  
  // Sort processes by arrival time
  remainingProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
  
  // Add the first process to the ready queue
  if (remainingProcesses.length > 0) {
    currentTime = remainingProcesses[0].arrival_time;
    
    // Add all processes that arrive at the same time
    while (remainingProcesses.length > 0 && remainingProcesses[0].arrival_time <= currentTime) {
      readyQueue.push(remainingProcesses.shift());
    }
  }
  
  while (readyQueue.length > 0 || remainingProcesses.length > 0) {
    if (readyQueue.length === 0) {
      // No processes in ready queue, move time forward to next arrival
      currentTime = remainingProcesses[0].arrival_time;
      
      // Add all processes that arrive at the same time
      while (remainingProcesses.length > 0 && remainingProcesses[0].arrival_time <= currentTime) {
        readyQueue.push(remainingProcesses.shift());
      }
      continue;
    }
    
    // Get the next process from the ready queue
    const currentProcess = readyQueue.shift();
    
    // Calculate how long this process will run
    const runTime = Math.min(timeQuantum, currentProcess.remaining);
    
    // Add to Gantt chart
    gantt.push({
      pid: currentProcess.pid,
      start: currentTime,
      end: currentTime + runTime
    });
    
    // Update remaining time and current time
    currentProcess.remaining -= runTime;
    currentTime += runTime;
    
    // Add any new arrivals to the ready queue
    while (remainingProcesses.length > 0 && remainingProcesses[0].arrival_time <= currentTime) {
      readyQueue.push(remainingProcesses.shift());
    }
    
    // If the process still has time remaining, add it back to the ready queue
    if (currentProcess.remaining > 0) {
      readyQueue.push(currentProcess);
    }
  }
  
  return { algoName, gantt, metrics: calculateMetrics(gantt, processes) };
};

// Run simulation
export const runSimulation = async (req, res) => {
  const { algorithm, processes, processSetId, timeQuantum } = req.body;
  const userId = req.user.id;

  try {
    let result;
    
    // Select algorithm
    switch (algorithm) {
      case 'FCFS':
        result = fcfs(processes);
        break;
      case 'SJF':
        result = sjfNonPreemptive(processes);
        break;
      case 'SRTF':
        result = srtf(processes);
        break;
      case 'Priority':
        result = priorityNonPreemptive(processes);
        break;
      case 'Priority (Preemptive)':
        result = priorityPreemptive(processes);
        break;
      case 'RR':
        result = roundRobin(processes, timeQuantum || 1);
        break;
      default:
        return res.status(400).json({ message: 'Algorithm not supported' });
    }

    // Store simulation results if processSetId is provided
    if (processSetId) {
      await pool.query(
        'INSERT INTO simulations (user_id, process_set_id, algorithm, gantt_data, metrics) VALUES ($1, $2, $3, $4, $5)',
        [userId, processSetId, algorithm, JSON.stringify(result.gantt), JSON.stringify(result.metrics)]
      );
    }
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get simulations for a user
export const getSimulations = async (req, res) => {
  try {
    const simulations = await pool.query(
      'SELECT s.*, ps.name as process_set_name FROM simulations s ' +
      'JOIN process_sets ps ON s.process_set_id = ps.process_set_id ' +
      'WHERE s.user_id = $1 ORDER BY s.simulation_id DESC',
      [req.user.id]
    );

    res.json(simulations.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific simulation
export const getSimulation = async (req, res) => {
  const { simulationId } = req.params;

  try {
    const simulation = await pool.query(
      'SELECT * FROM simulations WHERE simulation_id = $1 AND user_id = $2',
      [simulationId, req.user.id]
    );

    if (simulation.rows.length === 0) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    res.json(simulation.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};