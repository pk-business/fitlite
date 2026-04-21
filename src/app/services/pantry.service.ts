import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  PantryItem,
  PantryItemView,
  PantrySummary,
  PantryStatus,
  PantryUnit,
  PantryCategory,
  ConsumptionEvent,
  GroceryList,
  GroceryListItem,
  MealPrepPlan,
  MealPrepEntry,
} from '../models/pantry.model';
import { StorageService } from './storage.service';

const PANTRY_ITEMS_KEY      = 'pantry_items';
const PANTRY_EVENTS_KEY     = 'pantry_consumption_events';
const PANTRY_GROCERY_KEY    = 'pantry_grocery_lists';
const PANTRY_MEAL_PREP_KEY  = 'pantry_meal_prep_plans';

@Injectable({ providedIn: 'root' })
export class PantryService {

  private itemsSubject  = new BehaviorSubject<PantryItem[]>([]);
  private eventsSubject = new BehaviorSubject<ConsumptionEvent[]>([]);

  /** Reactive stream of raw pantry items (sorted A→Z within category) */
  readonly items$: Observable<PantryItem[]> = this.itemsSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadAll();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bootstrap
  // ─────────────────────────────────────────────────────────────────────────

  async loadAll(): Promise<void> {
    const [items, events] = await Promise.all([
      this.storage.get<PantryItem[]>(PANTRY_ITEMS_KEY),
      this.storage.get<ConsumptionEvent[]>(PANTRY_EVENTS_KEY),
    ]);
    this.itemsSubject.next(items ?? []);
    this.eventsSubject.next(events ?? []);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD — Pantry Items
  // ─────────────────────────────────────────────────────────────────────────

  async addItem(draft: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PantryItem> {
    const now = new Date().toISOString();
    const item: PantryItem = {
      ...draft,
      id: this.uid(),
      createdAt: now,
      updatedAt: now,
    };
    const items = [item, ...this.itemsSubject.value];
    await this.persist(PANTRY_ITEMS_KEY, items);
    this.itemsSubject.next(items);
    return item;
  }

  async updateItem(id: string, patch: Partial<PantryItem>): Promise<PantryItem | null> {
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
    await this.persist(PANTRY_ITEMS_KEY, items);
    this.itemsSubject.next(items);
    return items[idx];
  }

  async deleteItem(id: string): Promise<void> {
    const items = this.itemsSubject.value.filter(i => i.id !== id);
    await this.persist(PANTRY_ITEMS_KEY, items);
    this.itemsSubject.next(items);
  }

  getItemById(id: string): PantryItem | undefined {
    return this.itemsSubject.value.find(i => i.id === id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status Calculation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Derives PantryStatus from quantity % and expiry date.
   * Expiry always wins — an expired item is 'expired' regardless of quantity.
   */
  computeStatus(item: PantryItem): PantryStatus {
    if (item.expirationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(item.expirationDate) < today) return 'expired';
    }
    const pct = item.fullQuantity > 0
      ? (item.quantity / item.fullQuantity) * 100
      : 0;
    if (pct <= item.outThresholdPct) return 'out';
    if (pct <= item.lowThresholdPct) return 'low';
    return 'ok';
  }

  computeView(item: PantryItem): PantryItemView {
    const status   = this.computeStatus(item);
    const quantityPct = item.fullQuantity > 0
      ? Math.round((item.quantity / item.fullQuantity) * 100)
      : 0;

    let daysUntilExpiry: number | undefined;
    let isExpiringSoon = false;
    if (item.expirationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(item.expirationDate);
      daysUntilExpiry = Math.floor((exp.getTime() - today.getTime()) / 86_400_000);
      isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= item.expirationAlertDays;
    }

    return { ...item, status, quantityPct, daysUntilExpiry, isExpiringSoon };
  }

  /** Compute all view models, sorted by status urgency then name */
  getItemViews(): PantryItemView[] {
    const priority: Record<PantryStatus, number> = { expired: 0, out: 1, low: 2, ok: 3 };
    return this.itemsSubject.value
      .map(i => this.computeView(i))
      .sort((a, b) => priority[a.status] - priority[b.status] || a.name.localeCompare(b.name));
  }

  getSummary(): PantrySummary {
    const views = this.getItemViews();
    return {
      total:       views.length,
      ok:          views.filter(v => v.status === 'ok').length,
      low:         views.filter(v => v.status === 'low').length,
      out:         views.filter(v => v.status === 'out').length,
      expired:     views.filter(v => v.status === 'expired').length,
      expiringSoon: views.filter(v => v.isExpiringSoon && v.status !== 'expired').length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-Decrement
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called by NutritionTrackingService when the user logs food.
   * Fuzzy-matches `foodName` against pantry item names and aliases.
   * Decrements the first match by `amountConsumed` (or item.decrementAmount).
   */
  async handleFoodLogged(foodName: string, amountConsumed?: number, date?: string): Promise<PantryItem | null> {
    const needle = foodName.toLowerCase().trim();
    const match = this.itemsSubject.value.find(item => {
      if (!item.autoDecrementEnabled) return false;
      const names = [item.name, ...item.matchAliases].map(n => n.toLowerCase());
      return names.some(n => n === needle || n.includes(needle) || needle.includes(n));
    });

    if (!match) return null;

    const decrement = amountConsumed ?? match.decrementAmount;
    const newQty = Math.max(0, match.quantity - decrement);

    const updated = await this.updateItem(match.id, { quantity: newQty });

    // Record consumption event
    const event: ConsumptionEvent = {
      id: this.uid(),
      pantryItemId: match.id,
      pantryItemName: match.name,
      amountConsumed: decrement,
      unit: match.unit,
      source: 'auto',
      loggedDate: date ?? new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };
    const events = [event, ...this.eventsSubject.value];
    await this.persist(PANTRY_EVENTS_KEY, events);
    this.eventsSubject.next(events);

    return updated;
  }

  /**
   * Manual quantity adjustment with audit trail.
   */
  async adjustQuantity(id: string, newQuantity: number): Promise<PantryItem | null> {
    const item = this.getItemById(id);
    if (!item) return null;

    const diff = item.quantity - newQuantity;
    const updated = await this.updateItem(id, { quantity: Math.max(0, newQuantity) });

    if (diff !== 0) {
      const event: ConsumptionEvent = {
        id: this.uid(),
        pantryItemId: id,
        pantryItemName: item.name,
        amountConsumed: diff,
        unit: item.unit,
        source: 'manual',
        loggedDate: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      };
      const events = [event, ...this.eventsSubject.value];
      await this.persist(PANTRY_EVENTS_KEY, events);
      this.eventsSubject.next(events);
    }

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Grocery List Generation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate a grocery list from items that are 'out' or 'low',
   * optionally augmented with meal-prep requirements.
   */
  async generateGroceryList(title: string, mealPrepPlan?: MealPrepPlan): Promise<GroceryList> {
    const itemMap = new Map<string, GroceryListItem>();

    // 1. Out / low items
    for (const view of this.getItemViews()) {
      if (view.status === 'out' || view.status === 'low' || view.status === 'expired') {
        const needed = view.fullQuantity - view.quantity;
        itemMap.set(view.id, {
          pantryItemId: view.id,
          name: view.name,
          neededQuantity: Math.max(0, needed),
          unit: view.unit,
          category: view.category,
          checked: false,
          reason: view.status === 'out' ? 'out' : 'low',
        });
      }
    }

    // 2. Meal-prep requirements
    if (mealPrepPlan) {
      for (const entry of mealPrepPlan.entries) {
        for (const ing of entry.ingredientsPerServing) {
          const totalRequired = ing.amount * entry.servings;
          const pantryItem = this.itemsSubject.value.find(
            i => i.name.toLowerCase() === ing.name.toLowerCase(),
          );

          if (!pantryItem) {
            // Not in pantry at all — add as manual entry
            const key = `meal_${ing.name}`;
            const existing = itemMap.get(key);
            itemMap.set(key, {
              name: ing.name,
              neededQuantity: (existing?.neededQuantity ?? 0) + totalRequired,
              unit: ing.unit,
              category: 'other',
              checked: false,
              reason: 'meal-prep',
            });
          } else {
            const shortfall = totalRequired - pantryItem.quantity;
            if (shortfall > 0) {
              const existing = itemMap.get(pantryItem.id);
              itemMap.set(pantryItem.id, {
                pantryItemId: pantryItem.id,
                name: pantryItem.name,
                neededQuantity: (existing?.neededQuantity ?? 0) + shortfall,
                unit: pantryItem.unit,
                category: pantryItem.category,
                checked: false,
                reason: 'meal-prep',
              });
            }
          }
        }
      }
    }

    const list: GroceryList = {
      id: this.uid(),
      title,
      items: Array.from(itemMap.values()).sort((a, b) => a.category.localeCompare(b.category)),
      createdAt: new Date().toISOString(),
      mealPrepPlanId: mealPrepPlan?.id,
    };

    // Persist
    const lists = await this.storage.get<GroceryList[]>(PANTRY_GROCERY_KEY) ?? [];
    await this.persist(PANTRY_GROCERY_KEY, [list, ...lists]);

    return list;
  }

  /** Toggle checked state of a grocery list item and persist */
  async toggleGroceryItem(listId: string, itemName: string): Promise<void> {
    const lists = await this.storage.get<GroceryList[]>(PANTRY_GROCERY_KEY) ?? [];
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    const item = list.items.find(i => i.name === itemName);
    if (item) item.checked = !item.checked;
    await this.persist(PANTRY_GROCERY_KEY, lists);
  }

  async getGroceryLists(): Promise<GroceryList[]> {
    return (await this.storage.get<GroceryList[]>(PANTRY_GROCERY_KEY)) ?? [];
  }

  async getGroceryListById(id: string): Promise<GroceryList | undefined> {
    const lists = await this.getGroceryLists();
    return lists.find(l => l.id === id);
  }

  /**
   * Build a plain-text representation of a grocery list for sharing.
   */
  formatGroceryListText(list: GroceryList, includeAppLink = true): string {
    const lines: string[] = [`🛒 ${list.title}`, ''];
    let lastCategory = '';
    for (const item of list.items) {
      if (item.category !== lastCategory) {
        lines.push(`── ${item.category.toUpperCase()} ──`);
        lastCategory = item.category;
      }
      const tick = item.checked ? '✅' : '⬜';
      lines.push(`${tick} ${item.name}  ${item.neededQuantity} ${item.unit}`);
    }
    if (includeAppLink) {
      lines.push('', '📲 Tracked with FitLite');
    }
    return lines.join('\n');
  }

  /**
   * Trigger the native Web Share API (works on iOS Safari & Android Chrome).
   * Falls back to clipboard copy if Share API is unavailable.
   */
  async shareGroceryList(list: GroceryList): Promise<void> {
    const text = this.formatGroceryListText(list);
    if (navigator.share) {
      await navigator.share({ title: list.title, text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Expiration Alerts
  // ─────────────────────────────────────────────────────────────────────────

  /** Returns items that are already expired or expiring within their alert window */
  getExpiringItems(): PantryItemView[] {
    return this.getItemViews().filter(v => v.status === 'expired' || v.isExpiringSoon);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Meal Prep Plans CRUD
  // ─────────────────────────────────────────────────────────────────────────

  async getMealPrepPlans(): Promise<MealPrepPlan[]> {
    return (await this.storage.get<MealPrepPlan[]>(PANTRY_MEAL_PREP_KEY)) ?? [];
  }

  async saveMealPrepPlan(plan: Omit<MealPrepPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MealPrepPlan> {
    const now = new Date().toISOString();
    const saved: MealPrepPlan = { ...plan, id: this.uid(), createdAt: now, updatedAt: now };
    const plans = await this.getMealPrepPlans();
    await this.persist(PANTRY_MEAL_PREP_KEY, [saved, ...plans]);
    return saved;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  private uid(): string {
    return `pantry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private async persist(key: string, value: unknown): Promise<void> {
    await this.storage.set(key, value);
  }

  /** Default values for new items so callers only need to specify name+qty */
  static defaultItem(): Omit<PantryItem, 'id' | 'name' | 'quantity' | 'fullQuantity' | 'createdAt' | 'updatedAt'> {
    return {
      category:              'other',
      unit:                  'piece',
      lowThresholdPct:       50,
      outThresholdPct:       10,
      expirationAlertDays:   3,
      autoDecrementEnabled:  false,
      decrementAmount:       1,
      matchAliases:          [],
    };
  }
}
