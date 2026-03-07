/**
 * Calendar view page.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { Task, Exam, TaskPriority, TaskStatus } from '../types';
import { Navigation } from '../components/Navigation';

type ViewMode = 'day' | 'week' | 'month';

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchData = async () => {
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      const [tasksRes, examsRes] = await Promise.all([
        api.get('/tasks', { params: { limit: 200 } }),
        api.get('/exams', { params: { limit: 200 } }),
      ]);
      
      setTasks(tasksRes.data);
      setExams(examsRes.data);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    switch (viewMode) {
      case 'day':
        return currentDate;
      case 'week':
        return startOfWeek(currentDate, { weekStartsOn: 0 });
      case 'month':
        return startOfMonth(currentDate);
    }
  };

  const getEndDate = () => {
    switch (viewMode) {
      case 'day':
        return currentDate;
      case 'week':
        return endOfWeek(currentDate, { weekStartsOn: 0 });
      case 'month':
        return endOfMonth(currentDate);
    }
  };

  const getDays = () => {
    const start = getStartDate();
    const end = getEndDate();
    return eachDayOfInterval({ start, end });
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(
      (task) => task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === dateStr
    );
    const dayExams = exams.filter(
      (exam) => format(new Date(exam.exam_date), 'yyyy-MM-dd') === dateStr
    );
    return { tasks: dayTasks, exams: dayExams };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMode === 'day') {
        setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
      } else if (viewMode === 'week') {
        setCurrentDate(subWeeks(currentDate, 1));
      } else {
        setCurrentDate(subMonths(currentDate, 1));
      }
    } else {
      if (viewMode === 'day') {
        setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
      } else if (viewMode === 'week') {
        setCurrentDate(addWeeks(currentDate, 1));
      } else {
        setCurrentDate(addMonths(currentDate, 1));
      }
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const days = getDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                {viewMode === 'week' &&
                  `${format(days[0], 'MMM d')} - ${format(days[days.length - 1], 'MMM d, yyyy')}`}
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
              </h1>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                →
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Today
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'day'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'day' && (
            <div className="border-t border-gray-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{format(currentDate, 'EEEE, MMMM d')}</h3>
                {(() => {
                  const { tasks: dayTasks, exams: dayExams } = getItemsForDate(currentDate);
                  return (
                    <div className="space-y-6">
                      {dayTasks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">Tasks ({dayTasks.length})</h4>
                          <ul className="space-y-3">
                            {dayTasks.map((task) => (
                              <li key={task.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900 text-base">{task.title}</h5>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                                      {task.priority.toUpperCase()}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                                      {task.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  {task.due_date && (
                                    <span className="flex items-center gap-1">
                                      <span className="font-medium">Due:</span>
                                      {formatTime(task.due_date)}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium">Progress:</span>
                                    {task.progress}%
                                  </span>
                                </div>
                                {task.progress > 0 && (
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${task.progress}%` }}
                                    ></div>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {dayExams.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">Exams ({dayExams.length})</h4>
                          <ul className="space-y-3">
                            {dayExams.map((exam) => (
                              <li key={exam.id} className="p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900 text-base">{exam.title}</h5>
                                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(exam.priority)}`}>
                                    {exam.priority.toUpperCase()}
                                  </span>
                                </div>
                                {exam.description && (
                                  <p className="text-sm text-gray-700 mb-2">{exam.description}</p>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Exam Time:</span>
                                    {formatTime(exam.exam_date)}
                                  </div>
                                  {exam.duration_minutes && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Duration:</span>
                                      {exam.duration_minutes} minutes
                                    </div>
                                  )}
                                  {exam.location && (
                                    <div className="flex items-center gap-1 col-span-2">
                                      <span className="font-medium">Location:</span>
                                      {exam.location}
                                    </div>
                                  )}
                                </div>
                                {exam.syllabus_notes && (
                                  <div className="mt-2 p-2 bg-white rounded border border-red-200">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Syllabus Notes:</p>
                                    <p className="text-xs text-gray-600">{exam.syllabus_notes}</p>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {dayTasks.length === 0 && dayExams.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No items scheduled</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {days.map((day, idx) => {
                  const { tasks: dayTasks, exams: dayExams } = getItemsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div 
                      key={idx} 
                      className="bg-white p-2 min-h-[300px] cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleDayClick(day)}
                    >
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-indigo-600 font-bold' : 'text-gray-900'
                        }`}
                      >
                        {format(day, 'EEE d')}
                      </div>
                      <div className="space-y-1.5">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="text-xs p-2 bg-blue-50 rounded border border-blue-200 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="font-medium text-gray-900 truncate">{task.title}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`px-1 py-0.5 text-[10px] rounded ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase()}
                              </span>
                              <span className={`px-1 py-0.5 text-[10px] rounded ${getStatusColor(task.status)}`}>
                                {task.status.charAt(0).toUpperCase()}
                              </span>
                              {task.progress > 0 && (
                                <span className="text-[10px] text-gray-600">{task.progress}%</span>
                              )}
                            </div>
                            {task.due_date && (
                              <div className="text-[10px] text-gray-600 mt-1">{formatTime(task.due_date)}</div>
                            )}
                          </div>
                        ))}
                        {dayExams.slice(0, 2).map((exam) => (
                          <div
                            key={exam.id}
                            className="text-xs p-2 bg-red-50 rounded border border-red-200 font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              <span>📝</span>
                              <span className="text-gray-900 truncate">{exam.title}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`px-1 py-0.5 text-[10px] rounded ${getPriorityColor(exam.priority)}`}>
                                {exam.priority.charAt(0).toUpperCase()}
                              </span>
                              {exam.location && (
                                <span className="text-[10px] text-gray-600 truncate">📍 {exam.location}</span>
                              )}
                            </div>
                            {exam.exam_date && (
                              <div className="text-[10px] text-gray-600 mt-1">{formatTime(exam.exam_date)}</div>
                            )}
                          </div>
                        ))}
                        {(dayTasks.length > 3 || dayExams.length > 2) && (
                          <div className="text-xs text-gray-500 pt-1">
                            +{dayTasks.length - 3 + dayExams.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
                {/* Calendar days */}
                {days.map((day, idx) => {
                  const { tasks: dayTasks, exams: dayExams } = getItemsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  return (
                    <div
                      key={idx}
                      className={`bg-white p-1.5 min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      }`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div
                        className={`text-sm mb-1 ${
                          isToday
                            ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold'
                            : 'text-gray-900'
                        }`}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className="text-[10px] p-1 bg-blue-50 rounded border border-blue-200 truncate transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-medium truncate">{task.title}</span>
                              <span className={`px-0.5 py-0.5 text-[8px] rounded flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {dayExams.slice(0, 1).map((exam) => (
                          <div
                            key={exam.id}
                            className="text-[10px] p-1 bg-red-50 rounded border border-red-200 truncate font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              <span>📝</span>
                              <span className="truncate">{exam.title}</span>
                            </div>
                          </div>
                        ))}
                        {(dayTasks.length > 2 || dayExams.length > 1) && (
                          <div className="text-[10px] text-gray-500 pt-0.5">
                            +{dayTasks.length - 2 + dayExams.length - 1}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day Details Modal */}
      {isModalOpen && selectedDate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {(() => {
                const { tasks: dayTasks, exams: dayExams } = getItemsForDate(selectedDate);
                return (
                  <div className="space-y-6">
                    {dayTasks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">Tasks ({dayTasks.length})</h4>
                        <ul className="space-y-3">
                          {dayTasks.map((task) => (
                            <li key={task.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-gray-900 text-base">{task.title}</h5>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                                    {task.priority.toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                                    {task.status.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                {task.due_date && (
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium">Due:</span>
                                    {formatTime(task.due_date)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Progress:</span>
                                  {task.progress}%
                                </span>
                              </div>
                              {task.progress > 0 && (
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dayExams.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">Exams ({dayExams.length})</h4>
                        <ul className="space-y-3">
                          {dayExams.map((exam) => (
                            <li key={exam.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-gray-900 text-base">{exam.title}</h5>
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(exam.priority)}`}>
                                  {exam.priority.toUpperCase()}
                                </span>
                              </div>
                              {exam.description && (
                                <p className="text-sm text-gray-700 mb-2">{exam.description}</p>
                              )}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Exam Time:</span>
                                  {formatTime(exam.exam_date)}
                                </div>
                                {exam.duration_minutes && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Duration:</span>
                                    {exam.duration_minutes} minutes
                                  </div>
                                )}
                                {exam.location && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <span className="font-medium">Location:</span>
                                    {exam.location}
                                  </div>
                                )}
                              </div>
                              {exam.syllabus_notes && (
                                <div className="mt-2 p-2 bg-white rounded border border-red-200">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Syllabus Notes:</p>
                                  <p className="text-xs text-gray-600">{exam.syllabus_notes}</p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dayTasks.length === 0 && dayExams.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No items scheduled for this day</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

