import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Chart from 'chart.js/auto';

// Predefined color palette for consistent process colors
const PROCESS_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
  '#073B4C', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B',
  '#8AC926', '#1982C4', '#6A4C93', '#F94144', '#F3722C'
];

const GanttChart = ({ gantt, onTimeChange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  
  // Get theme-aware colors
  const getThemeColors = useCallback(() => {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    return {
      textColor: isDarkMode ? '#e0e0e0' : '#333333',
      gridColor: isDarkMode ? '#444444' : '#e9ecef',
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      waitingColor: isDarkMode ? 'rgba(180, 180, 180, 0.3)' : 'rgba(220, 220, 220, 0.3)',
      waitingBorder: isDarkMode ? 'rgba(200, 200, 200, 0.5)' : 'rgba(180, 180, 180, 0.5)',
      timeIndicator: isDarkMode ? '#ff6b6b' : 'red',
    };
  }, []);

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [maxTime, setMaxTime] = useState(0);
  const [processColors, setProcessColors] = useState({});
  
  // Memoize grouped gantt data to prevent unnecessary recalculations
  const groupedGantt = useMemo(() => {
    if (!gantt || gantt.length === 0) return [];
    
    // Sort by start time for consistent ordering
    const sortedGantt = [...gantt].sort((a, b) => a.start - b.start);
    
    // Single row layout as requested
    return [sortedGantt];
  }, [gantt]);

  // Notify parent of time changes
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(currentTime);
    }
  }, [currentTime, onTimeChange]);

  // Function to get color for a process
  const getProcessColor = useCallback((pid) => {
    return processColors[pid] || PROCESS_COLORS[pid % PROCESS_COLORS.length];
  }, [processColors]);

  // Reset animation when gantt data changes
  useEffect(() => {
    if (gantt && gantt.length > 0) {
      const calculatedMaxTime = Math.max(...gantt.map(entry => entry.end));
      setMaxTime(calculatedMaxTime);
      setCurrentTime(0);
      setIsPlaying(false);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Generate consistent colors for processes
      const newProcessColors = {};
      gantt.forEach(entry => {
        if (!newProcessColors[entry.pid]) {
          newProcessColors[entry.pid] = PROCESS_COLORS[entry.pid % PROCESS_COLORS.length];
        }
      });
      setProcessColors(newProcessColors);
    }
  }, [gantt]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawGanttChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop with optimized frame rate control
  const animate = useCallback(() => {
    if (currentTime < maxTime) {
      setCurrentTime(prevTime => {
        // Increment time based on animation speed
        const newTime = prevTime + 0.1 * animationSpeed;
        return Math.min(newTime, maxTime);
      });
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  }, [currentTime, maxTime, animationSpeed]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, animate]);

  // Draw the custom Gantt chart
  const drawGanttChart = useCallback(() => {
    if (!chartRef.current || !gantt || gantt.length === 0 || groupedGantt.length === 0) return;
    
    const ctx = chartRef.current.getContext('2d');
    const canvas = chartRef.current;
    
    // Get theme colors
    const themeColors = getThemeColors();
    
    // Clear previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Chart dimensions and scaling
    const rowHeight = 80; // Increased height for single row
    const topMargin = 60; // Increased for better heading space
    const bottomMargin = 30;
    const leftMargin = 60;
    const rightMargin = 30;
    
    // Set canvas dimensions - make sure it's responsive
    const containerWidth = containerRef.current?.clientWidth || canvas.parentElement.clientWidth;
    
    // Only show the chart up to the current time plus a small buffer
    // This makes the chart grow dynamically as time progresses
    const visibleTime = Math.min(currentTime + 2, maxTime);
    
    // Calculate time scale based on container width and visible time
    const timeWidth = containerWidth - leftMargin - rightMargin;
    const timeScale = timeWidth / (visibleTime > 0 ? visibleTime : 1);
    
    // Set canvas width based on the current visible time
    canvas.width = containerWidth;
    
    // Set canvas height for single row
    canvas.height = topMargin + rowHeight + bottomMargin;
    canvas.style.height = `${canvas.height}px`;
    
    // Draw the chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Use improved fonts
    const mainFont = "'Segoe UI', Arial, sans-serif";
    
    // Draw time axis
    ctx.beginPath();
    ctx.moveTo(leftMargin, topMargin - 10);
    ctx.lineTo(leftMargin + timeWidth, topMargin - 10);
    ctx.strokeStyle = themeColors.gridColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw time markers with improved styling
    const timeStep = calculateOptimalTimeStep(visibleTime);
    for (let t = 0; t <= visibleTime; t += timeStep) {
      const x = leftMargin + t * timeScale;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, topMargin - 10);
      ctx.lineTo(x, topMargin - 15);
      ctx.stroke();
      
      // Draw time label with improved font
      ctx.fillStyle = themeColors.textColor;
      ctx.font = `500 12px ${mainFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(t.toString(), x, topMargin - 20);
    }
    
    // Draw title with improved fonts
    ctx.fillStyle = themeColors.textColor;
    ctx.font = `bold 16px ${mainFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(`CPU Scheduling Gantt Chart - ${gantt.length} Processes`, canvas.width / 2, 25);
    
    // Draw current time indicator (small marker at the end of the visible chart)
    const currentX = leftMargin + currentTime * timeScale;
    ctx.beginPath();
    ctx.moveTo(currentX, topMargin - 15);
    ctx.lineTo(currentX, topMargin + rowHeight);
    ctx.strokeStyle = themeColors.timeIndicator;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    
    // Draw the single row of processes
    const y = topMargin;
    
    // Draw process blocks dynamically based on current time
    groupedGantt[0].forEach((process) => {
      const startX = leftMargin + process.start * timeScale;
      
      // Calculate how much of the process to draw based on current time
      let processWidth = 0;
      
      // Determine if the process has started
      if (currentTime >= process.start) {
        if (currentTime >= process.end) {
          // Process is complete - draw full width
          processWidth = (process.end - process.start) * timeScale;
        } else {
          // Process is running - draw partial width
          processWidth = (currentTime - process.start) * timeScale;
        }
      }
      
      // Ensure minimum visible width if process has started
      if (processWidth > 0) {
        processWidth = Math.max(2, processWidth);
      }
      
      // Determine process state
      const isActive = currentTime >= process.start && currentTime < process.end;
      const isCompleted = currentTime >= process.end;
      const isWaiting = currentTime < process.start;
      
      // Draw the full process outline as a ghost/placeholder if not started yet
      if (isWaiting) {
        const fullWidth = (process.end - process.start) * timeScale;
        ctx.fillStyle = themeColors.waitingColor;
        ctx.strokeStyle = themeColors.waitingBorder;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]); // Dashed line for waiting processes
        ctx.fillRect(startX, y, fullWidth, rowHeight);
        ctx.strokeRect(startX, y, fullWidth, rowHeight);
        ctx.setLineDash([]); // Reset to solid line
      }
      
      // Only draw actual process block if it has started
      if (processWidth > 0) {
        // Apply styling based on process state
        if (isActive) {
          // Active process - add a pulsing effect
          const pulseIntensity = 0.2;
          const pulseSpeed = 2;
          const pulseValue = 0.5 + pulseIntensity * Math.sin(Date.now() / 1000 * pulseSpeed);
          
          ctx.fillStyle = `rgba(255, 165, 0, ${pulseValue})`;
          ctx.strokeStyle = 'rgba(255, 165, 0, 1)';
          ctx.lineWidth = 3;
          
          // Add glow effect
          ctx.shadowColor = 'rgba(255, 165, 0, 0.5)';
          ctx.shadowBlur = 10;
        } else if (isCompleted) {
          // Completed process
          ctx.fillStyle = getProcessColor(process.pid);
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0; // Reset shadow
        }
        
        // Draw process block - only for started processes
        ctx.fillRect(startX, y, processWidth, rowHeight);
        ctx.strokeRect(startX, y, processWidth, rowHeight);
        
        // Draw progress percentage for active processes with improved font
        if (isActive && processWidth > 40) {
          const progressPercent = Math.round((currentTime - process.start) / (process.end - process.start) * 100);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.font = `bold 14px ${mainFont}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${progressPercent}%`, startX + processWidth / 2, y + rowHeight / 2 + 12);
        }
        
        // Draw process label with improved font
        if (processWidth > 30) {
          // Process name
          ctx.fillStyle = 'black';
          ctx.font = `bold 16px ${mainFont}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`P${process.pid}`, startX + processWidth / 2, y + rowHeight / 2 - 15);
          
          // Only add end time if process is completed
          if (isCompleted && processWidth > 60) {
            ctx.font = `13px ${mainFont}`;
            ctx.fillText(`Duration: ${(process.end - process.start).toFixed(1)}`, startX + processWidth / 2, y + rowHeight / 2 + 15);
          }
        } else if (processWidth > 5) {
          // Just process ID for very small blocks with improved font
          ctx.save();
          ctx.translate(startX + processWidth / 2, y + rowHeight / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = 'black';
          ctx.font = `bold 12px ${mainFont}`;
          ctx.textAlign = 'center';
          ctx.fillText(`P${process.pid}`, 0, 0);
          ctx.restore();
        }
      }
      
      // Draw start time markers with improved font
      ctx.fillStyle = themeColors.textColor;
      ctx.font = `500 11px ${mainFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(process.start.toString(), startX, y - 8);
    });
    
    // Create dummy chart instance to satisfy the ref
    chartInstance.current = {
      destroy: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [gantt, groupedGantt, currentTime, maxTime, getProcessColor, getThemeColors]);
  
  // Calculate optimal time step for axis labels
  const calculateOptimalTimeStep = (visibleTime) => {
    if (visibleTime <= 10) return 1;
    if (visibleTime <= 20) return 2;
    if (visibleTime <= 50) return 5;
    if (visibleTime <= 100) return 10;
    return Math.ceil(visibleTime / 10);
  };
  
  // Update chart when relevant state changes
  useEffect(() => {
    drawGanttChart();
  }, [drawGanttChart]);

  // Listen for theme changes and redraw the chart
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          drawGanttChart();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, [drawGanttChart]);

  // Play/Pause handlers
  const togglePlay = () => {
    if (currentTime >= maxTime) {
      // Restart if at the end
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Step controls
  const stepForward = () => {
    setCurrentTime(prevTime => Math.min(prevTime + 1, maxTime));
    setIsPlaying(false);
  };

  const stepBackward = () => {
    setCurrentTime(prevTime => Math.max(prevTime - 1, 0));
    setIsPlaying(false);
  };

  // Reset animation
  const resetAnimation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Jump to specific time
  const jumpToTime = (time) => {
    const newTime = Math.max(0, Math.min(time, maxTime));
    setCurrentTime(newTime);
    setIsPlaying(false);
  };

  // Handle animation speed change
  const handleSpeedChange = (e) => {
    setAnimationSpeed(parseFloat(e.target.value));
  };

  // Keyboard shortcuts for controlling animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return; // Don't handle keyboard shortcuts when focus is on form elements
      }
      
      switch (e.key) {
        case ' ': // Space bar
          togglePlay();
          e.preventDefault();
          break;
        case 'ArrowRight':
          stepForward();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          stepBackward();
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          resetAnimation();
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward, resetAnimation]);

  // Render process queues
  const renderProcessQueues = () => {
    if (!gantt || gantt.length === 0) return null;
    
    const waitingProcesses = gantt.filter(entry => currentTime < entry.start)
      .sort((a, b) => a.start - b.start);
      
    const runningProcesses = gantt.filter(entry => currentTime >= entry.start && currentTime < entry.end);
    
    const completedProcesses = gantt.filter(entry => currentTime >= entry.end)
      .sort((a, b) => b.end - a.end);
    
    return (
      <div className="process-queues">
        <h4>Process Queues</h4>
        <div className="queues-container">
          <div className="queue waiting-queue">
            <h5>Waiting Queue</h5>
            <div className="queue-items">
              {waitingProcesses.length > 0 ? (
                waitingProcesses.map(entry => (
                  <div 
                    key={`waiting-${entry.pid}`} 
                    className="queue-item" 
                    style={{ backgroundColor: getProcessColor(entry.pid) }}
                  >
                    P{entry.pid}
                    <span className="queue-item-time">Start: {entry.start}</span>
                  </div>
                ))
              ) : (
                <div className="empty-queue">No waiting processes</div>
              )}
            </div>
          </div>
          
          <div className="queue running-queue">
            <h5>Running Queue</h5>
            <div className="queue-items">
              {runningProcesses.length > 0 ? (
                runningProcesses.map(entry => (
                  <div 
                    key={`running-${entry.pid}`} 
                    className="queue-item running" 
                    style={{ backgroundColor: getProcessColor(entry.pid) }}
                  >
                    P{entry.pid}
                    <span className="queue-item-time">
                      Progress: {Math.round((currentTime - entry.start) / (entry.end - entry.start) * 100)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-queue">No running processes</div>
              )}
            </div>
          </div>
          
          <div className="queue completed-queue">
            <h5>Completed Queue</h5>
            <div className="queue-items">
              {completedProcesses.length > 0 ? (
                completedProcesses.map(entry => (
                  <div 
                    key={`completed-${entry.pid}`} 
                    className="queue-item completed" 
                    style={{ backgroundColor: getProcessColor(entry.pid) }}
                  >
                    P{entry.pid}
                    <span className="queue-item-time">End: {entry.end}</span>
                  </div>
                ))
              ) : (
                <div className="empty-queue">No completed processes</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render time slider
  const renderTimeSlider = () => {
    return (
      <div className="time-slider-container">
        <input
          type="range"
          min="0"
          max={maxTime}
          step="0.1"
          value={currentTime}
          onChange={(e) => jumpToTime(parseFloat(e.target.value))}
          className="time-slider"
        />
        <div className="time-slider-labels">
          <span>0</span>
          <span>{maxTime}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="gantt-chart-container" ref={containerRef}>
      <h3>Gantt Chart</h3>
      <div className="custom-chart-container">
        <h3 className="chart-title">
          {gantt && gantt.length > 0 ? `CPU Scheduling Gantt Chart - ${gantt.length} Processes` : 'CPU Scheduling Gantt Chart'}
        </h3>
        
        <div className="animation-controls">
          <div className="time-controls">
            <div className="time-display">
              Time: {currentTime.toFixed(1)}
            </div>
            
            <button 
              className={`control-button step-button`} 
              onClick={stepBackward}
              disabled={currentTime <= 0}
              title="Step backward (Left Arrow)"
            >
              &laquo; Step
            </button>
          </div>
          
          <div className="control-buttons">
            <button 
              className={`control-button ${isPlaying ? 'reset-button' : 'play-button'}`} 
              onClick={togglePlay}
              title="Play/Pause (Space)"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button 
              className={`control-button reset-button`} 
              onClick={resetAnimation}
              title="Reset (R)"
            >
              Reset
            </button>
            
            <button 
              className={`control-button step-button`} 
              onClick={stepForward}
              disabled={currentTime >= maxTime}
              title="Step forward (Right Arrow)"
            >
              Step &raquo;
            </button>
          </div>
          
          <div className="speed-control">
            <label htmlFor="speed-select">Speed:</label>
            <select 
              id="speed-select"
              value={animationSpeed} 
              onChange={handleSpeedChange}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
            </select>
          </div>
        </div>
        
        {/* Time slider for quick navigation */}
        {renderTimeSlider()}
        
        <canvas 
          ref={chartRef}
          style={{ width: '100%', height: 'auto' }}
        ></canvas>

        {/* Chart Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ 
              backgroundColor: 'rgba(255, 165, 0, 0.7)', 
              boxShadow: '0 0 8px rgba(255,165,0,0.5)' 
            }}></div>
            <div className="legend-label">Currently Running</div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ 
              backgroundColor: 'rgba(220, 220, 220, 0.3)', 
              border: '1px dashed rgba(180, 180, 180, 0.9)' 
            }}></div>
            <div className="legend-label">Not Started</div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4ECDC4' }}></div>
            <div className="legend-label">Completed</div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ 
              backgroundColor: 'transparent', 
              position: 'relative' 
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0, 
                borderTop: '2px solid red', 
                zIndex: 1
              }}></div>
            </div>
            <div className="legend-label">Current Time</div>
          </div>
        </div>
        
        {/* Keyboard shortcuts help */}
        <div className="keyboard-shortcuts">
          <details>
            <summary>Keyboard Shortcuts</summary>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span className="shortcut-key">Space</span>
                <span className="shortcut-desc">Play/Pause</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">←</span>
                <span className="shortcut-desc">Step Backward</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">→</span>
                <span className="shortcut-desc">Step Forward</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">R</span>
                <span className="shortcut-desc">Reset</span>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Process Queues */}
      {renderProcessQueues()}
    </div>
  );
};

export default GanttChart; 