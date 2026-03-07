/**
 * Tasks list page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Task, TaskStatus, TaskPriority } from '../types';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const fetchTasks = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const response = await api.get('/tasks', { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleQuickStatusUpdate = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleQuickProgressUpdate = async (taskId: number, newProgress: number) => {
    try {
      await api.put(`/tasks/${taskId}`, { progress: newProgress });
      fetchTasks();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (error) {
      console.error('Failed to update task progress:', error);
      alert('Failed to update task progress');
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-sm md:text-base text-gray-600">Manage and track your assignments</p>
          </div>
          <Link to="/tasks/new" className="btn-primary w-full sm:w-auto text-center">
            ➕ New Task
          </Link>
        </div>

        {/* Filters */}
        <div className="card-glass mb-6">
          <div className="p-3 md:p-4">
            <div className="flex flex-wrap gap-2">
              {(['all', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Tasks' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="card">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">Create your first task to get started!</p>
              <Link to="/tasks/new" className="btn-primary inline-block">
                Create Your First Task
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="card-glass card-hover group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1 group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </h3>
                    <div className="flex space-x-2 ml-2">
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`badge border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {/* Quick Status Update */}
                    <select
                      value={task.status}
                      onChange={(e) => handleQuickStatusUpdate(task.id, e.target.value as TaskStatus)}
                      className={`badge border ${getStatusColor(task.status)} cursor-pointer text-xs font-medium px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      onClick={(e) => e.stopPropagation()}
                      title="Click to change status"
                    >
                      <option value={TaskStatus.TODO}>To Do</option>
                      <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                      <option value={TaskStatus.COMPLETED}>Completed</option>
                      <option value={TaskStatus.CANCELLED}>Cancelled</option>
                    </select>
                  </div>
                  
                  {/* Progress Section with Quick Update */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-1">
                      {[0, 25, 50, 75, 100].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleQuickProgressUpdate(task.id, value)}
                          className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                            task.progress === value
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {value}%
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {task.due_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📅</span>
                      <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

