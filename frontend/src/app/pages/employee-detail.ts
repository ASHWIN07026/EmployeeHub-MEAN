import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Employee } from '../models';
import { ToastService } from '../toast.service';
import { errorMessage, initials } from '../utils';

@Component({
  selector: 'app-employee-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-head">
      <a class="btn" routerLink="/employees">← Back</a>
    </div>

    @if (loading()) {
      <div class="state"><div class="spinner"></div>Loading…</div>
    } @else if (error()) {
      <div class="banner">{{ error() }}</div>
    } @else if (emp(); as e) {
      <div class="card">
        <div class="head">
          <span class="avatar big">{{ initials(e.fullName) }}</span>
          <div>
            <h1>{{ e.fullName }}</h1>
            <p>{{ e.designation }}</p>
            <span class="badge" [class]="e.status.replace(' ', '-')">{{ e.status }}</span>
          </div>
        </div>
        <dl>
          <div><dt>Employee ID</dt><dd>{{ e.employeeId }}</dd></div>
          <div><dt>Department</dt><dd>{{ e.department?.name || '—' }}</dd></div>
          <div><dt>Email</dt><dd><a [href]="'mailto:' + e.email">{{ e.email }}</a></dd></div>
          <div><dt>Phone</dt><dd><a [href]="'tel:' + e.phone">{{ e.phone }}</a></dd></div>
          <div><dt>Salary</dt><dd>{{ e.salary | currency: 'INR' : 'symbol' : '1.0-0' }}</dd></div>
          <div><dt>Joined</dt><dd>{{ e.joiningDate | date: 'longDate' }}</dd></div>
        </dl>
        <div class="acts">
          <a class="btn primary" [routerLink]="['/employees', e._id, 'edit']">Edit</a>
          <button class="btn danger" (click)="confirm.set(true)">Delete</button>
        </div>
      </div>
    }

    @if (confirm()) {
      <div class="modal-back" (click)="confirm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Delete employee?</h2>
          <p>This cannot be undone.</p>
          <div class="actions">
            <button class="btn" (click)="confirm.set(false)">Cancel</button>
            <button class="btn danger solid" (click)="remove()">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .head { display: flex; gap: 18px; align-items: center; margin-bottom: 22px; }
    .head p { margin: 0 0 6px; color: var(--muted); }
    .avatar.big { width: 72px; height: 72px; font-size: 24px; }
    dl { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 0 0 24px; }
    dt { color: var(--muted); font-size: 13px; } dd { margin: 2px 0 0; font-weight: 600; word-break: break-word; }
    .acts { display: flex; gap: 10px; }
    @media (max-width: 600px) { dl { grid-template-columns: 1fr; } .acts .btn { flex: 1; } }
  `,
})
export class EmployeeDetail implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  emp = signal<Employee | null>(null);
  loading = signal(true);
  error = signal('');
  confirm = signal(false);
  initials = initials;

  ngOnInit() {
    this.api.getEmployee(this.route.snapshot.paramMap.get('id')!).subscribe({
      next: (e) => { this.emp.set(e); this.loading.set(false); },
      error: (err) => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  remove() {
    this.api.deleteEmployee(this.emp()!._id).subscribe({
      next: () => { this.toast.success('Employee deleted'); this.router.navigate(['/employees']); },
      error: (err) => { this.confirm.set(false); this.toast.error(errorMessage(err)); },
    });
  }
}
