import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { TimerProvider } from './contexts/TimerContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Pomodoro } from './pages/Pomodoro';
import { Tasks } from './pages/Tasks';
import { TaskForm } from './pages/TaskForm';
import { Exams } from './pages/Exams';
import { ExamForm } from './pages/ExamForm';
import { Settings } from './pages/Settings';
import { Calendar } from './pages/Calendar';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import { Reminders } from './pages/Reminders';
import { Classes } from './pages/Classes';
import { AcademicProjects } from './pages/AcademicProjects';
import { ExtraActivities } from './pages/ExtraActivities';
import { StudyPlans } from './pages/StudyPlans';
import { StudyPlanForm } from './pages/StudyPlanForm';
import { SummerVacations } from './pages/SummerVacations';
import { SummerVacationForm } from './pages/SummerVacationForm';
import { Notes } from './pages/Notes';
import { NoteForm } from './pages/NoteForm';
import { Streaks } from './pages/Streaks';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <TimerProvider>
          <NotificationProvider>
            <Router>
            <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pomodoro"
            element={
              <ProtectedRoute>
                <Pomodoro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id/edit"
            element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <Exams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/new"
            element={
              <ProtectedRoute>
                <ExamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/:id/edit"
            element={
              <ProtectedRoute>
                <ExamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/streaks"
            element={
              <ProtectedRoute>
                <Streaks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-projects"
            element={
              <ProtectedRoute>
                <AcademicProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/extra-activities"
            element={
              <ProtectedRoute>
                <ExtraActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-plans"
            element={
              <ProtectedRoute>
                <StudyPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-plans/new"
            element={
              <ProtectedRoute>
                <StudyPlanForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-plans/:id/edit"
            element={
              <ProtectedRoute>
                <StudyPlanForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summer-vacations"
            element={
              <ProtectedRoute>
                <SummerVacations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summer-vacations/new"
            element={
              <ProtectedRoute>
                <SummerVacationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summer-vacations/:id/edit"
            element={
              <ProtectedRoute>
                <SummerVacationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/new"
            element={
              <ProtectedRoute>
                <NoteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id/edit"
            element={
              <ProtectedRoute>
                <NoteForm />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
          </NotificationProvider>
        </TimerProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
