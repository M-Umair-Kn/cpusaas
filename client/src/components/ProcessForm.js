import React, { useState } from 'react';

const ProcessForm = ({ processes, setProcesses, showPriority = false }) => {
  const [process, setProcess] = useState({
    pid: '',
    arrival_time: 0,
    burst_time: 1,
    priority: showPriority ? 1 : null
  });
  const [error, setError] = useState('');

  const { pid, arrival_time, burst_time, priority } = process;

  const onChange = (e) => {
    const value = e.target.type === 'number' 
      ? parseInt(e.target.value, 10) || 0
      : e.target.value;

    setProcess({ ...process, [e.target.name]: value });
    setError('');
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!pid) {
      setError('Process ID is required');
      return;
    }

    if (arrival_time < 0) {
      setError('Arrival time cannot be negative');
      return;
    }

    if (burst_time <= 0) {
      setError('Burst time must be greater than 0');
      return;
    }

    if (showPriority && (priority === null || priority < 0)) {
      setError('Priority must be a non-negative number');
      return;
    }

    // Check if process ID already exists
    if (processes.some(p => p.pid === pid)) {
      setError('Process ID already exists');
      return;
    }

    // Add process to list
    setProcesses([...processes, process]);

    // Reset form
    setProcess({
      pid: '',
      arrival_time: 0,
      burst_time: 1,
      priority: showPriority ? 1 : null
    });
  };

  const removeProcess = (pidToRemove) => {
    setProcesses(processes.filter(p => p.pid !== pidToRemove));
  };

  return (
    <div className="process-form">
      <h3>Add Process</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pid">Process ID</label>
            <input
              type="text"
              id="pid"
              name="pid"
              value={pid}
              onChange={onChange}
              placeholder="e.g., P1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="arrival_time">Arrival Time</label>
            <input
              type="number"
              id="arrival_time"
              name="arrival_time"
              value={arrival_time}
              onChange={onChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="burst_time">Burst Time</label>
            <input
              type="number"
              id="burst_time"
              name="burst_time"
              value={burst_time}
              onChange={onChange}
              min="1"
            />
          </div>

          {showPriority && (
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={priority}
                onChange={onChange}
                min="0"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </div>
      </form>

      <div className="process-list">
        <h3>Processes</h3>
        {processes.length === 0 ? (
          <p>No processes added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Process ID</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                {showPriority && <th>Priority</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.pid}>
                  <td>{p.pid}</td>
                  <td>{p.arrival_time}</td>
                  <td>{p.burst_time}</td>
                  {showPriority && <td>{p.priority}</td>}
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => removeProcess(p.pid)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProcessForm; 