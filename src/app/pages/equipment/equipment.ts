import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment as EquipmentModel } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-equipment',
  imports: [CommonModule, FormsModule, TranslatePipe, ConfirmDialog],
  templateUrl: './equipment.html',
  styleUrl: './equipment.css',
})
export class Equipment implements OnInit {
  equipmentList: EquipmentModel[] = [];
  loading = true;
  error = '';

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  modalLoading = false;
  modalError = '';
  form: Partial<EquipmentModel> = {};

  showConfirm = false;
  deleteTargetId: number | null = null;

  statusOptions = ['bought', 'maintenance', 'miss', 'broken'];
  typeOptions = ['Cardio', 'Strength', 'Flexibility', 'Free Weights', 'Machines', 'Other'];

  constructor(private equipmentService: EquipmentService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.loading = true;
    this.equipmentService.getEquipment().subscribe({
      next: (res) => {
        this.equipmentList = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load equipment';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'bought': return 'var(--accent-green)';
      case 'maintenance': return 'var(--accent-orange)';
      case 'miss': return '#f59e0b'; // amber/orange-yellow
      case 'broken': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
    }
  }

  getStatusBadge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'bought': return 'badge-green';
      case 'maintenance': return 'badge-orange';
      case 'miss': return 'badge-gray';
      case 'broken': return 'badge-red';
      default: return 'badge-gray';
    }
  }

  capitalizeStatus(status: string): string {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  }

  getTotalQuantity(): number {
    return this.equipmentList.reduce((sum, e) => sum + (e.quantity || 0), 0);
  }

  getMaintenanceCount(): number {
    return this.equipmentList.filter(e => e.status?.toLowerCase() === 'maintenance').length;
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.form = { status: 'bought', quantity: 1 };
    this.modalError = '';
    this.showModal = true;
  }

  openEditModal(item: EquipmentModel): void {
    this.modalMode = 'edit';
    this.form = { ...item };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form = {};
    this.modalError = '';
  }

  saveModal(): void {
    if (!this.form.name || !this.form.type) {
      this.modalError = 'Name and type are required.';
      return;
    }
    this.modalLoading = true;
    const action = this.modalMode === 'add'
      ? this.equipmentService.createEquipment(this.form)
      : this.equipmentService.updateEquipment(this.form.equipment_id!, this.form);

    action.subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeModal();
        this.loadEquipment();
      },
      error: (err) => {
        this.modalError = err.message || 'Operation failed';
        this.modalLoading = false;
      }
    });
  }

  deleteEquipment(id: number): void {
    this.deleteTargetId = id;
    this.showConfirm = true;
  }

  onConfirmDelete(): void {
    if (this.deleteTargetId === null) return;
    const id = this.deleteTargetId;
    this.showConfirm = false;
    this.deleteTargetId = null;
    this.equipmentService.deleteEquipment(id).subscribe({
      next: () => this.loadEquipment(),
      error: (err) => { this.error = err.message || 'Failed to delete'; }
    });
  }

  onCancelDelete(): void {
    this.showConfirm = false;
    this.deleteTargetId = null;
  }
}
