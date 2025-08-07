'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueTime?: string;
}

export function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Sample tasks - you can replace this with API integration
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Review project proposals',
        completed: false,
        priority: 'high',
        dueTime: '10:00 AM'
      },
      {
        id: '2',
        title: 'Team standup meeting',
        completed: true,
        priority: 'medium',
        dueTime: '9:30 AM'
      },
      {
        id: '3',
        title: 'Update website content',
        completed: false,
        priority: 'low',
        dueTime: '2:00 PM'
      },
      {
        id: '4',
        title: 'Call client about requirements',
        completed: false,
        priority: 'high',
        dueTime: '3:30 PM'
      },
    ];
    setTasks(sampleTasks);
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        priority: 'medium',
      };
      setTasks(prev => [...prev, task]);
      setNewTask('');
      setShowAddTask(false);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });



  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/20 w-64 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-sm">Daily Tasks</h3>
            <p className="text-white/60 text-xs">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-white/70 text-xs">
              {completedTasks}/{totalTasks}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Add Task Button */}
        <div className="mb-3">
          {!showAddTask ? (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 px-3 rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Task
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Enter new task..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white placeholder-white/50 text-xs focus:outline-none focus:border-blue-400"
                autoFocus
              />
              <div className="flex gap-1">
                <button
                  onClick={addTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddTask(false); setNewTask(''); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tasks List - Limited to 3 tasks, no scroll */}
        <div className="space-y-1.5 overflow-hidden">
          {tasks.length === 0 ? (
            <div className="text-white/50 text-center py-4 text-xs">
              No tasks for today
            </div>
          ) : (
            tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={`bg-white/10 rounded-lg p-2 border border-white/10 transition-all ${task.completed ? 'opacity-60' : 'hover:bg-white/15'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-3 h-3 rounded-full border-2 transition-all flex items-center justify-center ${task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-white/40 hover:border-white/70'
                      }`}
                  >
                    {task.completed && (
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`}
                      ></div>
                      <span
                        className={`text-white text-xs ${task.completed ? 'line-through text-white/60' : ''
                          } truncate`}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.dueTime && (
                      <div className="text-white/50 text-xs">
                        {task.dueTime}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
          {tasks.length > 3 && (
            <div className="text-white/50 text-center py-1 text-xs">
              +{tasks.length - 3} more tasks
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {tasks.length > 0 && (
          <div className="border-t border-white/10 pt-2 mt-3">
            <div className="flex justify-between text-xs text-white/60">
              <span>{progress.toFixed(0)}% Complete</span>
              <span>{tasks.filter(t => !t.completed).length} remaining</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
