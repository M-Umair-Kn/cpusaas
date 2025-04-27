import React, { useState, useEffect } from 'react';

const ProcessForm = ({ processes, setProcesses, showPriority = false }) => {
  // Define fields configuration for reuse
  const processFields = [
    { name: 'pid', label: 'Process ID', type: 'text', min: null, placeholder: 'e.g., P1' },
    { name: 'arrival_time', label: 'Arrival Time', type: 'number', min: 0 },
    { name: 'burst_time', label: 'Burst Time', type: 'number', min: 1 },
    ...(showPriority ? [{ name: 'priority', label: 'Priority', type: 'number', min: 0 }] : [])
  ];

  const initialProcessState = {
    pid: '',
    arrival_time: 0,
    burst_time: 1,
    priority: showPriority ? 1 : null
  };

  const [newProcess, setNewProcess] = useState({ ...initialProcessState });
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [processesInEdit, setProcessesInEdit] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'pid', direction: 'ascending' });
  const [sortedProcesses, setSortedProcesses] = useState([...processes]);

  // Update sorted processes when processes change or sort config changes
  useEffect(() => {
    let sortableProcesses = [...processes];
    if (sortConfig.key) {
      sortableProcesses.sort((a, b) => {
        // Special handling for Process ID (pid) field
        if (sortConfig.key === 'pid') {
          // Extract numeric portions of process IDs for proper numeric sorting
          const getNumericPart = (pid) => {
            const matches = pid.match(/\d+/);
            return matches ? parseInt(matches[0], 10) : 0;
          };
          
          const aNum = getNumericPart(a.pid);
          const bNum = getNumericPart(b.pid);
          
          if (aNum !== bNum) {
            return sortConfig.direction === 'ascending' 
              ? aNum - bNum 
              : bNum - aNum;
          } else {
            // If numeric parts are equal, sort alphabetically
            return sortConfig.direction === 'ascending' 
              ? a.pid.localeCompare(b.pid) 
              : b.pid.localeCompare(a.pid);
          }
        } else {
          // Standard sorting for other fields
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    setSortedProcesses(sortableProcesses);
  }, [processes, sortConfig]);

  // Initialize editable processes when entering edit mode
  useEffect(() => {
    if (editMode) {
      // Create a deep copy of sorted processes for editing to maintain sort order
      setProcessesInEdit(sortedProcesses.map(p => ({ ...p })));
    }
  }, [editMode, sortedProcesses]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIcon = (name) => {
    if (sortConfig.key !== name) {
      return '↕️';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const handleNewProcessChange = (e) => {
    const value = e.target.type === 'number' 
      ? parseInt(e.target.value, 10) || 0
      : e.target.value;

    setNewProcess({ ...newProcess, [e.target.name]: value });
    setError('');
  };

  const handleEditChange = (e, index) => {
    const value = e.target.type === 'number' 
      ? parseInt(e.target.value, 10) || 0
      : e.target.value;

    const updatedProcesses = [...processesInEdit];
    updatedProcesses[index] = { 
      ...updatedProcesses[index], 
      [e.target.name]: value 
    };
    setProcessesInEdit(updatedProcesses);
  };

  // Consolidated validation function
  const validateProcess = (data) => {
    if (!data.pid) {
      setError('Process ID is required');
      return false;
    }

    if (data.arrival_time < 0) {
      setError('Arrival time cannot be negative');
      return false;
    }

    if (data.burst_time <= 0) {
      setError('Burst time must be greater than 0');
      return false;
    }

    if (showPriority && (data.priority === null || data.priority < 0)) {
      setError('Priority must be a non-negative number');
      return false;
    }

    return true;
  };

  const handleAddProcess = () => {
    if (!validateProcess(newProcess)) return;

    // Check if process ID already exists
    if (processes.some(p => p.pid === newProcess.pid)) {
      setError('Process ID already exists');
      return;
    }

    // Add process to list
    setProcesses([...processes, newProcess]);

    // Reset form
    setNewProcess({ ...initialProcessState });
  };

  const removeProcess = (index) => {
    const updatedProcesses = [...processesInEdit];
    updatedProcesses.splice(index, 1);
    setProcessesInEdit(updatedProcesses);
  };

  const toggleEditMode = () => {
    if (editMode) {
      // We are saving changes
      // Validate all processes
      let hasError = false;
      
      // Only validate if there are processes to validate
      if (processesInEdit.length > 0) {
        for (const process of processesInEdit) {
          if (!validateProcess(process)) {
            hasError = true;
            break;
          }
        }

        // Check for duplicate PIDs
        const pidSet = new Set();
        for (const process of processesInEdit) {
          if (pidSet.has(process.pid)) {
            setError('Duplicate Process IDs are not allowed');
            hasError = true;
            break;
          }
          pidSet.add(process.pid);
        }
      }

      if (!hasError) {
        // Save all changes
        setProcesses([...processesInEdit]);
        setEditMode(false);
        setError('');
      }
    } else {
      // We are entering edit mode
      setEditMode(true);
    }
  };

  // Render an input field based on field configuration
  const renderInputField = (field, value, changeHandler) => (
    <input
      type={field.type}
      id={field.name}
      name={field.name}
      value={value}
      onChange={changeHandler}
      min={field.min}
      placeholder={field.placeholder || ''}
      className="edit-input"
    />
  );

  return (
    <div className="process-form">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="process-list">
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Processes</h3>
          <button 
            title={editMode ? 'Save Changes' : (processes.length === 0 ? 'Add Process' : 'Edit All Processes')}
            className={`btn ${editMode ? 'btn-success' : (processes.length === 0 ? 'btn-primary' : 'btn-warning')} btn-sm`}
            onClick={toggleEditMode}
          >
            {editMode ? 'Save' : (processes.length === 0 ? 'Add' : 'Edit')}
          </button>
        </div>
        <table className="process-table">
          <thead>
            <tr>
              {processFields.map(field => (
                <th 
                  key={field.name}
                  onClick={() => requestSort(field.name)}
                  className="sortable-header"
                >
                  {field.label}
                  <span className="sort-icon">{getSortDirectionIcon(field.name)}</span>
                </th>
              ))}
              {editMode && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {/* Show Add process row only in edit mode */}
            {editMode && (
              <tr>
                {processFields.map(field => (
                  <td key={field.name}>
                    {renderInputField(field, newProcess[field.name], handleNewProcessChange)}
                  </td>
                ))}
                <td>
                  <div className="button-container">
                    <button 
                      title='Add Process'
                      className="btn btn-primary btn-sm"
                      onClick={handleAddProcess}
                    >
                      Add
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            {/* Existing processes */}
            {editMode ? (
              // Show editable processes in edit mode
              processesInEdit.map((p, index) => (
                <tr key={index}>
                  {processFields.map(field => (
                    <td key={field.name}>
                      {renderInputField(
                        field, 
                        p[field.name], 
                        (e) => handleEditChange(e, index)
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="button-container">
                      <button 
                        title='Remove Process'
                        className="btn btn-danger btn-sm"
                        onClick={() => removeProcess(index)}
                      >
                        <svg id="delete-data" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                          <title>Remove Process</title>
                          <path fill="currentColor" d="M3 6h18v2H3V6zm2 4h14v12a2 2 0 01-2 2H7a2 2 0 01-2-2V10zm5-8h4v2h5v2H3V4h5V2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Show non-editable processes in normal mode
              sortedProcesses.map(p => (
                <tr key={p.pid}>
                  {processFields.map(field => (
                    <td key={field.name}>
                      {p[field.name]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Show message when there are no processes and not in edit mode */}
        {processes.length === 0 && !editMode && (
          <div className="no-processes-message" style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            No processes added yet. Click the "Add" button to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessForm;