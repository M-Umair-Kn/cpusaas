import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../utils/AuthContext';
import { processApi, simulate } from '../utils/api';
import ProcessForm from '../components/ProcessForm';
import GanttChart from '../components/GanttChart';
import MetricsTable from '../components/MetricsTable';
import ThemeToggle from '../components/ThemeToggle';
import AlgorithmComparison from '../components/comparison/AlgorithmComparison';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [processes, setProcesses] = useState([]);
  const [processSets, setProcessSets] = useState([]);
  const [selectedProcessSet, setSelectedProcessSet] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FCFS');
  const [simulationResult, setSimulationResult] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [processSetName, setProcessSetName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [timeQuantum, setTimeQuantum] = useState(1);

  // Algorithms
  const algorithms = [
    'FCFS',
    'SJF',
    'SRTF',
    'Priority',
    'Priority (Preemptive)',
    'RR'
  ];

  // Load process sets on component mount
  useEffect(() => {
    if (user) {
      loadProcessSets();
    }
  }, [user]);

  // Load process sets from API
  const loadProcessSets = async () => {
    try {
      const response = await processApi.getProcessSets();
      setProcessSets(response.data);
    } catch (err) {
      setError('Failed to load process sets');
      console.error(err);
    }
  };

  // Load a process set
  const loadProcessSet = async (processSetId) => {
    try {
      const response = await processApi.getProcessSet(processSetId);
      setSelectedProcessSet(response.data.processSet);
      setProcesses(response.data.processes);
      setMessage(`Loaded process set: ${response.data.processSet.name}`);
    } catch (err) {
      setError('Failed to load process set');
      console.error(err);
    }
  };

  // Save current processes as a process set
  const saveProcessSet = async () => {
    if (processes.length === 0) {
      setError('No processes to save');
      return;
    }

    if (!processSetName.trim()) {
      setError('Please enter a name for the process set');
      return;
    }

    try {
      if (selectedProcessSet) {
        // Update existing process set
        await processApi.updateProcessSet(
          selectedProcessSet.process_set_id,
          processSetName,
          processes
        );
        setMessage(`Process set updated: ${processSetName}`);
      } else {
        // Create new process set
        await processApi.createProcessSet(processSetName, processes);
        setMessage(`Process set saved: ${processSetName}`);
      }

      setSaveModalOpen(false);
      setProcessSetName('');
      loadProcessSets();
    } catch (err) {
      setError('Failed to save process set');
      console.error(err);
    }
  };

  // Delete a process set
  const deleteProcessSet = async (processSetId) => {
    if (window.confirm('Are you sure you want to delete this process set?')) {
      try {
        await processApi.deleteProcessSet(processSetId);
        setMessage('Process set deleted');

        if (selectedProcessSet && selectedProcessSet.process_set_id === processSetId) {
          setSelectedProcessSet(null);
          setProcesses([]);
        }

        loadProcessSets();
      } catch (err) {
        setError('Failed to delete process set');
        console.error(err);
      }
    }
  };

  // Run simulation
  const runSimulation = async () => {
    if (processes.length === 0) {
      setError('Please add at least one process first');
      return;
    }

    // Check if priority is required
    if (selectedAlgorithm.includes('Priority')) {
      const missingPriority = processes.some(p => p.priority === null || p.priority === undefined);
      if (missingPriority) {
        setError('All processes must have a priority value for Priority scheduling');
        return;
      }
    }

    // Check if time quantum is needed for Round Robin
    if (selectedAlgorithm === 'RR') {
      const input = prompt('Enter time quantum for Round Robin:', timeQuantum.toString());
      if (input === null) {
        // User canceled the prompt
        return;
      }

      const newTimeQuantum = parseFloat(input);
      if (isNaN(newTimeQuantum) || newTimeQuantum <= 0) {
        setError('Time quantum must be a positive number');
        return;
      }
      setTimeQuantum(newTimeQuantum);
    }

    try {
      // Reset current time when starting a new simulation
      setCurrentTime(0);

      const response = await simulate.runSimulation(
        selectedAlgorithm,
        processes,
        selectedProcessSet ? selectedProcessSet.process_set_id : null,
        selectedAlgorithm === 'RR' ? timeQuantum : undefined
      );
      setSimulationResult(response.data);
      setMessage('Simulation completed successfully');
    } catch (err) {
      setError('Failed to run simulation');
      console.error(err);
    }
  };

  // Clear the current simulation
  const clearSimulation = () => {
    setProcesses([]);
    setSelectedProcessSet(null);
    setSimulationResult(null);
    setMessage('Cleared all processes and simulation results');
  };

  // Export simulation results
  const exportResults = () => {
    if (!simulationResult) {
      setError('No simulation results to export');
      return;
    }

    try {
      // Create CSV content for process details
      let csvContent = 'Process ID,Waiting Time,Turnaround Time,Response Time\n';

      const metrics = simulationResult.metrics;
      const processPids = Object.keys(metrics.processMetrics);

      processPids.forEach(pid => {
        const process = metrics.processMetrics[pid];
        csvContent += `${pid},${process.waitingTime.toFixed(2)},${process.turnaroundTime.toFixed(2)},${process.responseTime.toFixed(2)}\n`;
      });

      // Add overall metrics
      csvContent += '\nOverall Metrics\n';
      csvContent += `Average Waiting Time,${metrics.averageWaitingTime.toFixed(2)}\n`;
      csvContent += `Average Turnaround Time,${metrics.averageTurnaroundTime.toFixed(2)}\n`;
      csvContent += `Average Response Time,${metrics.averageResponseTime.toFixed(2)}\n`;
      csvContent += `CPU Utilization,${metrics.cpuUtilization.toFixed(2)}%\n`;
      csvContent += `Throughput,${metrics.throughput.toFixed(4)} proc/unit\n`;

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedAlgorithm}_simulation_results.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage('Results exported successfully');
    } catch (err) {
      setError('Failed to export results');
      console.error(err);
    }
  };

  // Show priority input only for Priority scheduling
  const showPriority = selectedAlgorithm.includes('Priority');

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CPU Scheduling Simulator</h1>
        <div className="user-controls">
          <ThemeToggle />
          <p>Welcome, {user?.email}</p>
          <button
            className="btn btn-secondary logout-btn"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className={`alert ${error ? 'alert-danger' : 'alert-success'}`}>
          {error || message}
          <button
            className="close-btn"
            onClick={() => { setError(''); setMessage(''); }}
          >
            &times;
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="process-panel">
          <div className="algorithm-selector">
            <h3>Select Algorithm</h3>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            >
              {algorithms.map(algorithm => (
                <option key={algorithm} value={algorithm}>
                  {algorithm}
                </option>
              ))}
            </select>
          </div>

          <ProcessForm
            processes={processes}
            setProcesses={setProcesses}
            showPriority={true} // Always show priority for easier algorithm comparison
          />

          <div className="action-buttons">
            <button
              title='Run Simulation'
              className="btn btn-primary"
              onClick={runSimulation}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 100 100">
                <title>Run Simulation</title>
                <circle cx="50" cy="50" r="48" stroke="black" stroke-width="2" fill="#cce4f7" />
                <polygon points="40,30 40,70 70,50" fill="#0078d7" />
              </svg>

            </button>
            <button
              title='Save Process Set Data'
              className="btn btn-success"
              onClick={() => {
                setProcessSetName(selectedProcessSet ? selectedProcessSet.name : '');
                setSaveModalOpen(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <title>Save Process Set Data</title>
                <path fill="currentColor" d="M3 2h14l5 5v14a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h18V8.828L16.172 4H3zm9 11a3 3 0 100-6 3 3 0 000 6zm0-2a1 1 0 110-2 1 1 0 010 2z" />
              </svg>

            </button>
            <button
              title='Clear All Processes'
              className="btn btn-danger"
              onClick={clearSimulation}
            >
              <svg id="clear-all" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                <title>Clear All Processes</title>
                <path fill="currentColor" d="M18.36 5.64l-1.41-1.41L12 9.17 7.05 4.22 5.64 5.64 10.59 10.6 5.64 15.54l1.41 1.41 4.95-4.95 4.95 4.95 1.41-1.41-4.95-4.95 4.95-4.96z" />
              </svg>

            </button>
            <button
              className="btn btn-info"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide Comparison' : 'Compare Algorithms'}
            </button>
            {simulationResult && (
              <button
                className="btn btn-secondary"
                onClick={exportResults}
              >
                Export Results
              </button>
            )}
          </div>

          <div className="saved-sets-panel">
            <h3>Saved Process Sets</h3>
            {processSets.length === 0 ? (
              <p>No saved process sets</p>
            ) : (
              <ul className="process-sets-list">
                {processSets.map(set => (
                  <li key={set.process_set_id}>
                    <span>{set.name}</span>
                    <div className="process-set-actions">
                      <button
                        title='Load Process Set Data'
                        className="btn btn-sm btn-primary"
                        onClick={() => loadProcessSet(set.process_set_id)}
                      >
                        <svg id="load-data" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 120.09 122.88">
                          <title>Load Process Set Data</title>
                          <path d="M16.83,25.39C24.55,28,35.28,29.55,47.2,29.55S69.86,28,77.57,25.39c6.77-2.26,11-5,11-7.68s-4.19-5.41-11-7.67C69.86,7.47,59.13,5.88,47.2,5.88S24.55,7.47,16.83,10c-14.36,4.8-14.75,10.42,0,15.35Zm70.1,31.17a33.09,33.09,0,0,1,23.44,9.71v0a33.12,33.12,0,0,1,0,46.86l0,0a33.12,33.12,0,0,1-46.86,0l0,0a33.12,33.12,0,0,1,0-46.86l0,0a33.06,33.06,0,0,1,23.43-9.71Zm1.88,17.52L86,88.12l-2.8-4.22c-6,2.42-9.42,6.42-9.92,12.56-5-8.66-1.95-16.43,4.33-21l-2.86-4.3,14,2.9Zm-4.49,32.13,2.76-14,2.81,4.22c6-2.42,9.42-6.42,9.92-12.56,5,8.66,2,16.43-4.33,21l2.86,4.3-14-2.9ZM106.7,70a28,28,0,1,0,8.19,19.77A27.84,27.84,0,0,0,106.7,70ZM43.92,91C32.69,90.77,22.55,89.12,15,86.6a37.06,37.06,0,0,1-9-4.26v19.18c.53,2.49,4.59,5,10.89,7.11,7.72,2.58,18.45,4.17,30.37,4.17,1.15,0,2.29,0,3.42,0a43.68,43.68,0,0,0,4.32,5.69q-3.78.22-7.74.22c-12.52,0-23.92-1.71-32.23-4.48-4.38-1.47-14.91-6.27-14.91-12V100.3C.06,74.09,0,43.92,0,17.71,0,12.23,5.72,7.58,15,4.49,23.28,1.71,34.68,0,47.2,0S71.12,1.71,79.43,4.49s13.92,6.92,14.84,11.77a2.93,2.93,0,0,1,.17,1V47.35a42.18,42.18,0,0,0-6.08-.64,2.77,2.77,0,0,0,.17-.93h0V26.62a37,37,0,0,1-9.13,4.32c-8.31,2.77-19.71,4.49-32.23,4.49S23.28,33.71,15,30.94a37.44,37.44,0,0,1-9-4.25V46.34c.53,2.49,4.59,5,10.89,7.11C24.55,56,35.28,57.62,47.2,57.62c4.08,0,8-.19,11.74-.54-.62.53-1.22,1.08-1.8,1.64-.22.18-.42.37-.62.56l0,0,0,0,0,0a43.9,43.9,0,0,0-3.55,4c-1.89.08-3.8.12-5.75.12C34.68,63.49,23.28,61.78,15,59a37.06,37.06,0,0,1-9-4.25V73.93c.53,2.49,4.59,5,10.89,7.11,7.05,2.35,16.61,3.88,27.31,4.13a42.92,42.92,0,0,0-.24,4.55c0,.44,0,.88,0,1.32Z" /></svg>
                      </button>
                      <button
                        title='Delete Process Set Data'
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteProcessSet(set.process_set_id)}
                      >
                        <svg id="delete-data" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                          <title>Delete Process Set from database</title>
                          <path fill="currentColor" d="M3 6h18v2H3V6zm2 4h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2V10zm5-8h4v2h5v2H3V4h5V2z" />
                        </svg>

                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {showComparison ? (
          <div className="comparison-panel">
            <AlgorithmComparison processes={processes} />
          </div>
        ) : (
          <div className="results-panel">
            {simulationResult ? (
              <>
                <GanttChart
                  gantt={simulationResult.gantt}
                  onTimeChange={setCurrentTime}
                />
                <MetricsTable metrics={simulationResult.metrics} />
              </>
            ) : (
              <div className="no-results">
                <p>No simulation results to display.</p>
                <p>Add processes and run a simulation to see results.</p>
              </div>
            )}
          </div>
        )}


      </div>

      {saveModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedProcessSet ? 'Update Process Set' : 'Save Process Set'}</h3>
            <input
              type="text"
              placeholder="Enter process set name"
              value={processSetName}
              onChange={(e) => setProcessSetName(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={saveProcessSet}
              >
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSaveModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;