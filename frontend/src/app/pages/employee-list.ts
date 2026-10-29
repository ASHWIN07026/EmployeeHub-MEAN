import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Department, Employee, STATUSES } from '../models';
import { ToastService } from '../toast.service';
import { errorMessage, initials } from '../utils';

@Component({
  selector: 'app-employee-list',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page-head">
      <div><h1>Employees</h1><p>{{ employees().length }} found</p></div>
      <a class="btn primary" routerLink="/employees/new">+ Add employee</a>
    </div>

    <div class="card filters">
      <input type="search" placeholder="Search name, email, ID, role…" [ngModel]="search" (ngModelChange)="onSearch($event)" />
      <select [(ngModel)]="department" (ngModelChange)="load()">
        <option value="">All departments</option>
        @for (d of departments(); track d._id) { <option [value]="d._id">{{ d.name }}</option> }
      </select>
      <select [(ngModel)]="status" (ngModelChange)="load()">
        <option value="">All statuses</option>
        @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
      </select>
    </div>

    @if (error()) { <div class="banner">{{ error() }}</div> }

    @if (loading()) {
      <div class="state"><div class="spinner"></div>Loading employees…</div>
    } @else if (employees().length === 0 && !error()) {
      <div class="state card">
        <div class="big">🔍</div>
        <p>{{ search || department || status ? 'No employees match your filters.' : 'No employees yet.' }}</p>
        <a class="btn primary" routerLink="/employees/new">Add employee</a>
      </div>
    } @else {
      <div class="list">
        @for (e of employees(); track e._id) {
          <div class="card row">
            <a class="who" [routerLink]="['/employees', e._id]">
              <span class="avatar">{{ initials(e.fullName) }}</span>
              <span class="grow"><b>{{ e.fullName }}</b><small>{{ e.designation }} · {{ e.employeeId }}</small></span>
            </a>
            <span class="dept">{{ e.department?.name || '—' }}</span>
            <span class="sal">{{ e.salary | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
            <span class="badge" [class]="e.status.replace(' ', '-')">{{ e.status }}</span>
            <span class="acts">
              <a class="btn sm" [routerLink]="['/employees', e._id, 'edit']">Edit</a>
              <button class="btn sm danger" (click)="confirmDelete.set(e)">Delete</button>
            </span>
          </div>
        }
      </div>
    }

    @if (confirmDelete(); as e) {
      <div class="modal-back" (click)="confirmDelete.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Delete employee?</h2>
          <p>{{ e.fullName }} will be permanently removed.</p>
          <div class="actions">
            <button class="btn" (click)="confirmDelete.set(null)">Cancel</button>
            <button class="btn danger solid" [disabled]="deleting()" (click)="remove(e)">{{ deleting() ? 'Deleting…' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .filters { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 16px; padding: 14px; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .row { display: grid; grid-template-columns: 2.4fr 1.2fr 1fr auto auto; align-items: center; gap: 14px; padding: 14px 18px; }
    .who { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--text); min-width: 0; }
    .grow { min-width: 0; } .grow b, .grow small { display: block; }
    small { color: var(--muted); }
    .dept, .sal { color: var(--muted); }
    .acts { display: flex; gap: 8px; }
    .badge { justify-self: start; }
    @media (max-width: 800px) {
      .filters { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr auto; gap: 8px 12px; }
      .who { grid-column: 1 / -1; }
      .acts { grid-column: 1 / -1; }
      .acts .btn { flex: 1; }
    }
  `,
})
export class EmployeeList implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  error = signal('');
  confirmDelete = signal<Employee | null>(null);
  deleting = signal(false);

  statuses = STATUSES;
  initials = initials;
  search = '';
  department = '';
  status = '';
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.api.getDepartments().subscribe({ next: (d) => this.departments.set(d), error: () => {} });
    this.load();
  }

  onSearch(v: string) {
    this.search = v;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.load(), 300);
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.getEmployees({ search: this.search, department: this.department, status: this.status }).subscribe({
      next: (list) => { this.employees.set(list); this.loading.set(false); },
      error: (e) => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  remove(e: Employee) {
    this.deleting.set(true);
    this.api.deleteEmployee(e._id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.confirmDelete.set(null);
        this.toast.success('Employee deleted');
        this.load();
      },
      error: (err) => {
        this.deleting.set(false);
        this.confirmDelete.set(null);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
