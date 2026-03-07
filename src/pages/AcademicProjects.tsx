/**
 * Academic Projects list page.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { AcademicProject } from '../types';
import { Navigation } from '../components/Navigation';
import { format } from 'date-fns';

export const AcademicProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<AcademicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<AcademicProject | null>(null);
  
  // Form state
  const [projectTitle, setProjectTitle] = useState('');
  const [noOfProject, setNoOfProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [completedProject, setCompletedProject] = useState(false);
  const [uploadArea, setUploadArea] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/academic-projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/academic-projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleEdit = (project: AcademicProject) => {
    setEditingProject(project);
    setProjectTitle(project.project_title);
    setNoOfProject(project.no_of_project.toString());
    setStartDate(project.start_date.split('T')[0]);
    setSubmissionDate(project.submission_date.split('T')[0]);
    setCompletedProject(project.completed_project);
    setUploadArea(project.upload_area || '');
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setProjectTitle('');
    setNoOfProject('');
    setStartDate('');
    setSubmissionDate('');
    setCompletedProject(false);
    setUploadArea('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const projectData: any = {
        project_title: projectTitle,
        no_of_project: parseInt(noOfProject),
        start_date: startDate,
        submission_date: submissionDate,
        completed_project: completedProject,
        upload_area: uploadArea || undefined,
      };

      if (editingProject) {
        await api.put(`/academic-projects/${editingProject.id}`, projectData);
      } else {
        await api.post('/academic-projects', projectData);
      }

      handleCancel();
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save project');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading projects...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Academic Projects</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your academic projects</p>
          </div>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
            className="btn-primary w-full sm:w-auto text-center"
          >
            ➕ New Project
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="card-glass mb-6 animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
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
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="input-field"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      No Of Project <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={noOfProject}
                      onChange={(e) => setNoOfProject(e.target.value)}
                      className="input-field"
                      placeholder="Enter number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Submission Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Area (Drive Link)
                  </label>
                  <input
                    type="text"
                    value={uploadArea}
                    onChange={(e) => setUploadArea(e.target.value)}
                    className="input-field"
                    placeholder="Enter Google Drive link"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={completedProject}
                    onChange={(e) => setCompletedProject(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="completed" className="ml-2 text-sm font-semibold text-gray-700">
                    Completed Project
                  </label>
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
                    {formLoading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 && !showForm ? (
          <div className="card-glass">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started!</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-block"
              >
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {projects.map((project) => (
              <div key={project.id} className="card-glass card-hover group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {project.project_title}
                      </h3>
                      <p className="text-sm text-gray-600">Project #{project.no_of_project}</p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Start Date:</span>{' '}
                      {format(new Date(project.start_date), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Submission Date:</span>{' '}
                      {format(new Date(project.submission_date), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={project.completed_project ? 'text-green-600' : 'text-orange-600'}>
                        {project.completed_project ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    {project.upload_area && (
                      <div>
                        <span className="font-medium">Drive Link:</span>{' '}
                        <a
                          href={project.upload_area}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View Link
                        </a>
                      </div>
                    )}
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




