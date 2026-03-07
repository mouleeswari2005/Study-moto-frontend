/**
 * Classes list page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Class } from '../types';
import { Navigation } from '../components/Navigation';

export const Classes: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Failed to delete class');
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setName(classItem.name);
    setCode(classItem.code || '');
    setColor(classItem.color || '#6366f1');
    setInstructor(classItem.instructor || '');
    setLocation(classItem.location || '');
    setDescription(classItem.description || '');
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
    setName('');
    setCode('');
    setColor('#6366f1');
    setInstructor('');
    setLocation('');
    setDescription('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const classData: any = {
        name,
        code: code || undefined,
        color: color || undefined,
        instructor: instructor || undefined,
        location: location || undefined,
        description: description || undefined,
      };

      if (editingClass) {
        await api.put(`/classes/${editingClass.id}`, classData);
      } else {
        await api.post('/classes', classData);
      }

      handleCancel();
      fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save class');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading classes...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Classes</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your academic classes</p>
          </div>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
            className="btn-primary w-full sm:w-auto text-center"
          >
            ➕ New Class
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="card-glass mb-6 animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Computer Science 101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="input-field"
                      placeholder="e.g., CS101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="input-field flex-1"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                      className="input-field"
                      placeholder="Professor Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Room 101, Building A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {formLoading ? 'Saving...' : editingClass ? 'Update Class' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Classes List */}
        {classes.length === 0 && !showForm ? (
          <div className="card-glass">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No classes found</h3>
              <p className="text-gray-600 mb-6">Create your first class to get started!</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-block"
              >
                Create Your First Class
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {classes.map((classItem) => (
              <div key={classItem.id} className="card-glass card-hover group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: classItem.color || '#6366f1' }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {classItem.name}
                        </h3>
                        {classItem.code && (
                          <p className="text-sm text-gray-600">{classItem.code}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {classItem.instructor && (
                    <div className="mb-2 text-sm text-gray-600">
                      <span className="font-medium">Instructor:</span> {classItem.instructor}
                    </div>
                  )}

                  {classItem.location && (
                    <div className="mb-2 text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {classItem.location}
                    </div>
                  )}

                  {classItem.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{classItem.description}</p>
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


