import {
  Component, Input, OnInit, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PantryService } from '../../services/pantry.service';
import { PantryItem, PantryCategory, PantryUnit } from '../../models/pantry.model';

@Component({
  selector: 'app-add-pantry-item-modal',
  templateUrl: 'add-pantry-item-modal.component.html',
  styleUrls: ['add-pantry-item-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AddPantryItemModalComponent implements OnInit {
  /** Pass an existing item to switch to edit mode */
  @Input() existingItem?: PantryItem;

  isEditMode = false;
  isSaving = false;

  // Form fields
  name = '';
  category: PantryCategory = 'other';
  quantity = 1;
  fullQuantity = 10;
  unit: PantryUnit = 'piece';
  expirationDate = '';
  expirationAlertDays = 3;
  lowThresholdPct = 50;
  outThresholdPct = 10;
  autoDecrementEnabled = false;
  decrementAmount = 1;
  matchAliases = ''; // comma-separated input
  notes = '';

  readonly categories: { value: PantryCategory; label: string }[] = [
    { value: 'produce',         label: '🥦 Produce' },
    { value: 'dairy',           label: '🥛 Dairy' },
    { value: 'meat',            label: '🥩 Meat' },
    { value: 'seafood',         label: '🐟 Seafood' },
    { value: 'grains',          label: '🌾 Grains' },
    { value: 'legumes',         label: '🫘 Legumes' },
    { value: 'nuts-seeds',      label: '🥜 Nuts & Seeds' },
    { value: 'oils-condiments', label: '🫙 Oils & Condiments' },
    { value: 'beverages',       label: '🧃 Beverages' },
    { value: 'supplements',     label: '💊 Supplements' },
    { value: 'snacks',          label: '🍪 Snacks' },
    { value: 'frozen',          label: '🧊 Frozen' },
    { value: 'canned',          label: '🥫 Canned' },
    { value: 'spices',          label: '🧂 Spices' },
    { value: 'other',           label: '📦 Other' },
  ];

  readonly units: PantryUnit[] = [
    'g', 'kg', 'ml', 'L', 'oz', 'lb',
    'cup', 'tbsp', 'tsp',
    'piece', 'slice', 'serving', 'pack', 'can', 'bottle',
  ];

  constructor(
    private modalCtrl: ModalController,
    private pantryService: PantryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.existingItem) {
      this.isEditMode = true;
      const i = this.existingItem;
      this.name                 = i.name;
      this.category             = i.category;
      this.quantity             = i.quantity;
      this.fullQuantity         = i.fullQuantity;
      this.unit                 = i.unit;
      this.expirationDate       = i.expirationDate ?? '';
      this.expirationAlertDays  = i.expirationAlertDays;
      this.lowThresholdPct      = i.lowThresholdPct;
      this.outThresholdPct      = i.outThresholdPct;
      this.autoDecrementEnabled = i.autoDecrementEnabled;
      this.decrementAmount      = i.decrementAmount;
      this.matchAliases         = i.matchAliases.join(', ');
      this.notes                = i.notes ?? '';
    }
  }

  get isValid(): boolean {
    return this.name.trim().length > 0 && this.fullQuantity > 0 && this.quantity >= 0;
  }

  async save(): Promise<void> {
    if (!this.isValid || this.isSaving) return;
    this.isSaving = true;
    this.cdr.markForCheck();

    const aliases = this.matchAliases
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name:                 this.name.trim(),
      category:             this.category,
      quantity:             this.quantity,
      fullQuantity:         this.fullQuantity,
      unit:                 this.unit,
      expirationDate:       this.expirationDate || undefined,
      expirationAlertDays:  this.expirationAlertDays,
      lowThresholdPct:      this.lowThresholdPct,
      outThresholdPct:      this.outThresholdPct,
      autoDecrementEnabled: this.autoDecrementEnabled,
      decrementAmount:      this.decrementAmount,
      matchAliases:         aliases,
      notes:                this.notes.trim() || undefined,
    };

    try {
      if (this.isEditMode && this.existingItem) {
        await this.pantryService.updateItem(this.existingItem.id, payload);
      } else {
        await this.pantryService.addItem(payload);
      }
      await this.modalCtrl.dismiss({ saved: true });
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
