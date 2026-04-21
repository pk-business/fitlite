import {
  Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PantryService } from '../../services/pantry.service';
import { PantryItemView, PantrySummary, PantryCategory, PantryStatus } from '../../models/pantry.model';
import { AddPantryItemModalComponent } from '../add-pantry-item-modal/add-pantry-item-modal.component';
import { GroceryListModalComponent } from '../grocery-list-modal/grocery-list-modal.component';

type FilterTab = 'all' | 'ok' | 'low' | 'out' | 'expired' | 'expiring';

@Component({
  selector: 'app-pantry-home',
  templateUrl: 'pantry-home.component.html',
  styleUrls: ['pantry-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PantryHomeComponent implements OnInit, OnDestroy {
  items: PantryItemView[] = [];
  filteredItems: PantryItemView[] = [];
  summary: PantrySummary = { total: 0, ok: 0, low: 0, out: 0, expired: 0, expiringSoon: 0 };
  activeFilter: FilterTab = 'all';
  searchQuery = '';
  activeCategory: PantryCategory | 'all' = 'all';
  isLoading = true;

  readonly categories: { value: PantryCategory | 'all'; label: string }[] = [
    { value: 'all',            label: 'All' },
    { value: 'produce',        label: '🥦 Produce' },
    { value: 'dairy',          label: '🥛 Dairy' },
    { value: 'meat',           label: '🥩 Meat' },
    { value: 'seafood',        label: '🐟 Seafood' },
    { value: 'grains',         label: '🌾 Grains' },
    { value: 'legumes',        label: '🫘 Legumes' },
    { value: 'nuts-seeds',     label: '🥜 Nuts & Seeds' },
    { value: 'oils-condiments',label: '🫙 Oils' },
    { value: 'beverages',      label: '🧃 Beverages' },
    { value: 'supplements',    label: '💊 Supplements' },
    { value: 'snacks',         label: '🍪 Snacks' },
    { value: 'frozen',         label: '🧊 Frozen' },
    { value: 'canned',         label: '🥫 Canned' },
    { value: 'spices',         label: '🧂 Spices' },
    { value: 'other',          label: '📦 Other' },
  ];

  private destroy$ = new Subject<void>();
  private sortDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressReactiveRefresh = false;

  constructor(
    private pantryService: PantryService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.pantryService.items$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.suppressReactiveRefresh) return;
      this.refresh();
    });
    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.sortDebounceTimer) clearTimeout(this.sortDebounceTimer);
  }

  private refresh(): void {
    this.items   = this.pantryService.getItemViews();
    this.summary = this.pantryService.getSummary();
    this.applyFilters();
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  applyFilters(): void {
    let list = this.items;

    // Status filter tab
    if (this.activeFilter !== 'all') {
      if (this.activeFilter === 'expiring') {
        list = list.filter(i => i.isExpiringSoon && i.status !== 'expired');
      } else {
        list = list.filter(i => i.status === this.activeFilter);
      }
    }

    // Category chip
    if (this.activeCategory !== 'all') {
      list = list.filter(i => i.category === this.activeCategory);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }

    this.filteredItems = list;
    this.cdr.markForCheck();
  }

  setFilter(f: FilterTab): void {
    this.activeFilter = f;
    this.applyFilters();
  }

  setCategory(cat: PantryCategory | 'all'): void {
    this.activeCategory = cat;
    this.applyFilters();
  }

  // ── Modals ───────────────────────────────────────────────────────────────

  async openAddItem(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddPantryItemModalComponent,
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await modal.present();
    await modal.onDidDismiss();
    this.refresh();
  }

  async openEditItem(item: PantryItemView, event: Event): Promise<void> {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: AddPantryItemModalComponent,
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
      componentProps: { existingItem: item },
    });
    await modal.present();
    await modal.onDidDismiss();
    this.refresh();
  }

  async quickAdjust(item: PantryItemView, delta: number, event: Event): Promise<void> {
    event.stopPropagation();
    const newQty = Math.max(0, Math.min(item.fullQuantity, item.quantity + delta));
    if (newQty === item.quantity) return;

    // Suppress the reactive items$ refresh while user is actively stepping
    this.suppressReactiveRefresh = true;

    // Persist to storage
    await this.pantryService.adjustQuantity(item.id, newQty);

    // Update the item in-place so quantity/bar change instantly without re-sorting
    const idx = this.filteredItems.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      const updated = this.pantryService.computeView(
        { ...item, quantity: newQty }
      );
      this.filteredItems = [
        ...this.filteredItems.slice(0, idx),
        updated,
        ...this.filteredItems.slice(idx + 1),
      ];
      this.summary = this.pantryService.getSummary();
      this.cdr.markForCheck();
    }

    // Defer full re-sort until 2.5 s after the last tap
    if (this.sortDebounceTimer) clearTimeout(this.sortDebounceTimer);
    this.sortDebounceTimer = setTimeout(() => {
      this.sortDebounceTimer = null;
      this.suppressReactiveRefresh = false;
      this.refresh();
    }, 2500);
  }

  async openItemActions(item: PantryItemView): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: item.name,
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => this.openEditItem(item, new Event('')),
        },
        {
          text: 'Restock (set to full)',
          icon: 'reload-outline',
          handler: () => this.restockItem(item.id),
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.deleteItem(item),
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  async restockItem(id: string): Promise<void> {
    const item = this.pantryService.getItemById(id);
    if (!item) return;
    await this.pantryService.updateItem(id, { quantity: item.fullQuantity });
    this.refresh();
  }

  async deleteItem(item: PantryItemView): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete Item',
      message: `Remove "${item.name}" from your pantry?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.pantryService.deleteItem(item.id);
            this.refresh();
          },
        },
      ],
    });
    await alert.present();
  }

  async openGroceryList(): Promise<void> {
    const list = await this.pantryService.generateGroceryList(
      `Grocery List – ${new Date().toLocaleDateString()}`,
    );
    const modal = await this.modalCtrl.create({
      component: GroceryListModalComponent,
      componentProps: { list },
    });
    await modal.present();
  }

  // ── View helpers ─────────────────────────────────────────────────────────

  statusColor(status: PantryStatus): string {
    return { ok: 'success', low: 'warning', out: 'danger', expired: 'medium' }[status];
  }

  statusIcon(status: PantryStatus): string {
    return {
      ok:      'checkmark-circle-outline',
      low:     'alert-circle-outline',
      out:     'close-circle-outline',
      expired: 'time-outline',
    }[status];
  }

  expiryLabel(view: PantryItemView): string {
    if (view.daysUntilExpiry === undefined) return '';
    if (view.daysUntilExpiry < 0) return 'Expired';
    if (view.daysUntilExpiry === 0) return 'Expires today';
    if (view.daysUntilExpiry === 1) return 'Expires tomorrow';
    return `Expires in ${view.daysUntilExpiry}d`;
  }

  trackById(_: number, item: PantryItemView): string { return item.id; }
}
