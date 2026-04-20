import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { IonicModule, ActionSheetController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseLogService } from '../services/exercise-log.service';
import { UserProfileService } from '../services/user-profile.service';
import { ExerciseLibraryService } from '../services/exercise-library.service';
import { ProgressService } from '../services/progress.service';
import { ExerciseProgress } from '../models';
import { ProgressGraphComponent } from '../components/progress-graph/progress-graph.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

type MusclePeriod = 'day' | 'week' | 'year';

@Component({
  selector: 'app-progress',
  templateUrl: 'progress.page.html',
  styleUrls: ['progress.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ProgressGraphComponent],
})
export class ProgressPage implements OnInit, OnDestroy {
  isLoading = true;
  hasProfile = false;
  selectedExercise: string | null = null;
  exerciseNames: string[] = [];
  musclePeriod: MusclePeriod = 'week';

  weeklyVolume: { day: string; value: number }[] = [];
  bodyPartData: { part: string; percentage: number; value: number; color: string }[] = [];
  exerciseProgressData: { date: string; maxWeight: number }[] = [];
  selectedExerciseProgress?: ExerciseProgress;
  exerciseBarData: { date: string; logId: string; volume: number; label: string; setCount: number }[] = [];

  activeExerciseSlide = 0;
  maxExerciseBarVolume = 1;
  maxVolume = 1;

  @ViewChild('exerciseSlides') exerciseSlidesRef?: ElementRef<HTMLElement>;

  private allLogs: any[] = [];
  private destroy$ = new Subject<void>();

  // Radar chart constants
  readonly cx = 50;
  readonly cy = 50;
  readonly r = 32;

  private readonly colorMap: Record<string, string> = {
    Chest: '#4fc3f7',
    Back: '#81c784',
    Legs: '#ffb74d',
    Shoulders: '#ce93d8',
    Arms: '#f48fb1',
    Core: '#80cbc4',
    Glutes: '#ffcc02',
    Hamstrings: '#ff7043',
  };

  constructor(
    private userProfileService: UserProfileService,
    private exerciseLogService: ExerciseLogService,
    private exerciseLibraryService: ExerciseLibraryService,
    private progressService: ProgressService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillEnter() {
    const ex = this.route.snapshot.queryParamMap.get('exercise');
    if (ex) {
      this.selectedExercise = ex;
    }
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      const profile = await this.userProfileService.loadProfile();
      this.hasProfile = !!profile;
      if (this.hasProfile) {
        this.allLogs = await this.exerciseLogService.loadLogs();
        const nameSet = new Set<string>();
        this.allLogs.forEach((log: any) => nameSet.add(log.exerciseName));
        this.exerciseNames = Array.from(nameSet).slice(0, 10);
        if (this.exerciseNames.length > 0 && !this.selectedExercise) {
          this.selectedExercise = this.exerciseNames[0];
        } else if (this.selectedExercise && !this.exerciseNames.includes(this.selectedExercise)) {
          // Requested exercise has no logs yet — still show it selected
          this.exerciseNames = [this.selectedExercise, ...this.exerciseNames];
        }
        this.computeWeeklyVolume();
        this.computeBodyPartData();
        this.computeExerciseProgress();
        this.computeExerciseBarData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onMusclePeriodChange() {
    this.computeBodyPartData();
    this.cdr.detectChanges();
  }

  onExerciseChange(name: string) {
    this.selectedExercise = name;
    this.computeExerciseProgress();
    this.computeExerciseBarData();
    this.activeExerciseSlide = 0;
    this.cdr.detectChanges();
  }

  // ── Data Computation ────────────────────────────────────────────────────

  private computeWeeklyVolume() {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result: { day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = this.allLogs.filter((log: any) => log.date === dateStr);
      const volume = dayLogs.reduce((sum: number, log: any) =>
        sum + log.sets.reduce((s: number, set: any) =>
          s + (set.completed ? (set.weight || 0) * set.reps : 0), 0), 0);
      result.push({ day: dayLabels[d.getDay()], value: Math.round(volume) });
    }
    this.weeklyVolume = result;
    this.maxVolume = Math.max(...result.map(r => r.value), 1);
  }

  private computeBodyPartData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let cutoff: string;
    if (this.musclePeriod === 'day') {
      cutoff = todayStr;
    } else if (this.musclePeriod === 'week') {
      const d = new Date(today); d.setDate(today.getDate() - 7);
      cutoff = d.toISOString().split('T')[0];
    } else {
      const d = new Date(today); d.setFullYear(today.getFullYear() - 1);
      cutoff = d.toISOString().split('T')[0];
    }

    const filteredLogs = this.musclePeriod === 'day'
      ? this.allLogs.filter((l: any) => l.date === todayStr)
      : this.allLogs.filter((l: any) => l.date >= cutoff);

    const muscleCounts: Record<string, number> = {};
    filteredLogs.forEach((log: any) => {
      const ex = this.exerciseLibraryService.findExerciseByName(log.exerciseName);
      const muscle = ex?.primaryMuscle;
      if (!muscle || muscle === 'Custom') return;
      const sets = log.sets.filter((s: any) => s.completed).length || 1;
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + sets;
    });

    const total = Object.values(muscleCounts).reduce((a, b) => a + b, 0);
    this.bodyPartData = Object.entries(muscleCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([part, count]) => ({
        part,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.colorMap[part] || '#aaaaaa',
      }));
  }

  private computeExerciseProgress() {
    if (!this.selectedExercise) {
      this.exerciseProgressData = [];
      this.selectedExerciseProgress = undefined;
      return;
    }
    const data = this.exerciseLogService.getProgressData(this.selectedExercise, 30);
    this.exerciseProgressData = data.map(d => ({ date: d.date, maxWeight: d.maxWeight }));
    this.selectedExerciseProgress = this.progressService.getExerciseProgress(this.selectedExercise);
  }

  getBarHeight(value: number): number {
    return Math.round((value / this.maxVolume) * 100);
  }

  getSessionBarHeight(value: number): number {
    return Math.round((value / this.maxExerciseBarVolume) * 100);
  }

  private computeExerciseBarData() {
    if (!this.selectedExercise) { this.exerciseBarData = []; return; }
    const logs = this.allLogs
      .filter((l: any) => l.exerciseName === this.selectedExercise)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(-12);
    this.exerciseBarData = logs.map((log: any) => {
      const volume = log.sets.reduce((s: number, set: any) =>
        s + (set.completed ? (set.weight || 0) * (set.reps || 1) : 0), 0);
      return {
        date: log.date,
        logId: log.id,
        volume: Math.round(volume),
        label: this.formatDate(log.date),
        setCount: log.sets.filter((s: any) => s.completed).length,
      };
    });
    this.maxExerciseBarVolume = Math.max(...this.exerciseBarData.map(d => d.volume), 1);
  }

  onExerciseChartScroll(event: Event) {
    const el = event.target as HTMLElement;
    const slide = el.scrollLeft > el.clientWidth * 0.4 ? 1 : 0;
    if (slide !== this.activeExerciseSlide) {
      this.activeExerciseSlide = slide;
      this.cdr.markForCheck();
    }
  }

  scrollToExerciseSlide(index: number) {
    const el = this.exerciseSlidesRef?.nativeElement;
    if (el) {
      el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
      this.activeExerciseSlide = index;
      this.cdr.markForCheck();
    }
  }

  async onBarTap(item: { date: string; logId: string; volume: number; setCount: number }) {
    const log = this.allLogs.find((l: any) => l.id === item.logId);
    if (!log) return;
    const sets: any[] = log.sets;
    const setLines = sets.map((s: any) => {
      if (s.durationMinutes != null) {
        return `Set ${s.setNumber}: ${s.durationMinutes}min${s.distanceKm ? ' · ' + s.distanceKm + 'km' : ''}`;
      }
      return `Set ${s.setNumber}: ${s.weight ?? 0}kg × ${s.reps}`;
    }).join('  |  ');
    const sheet = await this.actionSheetCtrl.create({
      header: log.exerciseName,
      subHeader: `${log.date}  —  ${setLines}`,
      buttons: [
        { text: 'Edit sets', icon: 'create-outline', handler: () => { this.editSession(log); } },
        { text: 'Delete this session', icon: 'trash-outline', role: 'destructive', handler: () => { this.deleteSession(log.id); } },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  async editSession(log: any) {
    const sets: any[] = log.sets;
    const inputs: any[] = [];
    sets.forEach((s: any, i: number) => {
      if (s.durationMinutes != null) {
        inputs.push({ name: `dur_${i}`, type: 'number', label: `Set ${s.setNumber} — Duration (min)`, value: s.durationMinutes, min: 0 });
        inputs.push({ name: `dist_${i}`, type: 'number', label: `Set ${s.setNumber} — Distance (km)`, value: s.distanceKm ?? 0, min: 0 });
      } else {
        inputs.push({ name: `wt_${i}`, type: 'number', label: `Set ${s.setNumber} — Weight (kg)`, value: s.weight ?? 0, min: 0 });
        inputs.push({ name: `reps_${i}`, type: 'number', label: `Set ${s.setNumber} — Reps`, value: s.reps, min: 0 });
      }
    });
    const alert = await this.alertCtrl.create({
      header: 'Edit Session',
      subHeader: `${log.exerciseName} — ${log.date}`,
      inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            const updatedSets = sets.map((s: any, i: number) => {
              if (s.durationMinutes != null) {
                return { ...s, durationMinutes: parseFloat(data[`dur_${i}`]) || s.durationMinutes, distanceKm: parseFloat(data[`dist_${i}`]) || s.distanceKm };
              }
              return { ...s, weight: parseFloat(data[`wt_${i}`]) || 0, reps: parseInt(data[`reps_${i}`], 10) || s.reps };
            });
            await this.exerciseLogService.updateLog(log.id, { sets: updatedSets });
            await this.loadData();
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteSession(logId: string) {
    const confirm = await this.alertCtrl.create({
      header: 'Delete Session',
      message: 'Are you sure? This logged session will be permanently removed.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.exerciseLogService.deleteLog(logId);
            await this.loadData();
          },
        },
      ],
    });
    await confirm.present();
  }

  // ── Radar Chart ─────────────────────────────────────────────────────────

  get radarLabels(): string[] {
    const defaults = ['Chest', 'Shoulders', 'Arms', 'Core', 'Back', 'Legs'];
    const extras = this.bodyPartData.map(d => d.part).filter(p => !defaults.includes(p));
    return [...defaults, ...extras];
  }

  private radarPoint(index: number, fraction: number): { x: number; y: number } {
    const n = this.radarLabels.length;
    const angle = (index * 2 * Math.PI / n) - Math.PI / 2;
    return {
      x: parseFloat((this.cx + this.r * fraction * Math.cos(angle)).toFixed(2)),
      y: parseFloat((this.cy + this.r * fraction * Math.sin(angle)).toFixed(2)),
    };
  }

  getRadarAxes(): { x1: number; y1: number; x2: number; y2: number }[] {
    return this.radarLabels.map((_, i) => {
      const p = this.radarPoint(i, 1);
      return { x1: this.cx, y1: this.cy, x2: p.x, y2: p.y };
    });
  }

  getGridPolygon(fraction: number): string {
    return this.radarLabels.map((_, i) => {
      const p = this.radarPoint(i, fraction);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  getRadarPolygon(): string {
    const maxVal = Math.max(...this.bodyPartData.map(d => d.value), 1);
    return this.radarLabels.map((label, i) => {
      const item = this.bodyPartData.find(d => d.part === label);
      const fraction = item ? item.value / maxVal : 0;
      const p = this.radarPoint(i, fraction);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  getLabelPos(index: number): { x: number; y: number; anchor: string } {
    const n = this.radarLabels.length;
    const angle = (index * 2 * Math.PI / n) - Math.PI / 2;
    const dist = this.r + 11;
    const x = parseFloat((this.cx + dist * Math.cos(angle)).toFixed(1));
    const y = parseFloat((this.cy + dist * Math.sin(angle)).toFixed(1));
    const anchor = x < this.cx - 2 ? 'end' : x > this.cx + 2 ? 'start' : 'middle';
    return { x, y, anchor };
  }

  getLabelColor(label: string): string {
    const item = this.bodyPartData.find(d => d.part === label);
    return item ? item.color : '#999';
  }

  // ── Exercise Progress SVG ───────────────────────────────────────────────

  getProgressSvgPath(): string {
    const data = this.exerciseProgressData;
    if (data.length < 2) return '';
    const w = 280, h = 80;
    const maxW = Math.max(...data.map(d => d.maxWeight), 1);
    const minW = Math.min(...data.map(d => d.maxWeight));
    const range = maxW - minW || 1;
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.maxWeight - minW) / range) * (h - 16) - 8;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return 'M ' + pts.join(' L ');
  }

  getProgressPoints(): { x: number; y: number; weight: number }[] {
    const data = this.exerciseProgressData;
    if (!data.length) return [];
    const w = 280, h = 80;
    const maxW = Math.max(...data.map(d => d.maxWeight), 1);
    const minW = Math.min(...data.map(d => d.maxWeight));
    const range = maxW - minW || 1;
    return data.map((d, i) => ({
      x: parseFloat(((i / (data.length - 1 || 1)) * w).toFixed(1)),
      y: parseFloat((h - ((d.maxWeight - minW) / range) * (h - 16) - 8).toFixed(1)),
      weight: d.maxWeight,
    }));
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
}
