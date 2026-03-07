/**
 * Task create/edit form page.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { TaskStatus, TaskPriority, Class } from '../types';
import { Navigation } from '../components/Navigation';

export const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [progress, setProgress] = useState(0);
  const [classId, setClassId] = useState<number | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
    if (isEdit) {
      fetchTask();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      const task = response.data;
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setPriority(task.priority);
      setStatus(task.status);
      setProgress(task.progress);
      setClassId(task.class_id || null);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      setError('Failed to load task');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const taskData: any = {
        title,
        description,
        priority,
        status,
        progress,
      };

      if (dueDate) {
        taskData.due_date = new Date(dueDate).toISOString();
      }

      if (classId) {
        taskData.class_id = classId;
      }

      if (isEdit) {
        await api.put(`/tasks/${id}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskUpdated'));

      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <div className="page-container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEdit ? '✏️ Edit Task' : '➕ Create New Task'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update your task details' : 'Add a new task to your list'}
                </p>
              </div>
              <Link 
                to="/tasks" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⚡ Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="input-field"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.URGENT}>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="input-field"
                  >
                    <option value={TaskStatus.TODO}>To Do</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.COMPLETED}>Completed</option>
                    <option value={TaskStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📈 Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                    className="input-field"
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📚 Class (Optional)
                </label>
                <select
                  value={classId || ''}
                  onChange={(e) => setClassId(e.target.value ? parseInt(e.target.value) : null)}
                  className="input-field"
                >
                  <option value="">No class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.code && `(${cls.code})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  to="/tasks"
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="mr-2">⏳</span> Saving...
                    </span>
                  ) : isEdit ? (
                    'Update Task'
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

