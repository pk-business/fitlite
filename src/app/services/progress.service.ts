import { Injectable } from '@angular/core';
import { ExerciseLog, ExerciseProgress, ProgressDataPoint, PersonalRecord } from '../models';
import { ExerciseLogService } from './exercise-log.service';

/**
 * ProgressService calculates and provides exercise progress metrics
 * Analyzes historical workout data to show trends and insights
 */
@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  constructor(private exerciseLogService: ExerciseLogService) {}

  /**
   * Get progress data for a specific exercise
   * @param exerciseName Name of the exercise
   * @param daysBack Number of days to look back (default: 90)
   */
  getExerciseProgress(exerciseName: string, daysBack: number = 90): ExerciseProgress {
    const logs = this.exerciseLogService.getLogsForExercise(exerciseName);
    
    // Filter logs within the time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffTimestamp = cutoffDate.getTime();
    
    const relevantLogs = logs.filter(log => log.timestamp >= cutoffTimestamp);
    
    // Convert logs to data points — sort chronologically (oldest first) so the
    // graph draws left→right in time and percent-change is calculated correctly.
    const dataPoints = relevantLogs
      .map(log => this.logToDataPoint(log))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate trend
    const trend = this.calculateTrend(dataPoints);
    
    // Calculate percent change
    const percentChange = this.calculatePercentChange(dataPoints);
    
    // Generate insight
    const insight = this.generateInsight(dataPoints, percentChange);
    
    // Find personal record
    const personalRecord = this.findPersonalRecord(logs);
    
    return {
      exerciseName,
      dataPoints,
      trend,
      percentChange,
      insight,
      personalRecord
    };
  }

  /**
   * Convert an exercise log to a progress data point
   */
  private logToDataPoint(log: ExerciseLog): ProgressDataPoint {
    const completedSets = log.sets.filter(set => set.completed);
    
    if (completedSets.length === 0) {
      return {
        date: log.date,
        timestamp: log.timestamp,
        maxWeight: 0,
        maxReps: 0,
        totalVolume: 0,
        averageWeight: 0,
        averageReps: 0
      };
    }

    const weights = completedSets.map(set => set.weight || 0);
    const reps = completedSets.map(set => set.reps);
    
    const maxWeight = Math.max(...weights);
    const maxReps = Math.max(...reps);
    const totalVolume = completedSets.reduce((sum, set) => sum + (set.weight || 0) * set.reps, 0);
    const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const averageReps = reps.reduce((sum, r) => sum + r, 0) / reps.length;

    return {
      date: log.date,
      timestamp: log.timestamp,
      maxWeight,
      maxReps,
      totalVolume,
      averageWeight,
      averageReps
    };
  }

  /**
   * Calculate trend from data points
   */
  private calculateTrend(dataPoints: ProgressDataPoint[]): 'improving' | 'maintaining' | 'declining' | 'insufficient-data' {
    if (dataPoints.length < 3) {
      return 'insufficient-data';
    }

    // Compare first third to last third
    const thirdSize = Math.floor(dataPoints.length / 3);
    const firstThird = dataPoints.slice(0, thirdSize);
    const lastThird = dataPoints.slice(-thirdSize);

    const firstAvgVolume = firstThird.reduce((sum, dp) => sum + dp.totalVolume, 0) / firstThird.length;
    const lastAvgVolume = lastThird.reduce((sum, dp) => sum + dp.totalVolume, 0) / lastThird.length;

    const percentDiff = ((lastAvgVolume - firstAvgVolume) / firstAvgVolume) * 100;

    if (percentDiff > 5) return 'improving';
    if (percentDiff < -5) return 'declining';
    return 'maintaining';
  }

  /**
   * Calculate percentage change over the period
   */
  private calculatePercentChange(dataPoints: ProgressDataPoint[]): number {
    if (dataPoints.length < 2) {
      return 0;
    }

    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];

    if (first.totalVolume === 0) {
      return last.totalVolume > 0 ? 100 : 0;
    }

    return ((last.totalVolume - first.totalVolume) / first.totalVolume) * 100;
  }

  /**
   * Generate a human-readable insight
   */
  private generateInsight(dataPoints: ProgressDataPoint[], percentChange: number): string {
    if (dataPoints.length < 2) {
      return 'Start logging to track progress';
    }

    const absChange = Math.abs(percentChange);
    const direction = percentChange > 0 ? 'Up' : 'Down';

    if (absChange < 5) {
      return 'Maintaining steady performance';
    }

    // Check time period
    const daysDiff = this.getDaysDifference(dataPoints[0].date, dataPoints[dataPoints.length - 1].date);
    let period = 'recently';
    if (daysDiff > 60) period = 'over the past 3 months';
    else if (daysDiff > 30) period = 'this month';
    else if (daysDiff > 7) period = 'this month';
    else period = 'this week';

    return `${direction} ${absChange.toFixed(0)}% ${period}`;
  }

  /**
   * Find personal record from all logs
   */
  private findPersonalRecord(logs: ExerciseLog[]): PersonalRecord | null {
    if (logs.length === 0) return null;

    let bestLog: ExerciseLog | null = null;
    let bestSet: { weight: number; reps: number } | null = null;
    let bestScore = 0;

    for (const log of logs) {
      for (const set of log.sets) {
        if (!set.completed) continue;
        
        // Calculate score (weight × reps)
        const score = (set.weight || 0) * set.reps;
        
        if (score > bestScore) {
          bestScore = score;
          bestLog = log;
          bestSet = { weight: set.weight || 0, reps: set.reps };
        }
      }
    }

    if (!bestLog || !bestSet) return null;

    const daysAgo = this.getDaysDifference(bestLog.date, new Date().toISOString().split('T')[0]);

    return {
      weight: bestSet.weight,
      reps: bestSet.reps,
      date: bestLog.date,
      daysAgo
    };
  }

  /**
   * Calculate days between two date strings
   */
  private getDaysDifference(dateStr1: string, dateStr2: string): number {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get sparkline data (simplified for visualization)
   * Returns array of normalized values (0-100) for the last N sessions
   */
  getSparklineData(exerciseName: string, maxPoints: number = 10): number[] {
    const progress = this.getExerciseProgress(exerciseName, 90);
    const dataPoints = progress.dataPoints.slice(-maxPoints);

    if (dataPoints.length === 0) return [];

    // Normalize to 0-100 scale
    const volumes = dataPoints.map(dp => dp.totalVolume);
    const min = Math.min(...volumes);
    const max = Math.max(...volumes);
    const range = max - min;

    if (range === 0) {
      return dataPoints.map(() => 50); // All same, show middle
    }

    return volumes.map(v => ((v - min) / range) * 100);
  }

  /**
   * Get color for trend
   */
  getTrendColor(trend: 'improving' | 'maintaining' | 'declining' | 'insufficient-data'): string {
    const colors = {
      'improving': 'success',
      'maintaining': 'warning',
      'declining': 'danger',
      'insufficient-data': 'medium'
    };
    return colors[trend];
  }

  /**
   * Get icon for trend
   */
  getTrendIcon(trend: 'improving' | 'maintaining' | 'declining' | 'insufficient-data'): string {
    const icons = {
      'improving': 'trending-up',
      'maintaining': 'remove',
      'declining': 'trending-down',
      'insufficient-data': 'help-circle'
    };
    return icons[trend];
  }
}
