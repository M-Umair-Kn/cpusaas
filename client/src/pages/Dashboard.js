import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../utils/AuthContext';
import { processApi, simulate } from '../utils/api';
import ProcessForm from '../components/ProcessForm';
import GanttChart from '../components/GanttChart';
import MetricsTable from '../components/MetricsTable';
import ThemeToggle from '../components/ThemeToggle';

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

  // Algorithms
  const algorithms = [
    'FCFS',
    'SJF',
    'SRTF',
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
    if (selectedAlgorithm === 'Priority') {
      const missingPriority = processes.some(p => p.priority === null || p.priority === undefined);
      if (missingPriority) {
        setError('All processes must have a priority value for Priority scheduling');
        return;
      }
    }

    // Check if time quantum is needed for Round Robin
    let timeQuantum = 1; // Default value
    if (selectedAlgorithm === 'RR') {
      const input = prompt('Enter time quantum for Round Robin:', '1');
      if (input === null) {
        // User canceled the prompt
        return;
      }
      
      timeQuantum = parseFloat(input);
      if (isNaN(timeQuantum) || timeQuantum <= 0) {
        setError('Time quantum must be a positive number');
        return;
      }
    }

    try {
      // Reset current time when starting a new simulation
      setCurrentTime(0);
      
      const response = await simulate.runSimulation(
        selectedAlgorithm,
        processes,
        selectedProcessSet ? selectedProcessSet.process_set_id : null,
        selectedAlgorithm === 'RR' ? { timeQuantum } : {}
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

  // Show priority input only for Priority scheduling
  const showPriority = selectedAlgorithm === 'Priority';

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
            showPriority={showPriority}
          />

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={runSimulation}
            >
              Run Simulation
            </button>
            <button 
              className="btn btn-success"
              onClick={() => {
                setProcessSetName(selectedProcessSet ? selectedProcessSet.name : '');
                setSaveModalOpen(true);
              }}
            >
              Save Process Set
            </button>
            <button 
              className="btn btn-danger"
              onClick={clearSimulation}
            >
              Clear All
            </button>
          </div>
        </div>

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
                      className="btn btn-sm btn-primary"
                      onClick={() => loadProcessSet(set.process_set_id)}
                    >
                      Load
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteProcessSet(set.process_set_id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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