import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, shareOutline, copyOutline, checkmarkCircle } from 'ionicons/icons';
import { GroceryList, GroceryListItem } from '../../models/pantry.model';
import { PantryService } from '../../services/pantry.service';

@Component({
  selector: 'app-grocery-list-modal',
  standalone: true,
  templateUrl: './grocery-list-modal.component.html',
  styleUrls: ['./grocery-list-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GroceryListModalComponent implements OnInit {
  @Input() list!: GroceryList;

  groupedItems: { category: string; items: GroceryListItem[] }[] = [];
  isSharing = false;
  totalItems = 0;
  checkedItems = 0;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private pantryService: PantryService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ closeOutline, shareOutline, copyOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.buildGroups();
  }

  private buildGroups() {
    const map = new Map<string, GroceryListItem[]>();
    for (const item of this.list.items) {
      const cat = item.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    this.groupedItems = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([category, items]) => ({ category, items }));

    this.totalItems = this.list.items.length;
    this.checkedItems = this.list.items.filter(i => i.checked).length;
  }

  async toggleItem(item: GroceryListItem) {
    await this.pantryService.toggleGroceryItem(this.list.id, item.name);
    const updated = await this.pantryService.getGroceryListById(this.list.id);
    if (updated) {
      this.list = updated;
      this.buildGroups();
      this.cdr.markForCheck();
    }
  }

  async share() {
    this.isSharing = true;
    this.cdr.markForCheck();
    try {
      await this.pantryService.shareGroceryList(this.list);
      await this.showToast('Grocery list shared!');
    } catch {
      await this.showToast('Copied to clipboard');
    } finally {
      this.isSharing = false;
      this.cdr.markForCheck();
    }
  }

  private async showToast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom' });
    await t.present();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  get progressPct(): number {
    if (!this.totalItems) return 0;
    return Math.round((this.checkedItems / this.totalItems) * 100);
  }
}
