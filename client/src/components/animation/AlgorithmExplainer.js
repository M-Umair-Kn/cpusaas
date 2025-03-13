import React from 'react';

const AlgorithmExplainer = ({ algorithm, gantt, currentTime }) => {
  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'FCFS':
        return {
          name: 'First-Come, First-Served (FCFS)',
          description: 'Processes are executed in the order they arrive in the ready queue. It is a non-preemptive scheduling algorithm.',
          advantages: [
            'Simple to implement',
            'Easy to understand',
            'Low overhead'
          ],
          disadvantages: [
            'Can lead to the "convoy effect" where a single CPU-intensive process can delay all other processes',
            'Not optimal for time-sharing systems',
            'Average waiting time can be long'
          ]
        };
      case 'SJF':
        return {
          name: 'Shortest Job First (SJF)',
          description: 'Processes with the shortest burst time are executed first. It is usually non-preemptive.',
          advantages: [
            'Provides minimum average waiting time among all scheduling algorithms',
            'Good for batch systems where job lengths are known in advance'
          ],
          disadvantages: [
            'Difficult to predict burst time in advance',
            'Can lead to starvation for longer processes',
            'Not feasible in interactive systems'
          ]
        };
      case 'SRTF':
        return {
          name: 'Shortest Remaining Time First (SRTF)',
          description: 'Preemptive version of SJF where the process with the shortest remaining time is selected for execution. If a new process arrives with a shorter burst time, the current process is preempted.',
          advantages: [
            'Optimal average waiting time',
            'Good response time for short processes'
          ],
          disadvantages: [
            'High overhead due to frequent context switching',
            'Difficult to predict remaining time',
            'Can lead to starvation for longer processes'
          ]
        };
      case 'RR':
        return {
          name: 'Round Robin (RR)',
          description: 'Each process is assigned a fixed time slice (quantum). After the time quantum expires, the process is preempted and added to the back of the ready queue.',
          advantages: [
            'Fair allocation of CPU time',
            'Good for time-sharing systems',
            'Better response time for short processes'
          ],
          disadvantages: [
            'Higher overhead due to frequent context switching',
            'Average waiting time can be longer',
            'Performance depends on the time quantum size'
          ]
        };
      case 'Priority':
        return {
          name: 'Priority Scheduling',
          description: 'Each process is assigned a priority, and the process with the highest priority is executed first. It can be preemptive or non-preemptive.',
          advantages: [
            'Prioritizes important processes',
            'Suitable for real-time systems',
            'Can optimize system performance for specific objectives'
          ],
          disadvantages: [
            'Can lead to starvation for low-priority processes',
            'Priority inversion problem can occur',
            'Requires mechanism to assign priorities'
          ]
        };
      default:
        return {
          name: 'Unknown Algorithm',
          description: 'Information about this algorithm is not available.',
          advantages: [],
          disadvantages: []
        };
    }
  };

  const algorithmInfo = getAlgorithmDescription();
  
  const getCurrentOperation = () => {
    if (!gantt || gantt.length === 0) {
      return null;
    }
    
    // Find current running process
    const runningProcess = gantt.find(entry => 
      currentTime >= entry.start && currentTime < entry.end
    );
    
    if (!runningProcess) {
      if (currentTime === 0) {
        return "Simulation ready to start. Press Play to begin.";
      } else if (currentTime >= Math.max(...gantt.map(entry => entry.end))) {
        return "Simulation complete. All processes have finished execution.";
      } else {
        return "CPU idle - waiting for processes.";
      }
    }
    
    // Find processes that are waiting
    const waitingProcesses = gantt.filter(entry => 
      currentTime < entry.start
    ).length;
    
    // Find processes that are completed
    const completedProcesses = gantt.filter(entry => 
      currentTime >= entry.end
    ).length;
    
    let explanation = `Process ${runningProcess.pid} is currently running.`;
    
    // Add algorithm-specific explanation
    switch (algorithm) {
      case 'FCFS':
        explanation += ` In FCFS, processes are executed in the order they arrive.`;
        break;
      case 'SJF':
        explanation += ` In SJF, the process with the shortest burst time was selected.`;
        break;
      case 'SRTF':
        explanation += ` In SRTF, the process with the shortest remaining time is selected.`;
        break;
      case 'RR':
        explanation += ` In Round Robin, each process gets a time quantum before being preempted.`;
        break;
      case 'Priority':
        explanation += ` In Priority scheduling, the process with the highest priority is selected.`;
        break;
      default:
        break;
    }
    
    explanation += ` There are ${waitingProcesses} process(es) waiting and ${completedProcesses} process(es) completed.`;
    
    return explanation;
  };

  const currentOperation = getCurrentOperation();

  return (
    <div className="algorithm-explainer">
      <h4>{algorithmInfo.name}</h4>
      <p className="algorithm-description">{algorithmInfo.description}</p>
      
      {currentOperation && (
        <div className="current-operation">
          <h5>Current Operation</h5>
          <p>{currentOperation}</p>
        </div>
      )}
      
      <div className="algorithm-details">
        <div className="algorithm-advantages">
          <h5>Advantages</h5>
          <ul>
            {algorithmInfo.advantages.map((advantage, index) => (
              <li key={index}>{advantage}</li>
            ))}
          </ul>
        </div>
        
        <div className="algorithm-disadvantages">
          <h5>Disadvantages</h5>
          <ul>
            {algorithmInfo.disadvantages.map((disadvantage, index) => (
              <li key={index}>{disadvantage}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmExplainer; 