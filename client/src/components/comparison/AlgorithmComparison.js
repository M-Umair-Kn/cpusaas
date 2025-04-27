import React, { useState } from 'react';
import { simulate } from '../../utils/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AlgorithmComparison = ({ processes }) => {
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [comparisonMetrics, setComparisonMetrics] = useState(null);
  const [error, setError] = useState('');
  
  const algorithms = ['FCFS', 'SJF', 'SRTF', 'Priority', 'Priority (Preemptive)', 'RR'];
  const timeQuantum = 2; // Default time quantum for Round Robin
  
  const runComparison = async () => {
    if (!processes || processes.length === 0) {
      setError('No processes to compare. Please add processes first.');
      return;
    }

    // Check if all processes have priority for Priority algorithms
    const missingPriority = processes.some(p => p.priority === null || p.priority === undefined);
    if (missingPriority) {
      setError('All processes must have a priority value for algorithm comparison (Priority scheduling)');
      return;
    }

    setIsComparing(true);
    setError('');
    
    try {
      const results = await Promise.all(
        algorithms.map(algorithm => 
          simulate.runSimulation(
            algorithm, 
            processes, 
            null, 
            algorithm === 'RR' ? { timeQuantum } : {}
          )
        )
      );
      
      const processedResults = results.map((res, index) => ({
        algorithm: algorithms[index],
        metrics: res.data.metrics
      }));
      
      setComparisonResults(processedResults);
      
      // Format data for chart
      const chartData = {
        labels: algorithms,
        datasets: [
          {
            label: 'Average Waiting Time',
            data: processedResults.map(r => r.metrics.averageWaitingTime),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
          {
            label: 'Average Turnaround Time',
            data: processedResults.map(r => r.metrics.averageTurnaroundTime),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Average Response Time',
            data: processedResults.map(r => r.metrics.averageResponseTime),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'CPU Utilization (%)',
            data: processedResults.map(r => r.metrics.cpuUtilization),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
          }
        ]
      };
      
      setComparisonMetrics(chartData);
    } catch (err) {
      console.error(err);
      setError('Failed to run comparison. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };
  
  return (
    <div className="algorithm-comparison">
      <h3>Algorithm Comparison</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <button 
        className="btn btn-primary" 
        onClick={runComparison}
        disabled={isComparing}
      >
        {isComparing ? 'Comparing...' : 'Compare Algorithms'}
      </button>
      
      {isComparing && <div className="loading">Comparing algorithms...</div>}
      
      {comparisonMetrics && (
        <div className="comparison-results">
          <h4>Performance Metrics Comparison</h4>
          <div className="chart-container">
            <Bar 
              data={comparisonMetrics}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Algorithm Performance Comparison',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Time / Percentage'
                    }
                  }
                }
              }}
            />
          </div>
          
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Avg. Waiting Time</th>
                <th>Avg. Turnaround Time</th>
                <th>Avg. Response Time</th>
                <th>CPU Utilization</th>
                <th>Throughput</th>
              </tr>
            </thead>
            <tbody>
              {comparisonResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.algorithm}</td>
                  <td>{result.metrics.averageWaitingTime.toFixed(2)}</td>
                  <td>{result.metrics.averageTurnaroundTime.toFixed(2)}</td>
                  <td>{result.metrics.averageResponseTime.toFixed(2)}</td>
                  <td>{result.metrics.cpuUtilization.toFixed(2)}%</td>
                  <td>{result.metrics.throughput.toFixed(4)} proc/unit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AlgorithmComparison;