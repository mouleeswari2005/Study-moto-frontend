/**
 * Exam create/edit form page.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { TaskPriority, Class } from '../types';
import { Navigation } from '../components/Navigation';

export const ExamForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  const [syllabusNotes, setSyllabusNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [classId, setClassId] = useState<number | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
    if (isEdit) {
      fetchExam();
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

  const fetchExam = async () => {
    try {
      const response = await api.get(`/exams/${id}`);
      const exam = response.data;
      setTitle(exam.title);
      setDescription(exam.description || '');
      const examDateTime = new Date(exam.exam_date);
      setExamDate(examDateTime.toISOString().split('T')[0]);
      setExamTime(examDateTime.toTimeString().slice(0, 5));
      setDurationMinutes(exam.duration_minutes || null);
      setLocation(exam.location || '');
      setSyllabusNotes(exam.syllabus_notes || '');
      setPriority(exam.priority);
      setClassId(exam.class_id || null);
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      setError('Failed to load exam');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const examDateTime = new Date(`${examDate}T${examTime}`);
      const examData: any = {
        title,
        description,
        exam_date: examDateTime.toISOString(),
        priority,
      };

      if (durationMinutes) {
        examData.duration_minutes = durationMinutes;
      }
      if (location) {
        examData.location = location;
      }
      if (syllabusNotes) {
        examData.syllabus_notes = syllabusNotes;
      }
      if (classId) {
        examData.class_id = classId;
      }

      if (isEdit) {
        await api.put(`/exams/${id}`, examData);
      } else {
        await api.post('/exams', examData);
      }

      navigate('/exams');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <div className="page-container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Exam' : 'Schedule New Exam'}
            </h1>
            <Link to="/exams" className="text-indigo-600 hover:text-indigo-500">
              ← Back to Exams
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter exam title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter exam description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Time *
                </label>
                <input
                  type="time"
                  required
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={durationMinutes || ''}
                  onChange={(e) =>
                    setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                  <option value={TaskPriority.URGENT}>Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Room 101, Building A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Syllabus Notes
              </label>
              <textarea
                value={syllabusNotes}
                onChange={(e) => setSyllabusNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter syllabus topics, chapters, or study notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class (Optional)
              </label>
              <select
                value={classId || ''}
                onChange={(e) => setClassId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.code && `(${cls.code})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                to="/exams"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Exam' : 'Schedule Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

