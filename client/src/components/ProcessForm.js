import React, { useState, useEffect } from 'react';

const ProcessForm = ({ processes, setProcesses, showPriority = false, isGuest = false }) => {
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
  const [editMode, setEditMode] = useState(isGuest);
  const [processesInEdit, setProcessesInEdit] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'pid', direction: 'ascending' });
  const [sortedProcesses, setSortedProcesses] = useState([...processes]);

  // Automatically set edit mode for guest users
  useEffect(() => {
    if (isGuest) {
      setEditMode(true);
    }
  }, [isGuest]);

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

  // Initialize editable processes when entering edit mode or when processes change
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

  // Validation function for new processes
  const validateNewProcess = (data) => {
    if (!data.pid) {
      setError('Process ID is required');
      return false;
    }
    
    // Add duplicate check here
    if (processes.some(p => p.pid === data.pid)) {
      setError('Process ID already exists');
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

  // Validation function for process edits
  const validateProcessEdits = (editedProcesses) => {
    if (editedProcesses.length === 0) {
      return true; // No processes to validate
    }

    const pidSet = new Set();
    
    for (const process of editedProcesses) {
      if (!process.pid) {
        setError('Process ID is required for all processes');
        return false;
      }
      
      if (process.arrival_time < 0) {
        setError('Arrival time cannot be negative');
        return false;
      }

      if (process.burst_time <= 0) {
        setError('Burst time must be greater than 0');
        return false;
      }

      if (showPriority && (process.priority === null || process.priority < 0)) {
        setError('Priority must be a non-negative number');
        return false;
      }

      // Check for duplicate PIDs within the edited processes
      if (pidSet.has(process.pid)) {
        setError('Duplicate Process IDs are not allowed');
        return false;
      }
      pidSet.add(process.pid);
    }
    
    return true;
  };

  const handleAddProcess = () => {
    if (!validateNewProcess(newProcess)) return;

    // Add process to list
    const updatedProcesses = [...processes, newProcess];
    setProcesses(updatedProcesses);

    // Reset form
    setNewProcess({ ...initialProcessState });
  };

  const removeProcess = (index) => {
    const updatedProcesses = [...processesInEdit];
    updatedProcesses.splice(index, 1);
    setProcessesInEdit(updatedProcesses);
    
    // For guest users, apply the changes immediately so they're reflected in the simulation
    if (isGuest) {
      setProcesses(updatedProcesses);
    }
  };

  const saveChanges = () => {
    // Validate all processes
    if (!validateProcessEdits(processesInEdit)) {
      return; // Validation failed
    }
    
    // Save all changes by updating the parent component's state
    setProcesses([...processesInEdit]);
    setError('');
    
    // Always keep edit mode on for guest users
    if (!isGuest) {
      setEditMode(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      // We are saving changes
      saveChanges();
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
          <h3>
            Processes
            {isGuest && <span className="guest-badge" style={{ marginLeft: '10px', fontSize: '0.8em', color: '#666', fontWeight: 'normal' }}>(Guest Mode)</span>}
          </h3>
          {!isGuest && (
            <button 
              title={editMode ? 'Save Changes' : (processes.length === 0 ? 'Add Process' : 'Edit All Processes')}
              className={`btn ${editMode ? 'btn-success' : (processes.length === 0 ? 'btn-primary' : 'btn-warning')} btn-sm`}
              onClick={toggleEditMode}
            >
              {editMode ? 'Save' : (processes.length === 0 ? 'Add' : 'Edit')}
            </button>
          )}
          
          {isGuest && (
            <button 
              title='Save Changes'
              className="btn btn-success btn-sm"
              onClick={saveChanges}
            >
              Update
            </button>
          )}
        </div>
        
        {/* Always show the form for guest users even when no processes exist */}
        {(processes.length !== 0 || editMode || isGuest) && (
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
            {/* Show Add process row when in edit mode */}
            {editMode && (
              <tr className="new-process-row">
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
                <tr key={index} className="edit-process-row">
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
        )}
        
        {/* Message when no processes and not in edit mode (but hidden for guest users) */}
        {processes.length === 0 && !editMode && !isGuest && (
          <div className="no-processes-message" style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            No processes added yet. Click the "Add" button to get started.
          </div>
        )}
        
        {/* Special guidance for guest users */}
        {isGuest && processes.length === 0 && (
          <div className="guest-guidance" style={{ textAlign: 'center', marginTop: '10px', color: 'var(--accent-color)' }}>
            <p>Add processes above to run simulations. Guest users can create and edit processes but cannot save them to the database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessForm;