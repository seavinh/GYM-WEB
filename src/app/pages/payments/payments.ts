import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { MembershipService } from '../../services/membership.service';
import { Payment, Membership } from '../../models';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  payments: Payment[] = [];
  memberships: Membership[] = [];
  loading = true;
  error = '';
  hoveredPlan: number | null = null;

  // Modal
  showModal = false;
  modalLoading = false;
  modalError = '';
  newPayment: any = {};

  constructor(
    private paymentService: PaymentService,
    private membershipService: MembershipService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadMemberships();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getPayments().subscribe({
      next: (res) => {
        this.payments = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load payments';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMemberships(): void {
    this.membershipService.getMemberships().subscribe({
      next: (res) => { this.memberships = res; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getTotalRevenue(): number {
    return this.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }

  openAddModal(): void {
    this.newPayment = { payment_date: new Date().toISOString().split('T')[0] };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.newPayment = {};
    this.modalError = '';
  }

  savePayment(): void {
    if (!this.newPayment.member_id || !this.newPayment.amount) {
      this.modalError = 'Member ID and amount are required.';
      return;
    }
    this.modalLoading = true;
    const payload = {
      ...this.newPayment,
      membership_id: this.newPayment.membership_id || null
    };
    this.paymentService.createPayment(payload).subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeModal();
        this.loadPayments();
      },
      error: (err) => {
        this.modalError = err.message || 'Failed to record payment';
        this.modalLoading = false;
      }
    });
  }
}
