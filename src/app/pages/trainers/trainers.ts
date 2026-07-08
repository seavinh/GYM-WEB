import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { Trainer } from '../../models';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-trainers',
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './trainers.html',
  styleUrl: './trainers.css',
})
export class Trainers implements OnInit {
  trainers: Trainer[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  modalLoading = false;
  modalError = '';
  form: Partial<Trainer> = {};

  specialties = ['Strength Training', 'Cardio', 'Yoga', 'CrossFit', 'HIIT', 'Boxing', 'Pilates', 'Nutrition'];

  showConfirm = false;
  deleteTargetId: number | null = null;

  constructor(private trainerService: TrainerService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.loading = true;
    this.trainerService.getTrainers(this.searchTerm).subscribe({
      next: (response) => {
        this.trainers = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load trainers';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.loadTrainers();
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.form = {};
    this.modalError = '';
    this.showModal = true;
  }

  openEditModal(trainer: Trainer): void {
    this.modalMode = 'edit';
    this.form = { ...trainer };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form = {};
    this.modalError = '';
  }

  saveModal(): void {
    if (!this.form.trainer_name || !this.form.phone) {
      this.modalError = 'Name and phone are required.';
      return;
    }

    this.modalLoading = true;
    this.modalError = '';

    const action = this.modalMode === 'add'
      ? this.trainerService.createTrainer(this.form)
      : this.trainerService.updateTrainer(this.form.trainer_id!, this.form);

    action.subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeModal();
        this.loadTrainers();
      },
      error: (err) => {
        this.modalError = err.message || 'Operation failed';
        this.modalLoading = false;
      }
    });
  }

  deleteTrainer(id: number): void {
    this.deleteTargetId = id;
    this.showConfirm = true;
  }

  onConfirmDelete(): void {
    if (this.deleteTargetId === null) return;
    const id = this.deleteTargetId;
    this.showConfirm = false;
    this.deleteTargetId = null;
    this.trainerService.deleteTrainer(id).subscribe({
      next: () => this.loadTrainers(),
      error: (err) => { this.error = err.message || 'Failed to delete trainer'; }
    });
  }

  onCancelDelete(): void {
    this.showConfirm = false;
    this.deleteTargetId = null;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
