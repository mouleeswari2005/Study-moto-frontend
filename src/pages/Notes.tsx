/**
 * Notes list page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Note } from '../types';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes', { params: { limit: 100 } });
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading notes...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notes</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your notes</p>
          </div>
          <Link to="/notes/new" className="btn-primary w-full sm:w-auto text-center">
            ➕ New Note
          </Link>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="card">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600 mb-6">Create your first note to get started!</p>
              <Link to="/notes/new" className="btn-primary inline-block">
                Create Your First Note
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {notes.map((note) => (
              <div key={note.id} className="card-glass card-hover group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span className="mr-2">📅</span>
                        <span>{note.date}</span>
                        <span className="mx-2">•</span>
                        <span className="mr-2">🕐</span>
                        <span>{note.time}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <Link
                        to={`/notes/${note.id}/edit`}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {note.notes && (
                    <p className="text-sm text-gray-600 line-clamp-4 mb-4">{note.notes}</p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">📅</span>
                    <span>{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




