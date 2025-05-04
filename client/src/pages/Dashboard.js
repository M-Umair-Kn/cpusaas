import React, { useState, useEffect, useContext, use } from 'react';
import { AuthContext } from '../utils/AuthContext';
import { processApi, simulate } from '../utils/api';
import ProcessForm from '../components/ProcessForm';
import GanttChart from '../components/GanttChart';
import ThemeToggle from '../components/ThemeToggle';
import AlgorithmComparison from '../components/comparison/AlgorithmComparison';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [processes, setProcesses] = useState([]);
  const [processSets, setProcessSets] = useState([]);
  const [selectedProcessSet, setSelectedProcessSet] = useState(null);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['FCFS']); // Changed to array for multiple selection
  const [simulationResults, setSimulationResults] = useState([]); // Changed to array for multiple results
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [processSetName, setProcessSetName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [timeQuantum, setTimeQuantum] = useState(90);
  const [editingTimeQuantum, setEditingTimeQuantum] = useState(false);
  const [isAlgorithmDropdownOpen, setIsAlgorithmDropdownOpen] = useState(false); // For dropdown toggle
  const MESSAGE_DURATION = 2200; // 2.2 seconds

  // Add this useEffect to auto-dismiss messages
  useEffect(() => {
    let timeoutId;

    if (message || error) {
      timeoutId = setTimeout(() => {
        setMessage('');
        setError('');
      }, MESSAGE_DURATION);
    }

    // Clean up the timeout when component unmounts or when message/error changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [message, error]);

  // run simulation when user changes selectedAlgorithm during simulation
  useEffect(() => {
    if (selectedAlgorithms.length && simulationResults.length) {
      runSimulation().then(() => {
        setMessage(`Algorithms changed to ${selectedAlgorithms.join(', ')}. New simulation results ready.`);
      });
    }
  }, [selectedAlgorithms]);

  useEffect(() => {
    if (simulationResults.length && selectedAlgorithms.includes('RR')) {
      runSimulation().then(() => {
        setMessage(`Time Quantum is set to ${timeQuantum}. New simulation results ready.`);
      });
    }
  }, [timeQuantum]);

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
    if (selectedAlgorithms.some(algo => algo.includes('Priority'))) {
      const missingPriority = processes.some(p => p.priority === null || p.priority === undefined);
      if (missingPriority) {
        setError('All processes must have a priority value for Priority scheduling');
        return;
      }
    }

    try {
      const results = await Promise.all(
        selectedAlgorithms.map(async (algorithm) => {
          const response = await simulate.runSimulation(
            algorithm,
            processes,
            selectedProcessSet ? selectedProcessSet.process_set_id : null,
            algorithm === 'RR' ? timeQuantum : null
          );
          return response.data;
        })
      );
      setSimulationResults(results);
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
    setSimulationResults([]);
    setMessage('Cleared all processes and simulation results');
  };

  // Export simulation results
  const exportResults = () => {
    if (!simulationResults.length) {
      setError('No simulation results to export');
      return;
    }

    try {
      simulationResults.forEach((simulationResult) => {
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
        link.setAttribute('download', `${simulationResult.algoName}_simulation_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      setMessage('Results exported successfully');
    } catch (err) {
      setError('Failed to export results');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CPU Scheduling Algorithms Simulator</h1>
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

      <div className="dashboard-grid">
        <div className="process-panel">
          <div className="saved-sets-panel">
            <h3>Saved Process Sets</h3>
            {user?.isGuest ? (
              <div className="guest-message">
                <p>Guest users cannot save or load process sets.</p>
                <p>Please register or login to use these features.</p>
              </div>
            ) : processSets.length === 0 ? (
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

          <ProcessForm
            processes={processes}
            setProcesses={setProcesses}
            showPriority={true} // Always show priority for easier algorithm comparison
            isGuest={user?.isGuest}
          />

          <div className="action-buttons">
            <button
              title='Run Simulation'
              className="btn btn-success"
              onClick={runSimulation}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 100 100">
                <title>Run Simulation</title>
                <circle cx="50" cy="50" r="48" stroke="black" strokeWidth="2" fill="#cce4f7" />
                <polygon points="40,30 40,70 70,50" fill="#0078d7" />
              </svg>

            </button>
            {!user?.isGuest && (
              <button
                title='Save Process Set Data'
                className="btn btn-primary"
                onClick={() => {
                  setProcessSetName(selectedProcessSet ? selectedProcessSet.name : '');
                  setSaveModalOpen(true);
                }}
              >
                <svg
                  version="1.1"
                  viewBox="0 0 122.73 122.88"
                  enableBackground="new 0 0 122.73 122.88"
                  xmlSpace="preserve"
                  width="1.5rem" height="1.5rem"
                >
                  <title>Save Process Set Data</title>
                  <path
                    fill="currentColor"  // Inherits color from parent
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M109.5 113.68l-6.09 0c-.4 0-.73-.32-.73-.72V69.48l0-.1c0-.9-.17-1.65-.49-2.22-.06-.11-.14-.22-.2-.31-.06-.09-.16-.18-.23-.27l-.02-.02c-.3-.3-.68-.53-1.12-.69l-.25-.07-.04-.01-.01 0c-.41-.11-.88-.17-1.38-.17h-.05l-.08 0H36.75c-.89 0-1.62.17-2.18.49l-.02.01-.27.17-.04.04c-.09.07-.18.15-.27.23l-.02.02-.01.01c-.62.63-.92 1.57-.92 2.82l0 .04 0 43.54h0c0 .4-.33.72-.73.72l-9.85 0c-.19 0-.38-.08-.51-.21L9.87 101.41c-.18-.14-.29-.36-.29-.59l0-87.91 0-.08c0-.83.15-1.52.44-2.07 0 0 .05-.11.11-.2l.02-.03c.07-.11.19-.18.25-.29l.01-.02.02-.02c.25-.25.57-.45.92-.59l.04-.02.02-.01.02-.01.18-.06v0l.01-.01c.42-.14.9-.2 1.44-.21l.09-.01 26.21 0c.4 0 .73.32.73.72v28.75c0 .52.05 1.03.13 1.5.09.46.15.98.39 1.34l.01.02v0c.18.44.42.87.67 1.25.24.37.56.77.9 1.13l.02.02.01.01c.48.5.94 1.15 1.62 1.27l.01 0 .01 0 .01.01.32.17.4.18v0l.01 0 c.33.14.67.26 1 .34l.01 0 .03 0 .01 0 .03 0 .26.05v0c.45.09.93.14 1.42.14l.02 0h47.8c1.03 0 1.98-.18 2.85-.53l.01-.01c.87-.36 1.67-.9 2.39-1.61l.03-.03c.36-.36.69-.75.96-1.16.26-.38.58-.76.66-1.22l0-.01.01-.01.01-.02c.18-.43.34-.88.41-1.34l0-.03c.09-.47.13-.97.13-1.49V9.92c0-.4.33-.73.73-.73h6c.58 0 1.09.07 1.54.21.48.15.89.39 1.2.7.68.67.88 1.67.9 2.59l.01.09v.05l0 .02v97.19c0 .56-.07 1.07-.21 1.51l-.01.03v0l0 .02-.08.22 0 0-.02.06-.09.2-.01.04-.02.04 0 0-.03.06-.15.22 0 0-.05.08-.14.17-.06.07c-.15.16-.33.3-.53.42-.17.1-.36.19-.55.26l-.06.02c-.16.05-.34.1-.53.14l-.02 0-.01 0-.02 0-.09.01-.02 0 0 0-.02 0c-.22.03-.49.05-.76.06H109.5zM53.93 104.43c-1.66 0-3-1.34-3-3 0-1.66 1.34-3 3-3h31.12c1.66 0 3 1.34 3 3 0 1.66-1.34 3-3 3H53.93zM53.93 89.03c-1.66 0-3-1.34-3-3s1.34-3 3-3h31.12c1.66 0 3 1.34 3 3s-1.34 3-3 3H53.93zM94.03 9.39l-45.32-.2v25.86H48.7c0 .46.06.86.17 1.2.03.06.04.1.07.15.09.23.22.44.4.61l.03.03v0c.06.06.11.1.17.15.06.05.13.09.2.14.39.23.92.34 1.58.34v0l40.1.25v0c.91 0 1.57-.21 1.98-.63.42-.43.63-1.1.63-2.02h0V9.39zM41.91 73.23h53.07v0c.35 0 .65.29.65.64l0 39.17c0 .35-.29.65-.65.65H41.91v0c-.35 0-.65-.29-.65-.64l0-39.17c0-.35.3-.64.65-.64zM9.68 0h104.26c4.91 0 8.79 3.86 8.79 8.79V114c0 4.95-3.9 8.88-8.79 8.88l-96.61 0-.24-.25L1.05 106.6 0 105.9V8.76C0 3.28 4.81 0 9.68 0z"
                  />
                </svg>
              </button>
            )}
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
            {simulationResults.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={exportResults}
              >
                Export Results
              </button>
            )}

            <div className="algorithm-selector">
              <div className="algorithm-selector-group">
                <h3>Select Algorithms</h3>
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    onClick={() => setIsAlgorithmDropdownOpen(!isAlgorithmDropdownOpen)}
                  >
                    {selectedAlgorithms.length > 0 ? 
                      `Selected Algorithms (${selectedAlgorithms.length})` : 
                      'Select Algorithms'}
                  </button>
                  {isAlgorithmDropdownOpen && (
                    <div className="dropdown-menu">
                      {algorithms.map(algorithm => (
                        <div key={algorithm} className="dropdown-item">
                          <input
                            type="checkbox"
                            id={`algo-${algorithm}`}
                            checked={selectedAlgorithms.includes(algorithm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
                              } else {
                                // Don't allow removing the last algorithm
                                if (selectedAlgorithms.length > 1) {
                                  setSelectedAlgorithms(selectedAlgorithms.filter(algo => algo !== algorithm));
                                }
                              }
                            }}
                          />
                          <label htmlFor={`algo-${algorithm}`}>{algorithm}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="time-quantum-selector">
                <h3>Time Quantum</h3>
                <div className="time-quantum-input">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={timeQuantum}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 1) {
                        setTimeQuantum(value);
                      } else {
                        setTimeQuantum(1);
                        setError("Time quantum must be at least 1");
                      }
                    }}
                    disabled={!editingTimeQuantum}
                  />
                  <button
                    className={`btn btn-sm ${editingTimeQuantum ? 'btn-primary' : 'btn-warning'}`}
                    onClick={() => {
                      if (editingTimeQuantum) {
                        setMessage(`Time quantum set to ${timeQuantum}`);
                      }
                      setEditingTimeQuantum(!editingTimeQuantum);
                    }}
                  >
                    {editingTimeQuantum ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        <div className="message-error">
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
        </div>

        {showComparison ? (
          <div className="comparison-panel">
            <AlgorithmComparison
              processes={processes}
              timeQuantum={timeQuantum}
            />
          </div>
        ) : (
          <div className="results-panel">
            {simulationResults.length > 0 ? (
              simulationResults.map((simulationResult, index) => (
                <GanttChart
                  key={index}
                  algoName={simulationResult.algoName}
                  gantt={simulationResult.gantt}
                  metrics={simulationResult.metrics}
                />
              ))
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