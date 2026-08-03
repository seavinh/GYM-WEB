import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth.service';

export interface PolicyRule {
  id: string;
  titleKey: string;
  descKey: string;
  details: string[];
  important?: boolean;
}

export interface PolicyCategory {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  badgeColor: string;
  rules: PolicyRule[];
}

@Component({
  selector: 'app-policy',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './policy.html',
  styleUrl: './policy.css',
})
export class Policy implements OnInit {
  activeCategory: string = 'all';
  searchTerm: string = '';
  isAgreed: boolean = false;
  agreeTimestamp: string | null = null;
  userRole: string = '';

  categories: PolicyCategory[] = [
    {
      id: 'general',
      titleKey: 'policy.cat_general_title',
      descKey: 'policy.cat_general_desc',
      icon: 'bi-journal-check',
      badgeColor: 'var(--accent-blue)',
      rules: [
        {
          id: 'attire',
          titleKey: 'policy.rule_attire_title',
          descKey: 'policy.rule_attire_desc',
          details: [
            'Clean athletic footwear and proper workout clothing are required at all times.',
            'Shirts/tops must remain on in all gym areas including free weights and cardio zones.',
            'Bring a personal sweat towel for equipment cleanliness and personal hygiene.'
          ]
        },
        {
          id: 'equipment_etiquette',
          titleKey: 'policy.rule_equipment_title',
          descKey: 'policy.rule_equipment_desc',
          details: [
            'Re-rack all dumbbells, barbells, and weight plates to their proper stands after use.',
            'Sanitize equipment seats and handles using provided spray/wipes after each set.',
            'Controlled movements only; deliberately dropping heavy weights is strictly prohibited.'
          ],
          important: true
        },
        {
          id: 'conduct',
          titleKey: 'policy.rule_conduct_title',
          descKey: 'policy.rule_conduct_desc',
          details: [
            'Treat all gym members and staff with courtesy, inclusion, and respect.',
            'Use personal headphones for listening to music, podcasts, or videos.',
            'Observe a 30-minute maximum limit on cardio machines during peak facility hours (6:00 PM – 9:00 PM).'
          ]
        }
      ]
    },
    {
      id: 'membership',
      titleKey: 'policy.cat_membership_title',
      descKey: 'policy.cat_membership_desc',
      icon: 'bi-credit-card-2-front-fill',
      badgeColor: 'var(--accent-green)',
      rules: [
        {
          id: 'access',
          titleKey: 'policy.rule_access_title',
          descKey: 'policy.rule_access_desc',
          details: [
            'Scan your member QR code or check in with front desk reception before entering.',
            'Gym memberships are personal and non-transferable under any circumstances.',
            'Unauthorized guest entry or card sharing will result in temporary account suspension.'
          ]
        },
        {
          id: 'cancellation',
          titleKey: 'policy.rule_cancel_title',
          descKey: 'policy.rule_cancel_desc',
          details: [
            'Subscription cancellations require 7 days written notice prior to the next billing date.',
            'Memberships may be frozen for up to 30 days per calendar year for medical or travel reasons.',
            'Refund requests for unused portions of pre-paid plans are reviewed within 14 business days.'
          ],
          important: true
        }
      ]
    },
    {
      id: 'safety',
      titleKey: 'policy.cat_safety_title',
      descKey: 'policy.cat_safety_desc',
      icon: 'bi-shield-heart-fill',
      badgeColor: 'var(--accent-orange)',
      rules: [
        {
          id: 'medical',
          titleKey: 'policy.rule_health_title',
          descKey: 'policy.rule_health_desc',
          details: [
            'Members are strongly advised to consult a healthcare provider before initiating intense exercise.',
            'Always request a certified staff member or experienced spotter when lifting maximum loads.',
            'Immediately notify reception staff of any injury, feeling unwell, or broken equipment.'
          ]
        },
        {
          id: 'lockers',
          titleKey: 'policy.rule_lockers_title',
          descKey: 'policy.rule_lockers_desc',
          details: [
            'Day lockers are available only while active inside the gym facility.',
            'Lockers must be emptied daily at closing time; locks left overnight will be removed.',
            'FitLife Gym is not liable for lost, stolen, or damaged personal valuables or items.'
          ]
        }
      ]
    },
    {
      id: 'privacy',
      titleKey: 'policy.cat_privacy_title',
      descKey: 'policy.cat_privacy_desc',
      icon: 'bi-lock-fill',
      badgeColor: 'var(--accent-purple)',
      rules: [
        {
          id: 'data_sec',
          titleKey: 'policy.rule_data_title',
          descKey: 'policy.rule_data_desc',
          details: [
            'Personal information and payment records are encrypted and protected in accordance with privacy laws.',
            '24/7 CCTV surveillance operates in common gym areas for safety and crime prevention.',
            'Filming or taking photographs of other members without explicit permission is strictly forbidden.'
          ]
        }
      ]
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getStoredRole();
    this.loadAgreementState();
  }

  loadAgreementState(): void {
    const saved = localStorage.getItem('gym_policy_agreed');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.isAgreed = !!data.agreed;
        this.agreeTimestamp = data.timestamp || null;
      } catch (e) {
        this.isAgreed = false;
      }
    }
  }

  toggleAgreement(): void {
    this.isAgreed = !this.isAgreed;
    if (this.isAgreed) {
      this.agreeTimestamp = new Date().toLocaleString();
      localStorage.setItem('gym_policy_agreed', JSON.stringify({
        agreed: true,
        timestamp: this.agreeTimestamp
      }));
    } else {
      this.agreeTimestamp = null;
      localStorage.removeItem('gym_policy_agreed');
    }
  }

  setCategory(catId: string): void {
    this.activeCategory = catId;
  }

  getFilteredCategories(): PolicyCategory[] {
    let cats = this.categories;
    if (this.activeCategory !== 'all') {
      cats = cats.filter(c => c.id === this.activeCategory);
    }
    if (!this.searchTerm.trim()) {
      return cats;
    }
    const term = this.searchTerm.toLowerCase();
    return cats.map(cat => {
      const matchingRules = cat.rules.filter(rule =>
        rule.id.toLowerCase().includes(term) ||
        rule.titleKey.toLowerCase().includes(term) ||
        rule.descKey.toLowerCase().includes(term) ||
        rule.details.some(d => d.toLowerCase().includes(term))
      );
      return { ...cat, rules: matchingRules };
    }).filter(cat => cat.rules.length > 0);
  }

  printPolicy(): void {
    window.print();
  }
}
