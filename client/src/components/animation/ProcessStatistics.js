import React, { useMemo } from 'react';

const ProcessStatistics = ({ gantt, currentTime }) => {
  // Calculate statistics based on current time
  const statistics = useMemo(() => {
    if (!gantt || gantt.length === 0) {
      return null;
    }

    // Count processes by status
    const statusCounts = {
      waiting: 0,
      running: 0,
      completed: 0,
      total: gantt.length
    };

    // Track the current running process
    let currentRunningProcess = null;

    // Calculate waiting time, turnaround time, etc.
    const processStats = gantt.map(entry => {
      // Determine process status
      const status = 
        currentTime < entry.start ? 'waiting' :
        currentTime >= entry.end ? 'completed' : 'running';
      
      // Count by status
      statusCounts[status]++;
      
      // Keep track of running process
      if (status === 'running') {
        currentRunningProcess = entry;
      }

      // Calculate times
      const waitingTime = entry.start;
      const elapsedTime = Math.min(currentTime - entry.start, entry.end - entry.start);
      const turnaroundTime = entry.end;
      const remainingTime = Math.max(0, entry.end - currentTime);
      const completionPercentage = Math.min(100, Math.max(0, 
        entry.start >= currentTime ? 0 : 
        (currentTime - entry.start) / (entry.end - entry.start) * 100
      ));

      return {
        pid: entry.pid,
        status,
        waitingTime,
        turnaroundTime,
        elapsedTime: Math.max(0, elapsedTime),
        remainingTime,
        completionPercentage: parseInt(completionPercentage),
        start: entry.start,
        end: entry.end
      };
    });

    return {
      statusCounts,
      processStats,
      currentRunningProcess
    };
  }, [gantt, currentTime]);

  if (!statistics) {
    return null;
  }

  return (
    <div className="process-statistics">
      <h4>Process Statistics (Time: {currentTime.toFixed(1)})</h4>
      
      <div className="stats-summary">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Total Processes:</span>
            <span className="stat-value">{statistics.statusCounts.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Waiting:</span>
            <span className="stat-value">{statistics.statusCounts.waiting}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Running:</span>
            <span className="stat-value">{statistics.statusCounts.running}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{statistics.statusCounts.completed}</span>
          </div>
        </div>
      </div>

      {statistics.currentRunningProcess && (
        <div className="current-process">
          <h5>Currently Running: Process {statistics.currentRunningProcess.pid}</h5>
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ 
                width: `${Math.min(100, Math.max(0, 
                  (currentTime - statistics.currentRunningProcess.start) / 
                  (statistics.currentRunningProcess.end - statistics.currentRunningProcess.start) * 100
                ))}%` 
              }}
              aria-valuenow={Math.min(100, Math.max(0, 
                (currentTime - statistics.currentRunningProcess.start) / 
                (statistics.currentRunningProcess.end - statistics.currentRunningProcess.start) * 100
              ))}
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {Math.min(100, Math.max(0, 
                (currentTime - statistics.currentRunningProcess.start) / 
                (statistics.currentRunningProcess.end - statistics.currentRunningProcess.start) * 100
              )).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      <table className="table table-sm table-bordered mt-3">
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Status</th>
            <th>Waiting Time</th>
            <th>Progress</th>
            <th>Remaining Time</th>
            <th>Turnaround Time</th>
          </tr>
        </thead>
        <tbody>
          {statistics.processStats.map(process => (
            <tr key={process.pid} className={`table-${process.status === 'running' ? 'warning' : process.status === 'completed' ? 'success' : 'light'}`}>
              <td>P{process.pid}</td>
              <td>
                <span className={`badge ${
                  process.status === 'running' ? 'text-bg-warning' : 
                  process.status === 'completed' ? 'text-bg-success' : 
                  'text-bg-secondary'
                }`}>
                  {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                </span>
              </td>
              <td>{process.waitingTime.toFixed(1)}</td>
              <td>
                <div className="progress" style={{ height: '20px' }}>
                  <div 
                    className={`progress-bar ${
                      process.status === 'running' ? 'bg-warning' : 
                      process.status === 'completed' ? 'bg-success' : 
                      'bg-secondary'
                    }`}
                    role="progressbar" 
                    style={{ width: `${process.completionPercentage}%` }} 
                    aria-valuenow={process.completionPercentage} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {process.completionPercentage}%
                  </div>
                </div>
              </td>
              <td>{process.remainingTime.toFixed(1)}</td>
              <td>{process.turnaroundTime.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessStatistics; 