/**
 * Note create/edit form page.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Navigation } from '../components/Navigation';

export const NoteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/${id}`);
      const note = response.data;
      setDate(note.date || '');
      setTime(note.time || '');
      setNotes(note.notes || '');
    } catch (error) {
      console.error('Failed to fetch note:', error);
      setError('Failed to load note');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const noteData: any = {
        date,
        time,
        notes: notes || null,
      };

      if (isEdit) {
        await api.put(`/notes/${id}`, noteData);
      } else {
        await api.post('/notes', noteData);
      }

      navigate('/notes');
    } catch (err: any) {
      console.error('Error saving note:', err);
      setError(err.response?.data?.detail || 'Failed to save note');
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
                  {isEdit ? '✏️ Edit Note' : '➕ Create New Note'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update your note' : 'Create a new note'}
                </p>
              </div>
              <Link 
                to="/notes" 
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                    placeholder="Enter date (e.g., 2024-07-15)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input-field"
                    placeholder="Enter time (e.g., 10:00 AM)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Enter your notes (optional)"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  to="/notes"
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
                    'Update Note'
                  ) : (
                    'Create Note'
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




