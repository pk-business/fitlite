import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExerciseLog, SetLog, ExerciseLogSummary } from '../models';
import { StorageService } from './storage.service';

const EXERCISE_LOGS_KEY = 'exercise_logs';

/**
 * ExerciseLogService manages workout logs
 * Tracks actual performance: weights, reps, notes for each exercise
 */
@Injectable({
  providedIn: 'root'
})
export class ExerciseLogService {
  private logsSubject = new BehaviorSubject<ExerciseLog[]>([]);
  public logs$: Observable<ExerciseLog[]> = this.logsSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadLogs();
  }

  /**
   * Load all exercise logs from storage
   */
  async loadLogs(): Promise<ExerciseLog[]> {
    try {
      const logs = await this.storage.get<ExerciseLog[]>(EXERCISE_LOGS_KEY) || [];
      // Sort by timestamp descending (most recent first)
      logs.sort((a, b) => b.timestamp - a.timestamp);
      this.logsSubject.next(logs);
      return logs;
    } catch (error) {
      console.error('Error loading exercise logs:', error);
      return [];
    }
  }

  /**
   * Get all logs
   */
  getAllLogs(): ExerciseLog[] {
    return this.logsSubject.value;
  }

  /**
   * Get log by ID
   */
  getLogById(id: string): ExerciseLog | undefined {
    return this.logsSubject.value.find(log => log.id === id);
  }

  /**
   * Get logs for a specific exercise
   */
  getLogsForExercise(exerciseName: string): ExerciseLog[] {
    return this.logsSubject.value.filter(log => 
      log.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );
  }

  /**
   * Get logs for a specific date
   */
  getLogsForDate(date: string): ExerciseLog[] {
    return this.logsSubject.value.filter(log => log.date === date);
  }

  /**
   * Get logs for today
   */
  getTodaysLogs(): ExerciseLog[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getLogsForDate(today);
  }

  /**
   * Get most recent log for an exercise
   */
  getLastLogForExercise(exerciseName: string): ExerciseLog | null {
    const logs = this.getLogsForExercise(exerciseName);
    return logs.length > 0 ? logs[0] : null; // Already sorted by timestamp
  }

  /**
   * Add a new exercise log
   */
  async addLog(log: Omit<ExerciseLog, 'id' | 'timestamp'>): Promise<ExerciseLog> {
    try {
      const newLog: ExerciseLog = {
        ...log,
        id: this.generateId(),
        timestamp: Date.now()
      };

      const logs = [newLog, ...this.logsSubject.value];
      await this.storage.set(EXERCISE_LOGS_KEY, logs);
      this.logsSubject.next(logs);

      return newLog;
    } catch (error) {
      console.error('Error adding exercise log:', error);
      throw error;
    }
  }

  /**
   * Update an existing log
   */
  async updateLog(id: string, updates: Partial<ExerciseLog>): Promise<ExerciseLog | null> {
    try {
      const logs = this.logsSubject.value;
      const index = logs.findIndex(log => log.id === id);

      if (index === -1) {
        console.error('Log not found:', id);
        return null;
      }

      logs[index] = { ...logs[index], ...updates };
      await this.storage.set(EXERCISE_LOGS_KEY, logs);
      this.logsSubject.next([...logs]);

      return logs[index];
    } catch (error) {
      console.error('Error updating exercise log:', error);
      throw error;
    }
  }

  /**
   * Delete a log
   */
  async deleteLog(id: string): Promise<boolean> {
    try {
      const logs = this.logsSubject.value.filter(log => log.id !== id);
      await this.storage.set(EXERCISE_LOGS_KEY, logs);
      this.logsSubject.next(logs);
      return true;
    } catch (error) {
      console.error('Error deleting exercise log:', error);
      return false;
    }
  }

  /**
   * Delete all logs
   */
  async deleteAllLogs(): Promise<void> {
    try {
      await this.storage.remove(EXERCISE_LOGS_KEY);
      this.logsSubject.next([]);
    } catch (error) {
      console.error('Error deleting all logs:', error);
      throw error;
    }
  }

  /**
   * Get summary for an exercise
   */
  getExerciseSummary(exerciseName: string): ExerciseLogSummary {
    const logs = this.getLogsForExercise(exerciseName);
    
    if (logs.length === 0) {
      return {
        exerciseName,
        totalSessions: 0
      };
    }

    // Find best set (highest weight × reps)
    let bestSet: SetLog | undefined;
    let bestScore = 0;

    logs.forEach(log => {
      log.sets.forEach(set => {
        if (set.completed) {
          const score = (set.weight || 0) * set.reps;
          if (score > bestScore) {
            bestScore = score;
            bestSet = set;
          }
        }
      });
    });

    return {
      exerciseName,
      lastPerformed: logs[0].date,
      totalSessions: logs.length,
      bestSet
    };
  }

  /**
   * Check if exercise was logged today
   */
  isLoggedToday(exerciseName: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.logsSubject.value.some(log => 
      log.date === today && 
      log.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get progress data for charts (last 30 days)
   */
  getProgressData(exerciseName: string, days: number = 30): { date: string; maxWeight: number; totalVolume: number }[] {
    const logs = this.getLogsForExercise(exerciseName);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentLogs = logs.filter(log => new Date(log.date) >= cutoffDate);
    
    return recentLogs.map(log => {
      const maxWeight = Math.max(...log.sets.map(s => s.weight || 0));
      const totalVolume = log.sets.reduce((sum, s) => sum + (s.weight || 0) * s.reps, 0);
      
      return {
        date: log.date,
        maxWeight,
        totalVolume
      };
    }).reverse(); // Chronological order
  }
}
