import React from 'react';

const MetricsTable = ({ metrics }) => {
  if (!metrics) {
    return <p>No metrics available</p>;
  }

  return (
    <div className="metrics-container">
      <h3>Performance Metrics</h3>
      
      <div className="metrics-summary">
        <div className="metric-card">
          <h4>Average Waiting Time</h4>
          <p>{metrics.averageWaitingTime.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <h4>Average Turnaround Time</h4>
          <p>{metrics.averageTurnaroundTime.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <h4>Average Response Time</h4>
          <p>{metrics.averageResponseTime.toFixed(2)}</p>
        </div>
      </div>

      <h4>Process Details</h4>
      <table className="metrics-table">
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Waiting Time</th>
            <th>Turnaround Time</th>
            <th>Response Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(metrics.processMetrics).map(pid => (
            <tr key={pid}>
              <td>{pid}</td>
              <td>{metrics.processMetrics[pid].waitingTime.toFixed(2)}</td>
              <td>{metrics.processMetrics[pid].turnaroundTime.toFixed(2)}</td>
              <td>{metrics.processMetrics[pid].responseTime.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsTable; 