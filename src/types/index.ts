/**
 * TypeScript types for the application.
 */

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  EDUCATOR = 'educator',
  ADMIN = 'admin',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SessionType {
  STUDY = 'study',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_premium: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  class_id?: number;
  project_id?: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Exam {
  id: number;
  user_id: number;
  class_id?: number;
  title: string;
  description?: string;
  exam_date: string;
  duration_minutes?: number;
  location?: string;
  syllabus_notes?: string;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: number;
  user_id: number;
  term_id?: number;
  name: string;
  code?: string;
  color?: string;
  instructor?: string;
  location?: string;
  description?: string;
  created_at: string;
}

export interface PomodoroSession {
  id: number;
  user_id: number;
  task_id?: number;
  session_type: SessionType;
  duration_minutes: number;
  planned_duration_minutes: number;
  started_at: string;
  ended_at?: string;
  is_completed: boolean;
  notes?: string;
  created_at: string;
}

export interface DashboardData {
  upcoming_classes: Array<{
    id: number;
    name: string;
    code?: string;
    color?: string;
  }>;
  upcoming_tasks: Array<{
    id: number;
    title: string;
    due_date?: string;
    priority: string;
    status: string;
  }>;
  upcoming_exams: Array<{
    id: number;
    title: string;
    exam_date: string;
    location?: string;
  }>;
  overdue_tasks: Array<{
    id: number;
    title: string;
    due_date?: string;
    priority: string;
  }>;
}

export interface AcademicProject {
  id: number;
  user_id: number;
  project_title: string;
  no_of_project: number;
  start_date: string;
  submission_date: string;
  completed_project: boolean;
  upload_area?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtraActivity {
  id: number;
  user_id: number;
  categories: string;
  event_title: string;
  winning_prizes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudyPlan {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  plan_content?: string;
  created_at: string;
  updated_at: string;
}

export interface SummerVacation {
  id: number;
  user_id: number;
  date: string;
  time: string;
  vacation_plan?: string;
  trip_plan?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  date: string;
  time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: number;
  user_id: number;
  current_streak: number;
  last_completion_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StreakHistory {
  id: number;
  user_id: number;
  date: string;
  completed: boolean;
  streak_count: number;
  created_at: string;
}

export interface StreakHistoryList {
  history: StreakHistory[];
  total: number;
  best_streak: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type?: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface DeviceSubscription {
  id: number;
  user_id: number;
  endpoint: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}
