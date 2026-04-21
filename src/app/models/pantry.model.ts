/**
 * Pantry Feature — Data Models
 * All types are designed to be forward-compatible with cloud sync and family sharing.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Traffic-light status derived from quantity relative to the item's
 * fullQuantity baseline. Thresholds are configurable per-item.
 */
export type PantryStatus = 'ok' | 'low' | 'out' | 'expired';

/**
 * Broad category for grouping pantry items.
 * Values are stable string literals so storage is human-readable.
 */
export type PantryCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'grains'
  | 'legumes'
  | 'nuts-seeds'
  | 'oils-condiments'
  | 'beverages'
  | 'supplements'
  | 'snacks'
  | 'frozen'
  | 'canned'
  | 'spices'
  | 'other';

/** Supported measurement units */
export type PantryUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'L'
  | 'oz'
  | 'lb'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'piece'
  | 'slice'
  | 'serving'
  | 'pack'
  | 'can'
  | 'bottle';

// ─────────────────────────────────────────────────────────────────────────────
// Core item
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single pantry item.
 * `fullQuantity` is the "stocked-up" baseline used for % calculation.
 * `lowThresholdPct` and `outThresholdPct` allow per-item customisation.
 */
export interface PantryItem {
  id: string;
  name: string;
  category: PantryCategory;
  quantity: number;         // Current quantity remaining
  unit: PantryUnit;
  fullQuantity: number;     // Quantity when fully stocked — used for status %
  lowThresholdPct: number;  // Default 50 — below this → 'low'
  outThresholdPct: number;  // Default 10 — below this → 'out'

  // Expiration tracking
  expirationDate?: string;  // ISO date YYYY-MM-DD
  expirationAlertDays: number; // Warn this many days before expiry (default 3)

  // Auto-decrement
  autoDecrementEnabled: boolean;
  /**
   * Amount to subtract when one "serving" of a matched food is logged.
   * E.g. logging "Oats" deducts `decrementAmount` grams of "Oats" from pantry.
   */
  decrementAmount: number;
  /** Aliases used for fuzzy-matching against logged food names */
  matchAliases: string[];

  // Optional nutrition quick-reference
  nutritionPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // Future-proofing
  /** Reserved for cloud sync: device that last wrote this record */
  deviceId?: string;
  /** Reserved for family sharing */
  sharedWith?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Consumption events (audit log)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Immutable record of every time a pantry item was decremented.
 * Enables undo, history view, and future sync conflict resolution.
 */
export interface ConsumptionEvent {
  id: string;
  pantryItemId: string;
  pantryItemName: string;
  amountConsumed: number;
  unit: PantryUnit;
  /** 'auto' = triggered by Diet log; 'manual' = user adjusted slider */
  source: 'auto' | 'manual';
  /** ISO date the food was logged (not necessarily today) */
  loggedDate: string;
  timestamp: number; // Unix ms
}

// ─────────────────────────────────────────────────────────────────────────────
// Grocery list
// ─────────────────────────────────────────────────────────────────────────────

/** One line in a generated grocery list */
export interface GroceryListItem {
  pantryItemId?: string; // null for items not yet in pantry
  name: string;
  neededQuantity: number;
  unit: PantryUnit;
  category: PantryCategory;
  checked: boolean; // User can tick items off in-app
  /** Reason this item is on the list */
  reason: 'out' | 'low' | 'meal-prep' | 'manual';
}

/**
 * A generated grocery list, optionally tied to a meal-prep plan.
 * Lists are persisted so users can revisit and share them later.
 */
export interface GroceryList {
  id: string;
  title: string;
  items: GroceryListItem[];
  createdAt: string;
  sharedAt?: string;
  mealPrepPlanId?: string; // If generated from meal-prep
}

// ─────────────────────────────────────────────────────────────────────────────
// Meal Prep Plan
// ─────────────────────────────────────────────────────────────────────────────

/** One entry in a meal-prep plan: a meal name + number of servings */
export interface MealPrepEntry {
  mealName: string;
  servings: number;
  /** Ingredients required per serving, keyed by pantry item name */
  ingredientsPerServing: { name: string; amount: number; unit: PantryUnit }[];
}

/**
 * A meal-prep plan groups several meals together and can auto-generate
 * a grocery list by comparing required ingredients against pantry stock.
 */
export interface MealPrepPlan {
  id: string;
  title: string;
  entries: MealPrepEntry[];
  scheduledDate?: string; // ISO date — when prep is planned
  groceryListId?: string;  // Linked grocery list after generation
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// View helpers (computed, not persisted)
// ─────────────────────────────────────────────────────────────────────────────

/** Rich view model used by templates — combines item + computed status */
export interface PantryItemView extends PantryItem {
  status: PantryStatus;
  quantityPct: number;  // 0-100
  daysUntilExpiry?: number; // negative = already expired
  isExpiringSoon: boolean;
}

/** Summary passed to the traffic-light header widget */
export interface PantrySummary {
  total: number;
  ok: number;
  low: number;
  out: number;
  expired: number;
  expiringSoon: number;
}
