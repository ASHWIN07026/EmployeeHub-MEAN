import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Stats } from '../models';
import { errorMessage, initials } from '../utils';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-head">
      <div><h1>Dashboard</h1><p>Overview of your workforce</p></div>
      <a class="btn primary" routerLink="/employees/new">+ Add employee</a>
    </div>

    @if (loading()) {
      <div class="state"><div class="spinner"></div>Loading dashboard…</div>
    } @else if (error()) {
      <div class="banner">{{ error() }} <button class="btn sm" (click)="load()">Retry</button></div>
    } @else if (stats(); as s) {
      <div class="grid">
        <div class="card stat"><span>Total employees</span><b>{{ s.totalEmployees }}</b></div>
        <div class="card stat"><span>Active</span><b class="ok">{{ s.activeEmployees }}</b></div>
        <div class="card stat"><span>On leave</span><b class="warn">{{ s.onLeaveEmployees }}</b></div>
        <div class="card stat"><span>Departments</span><b>{{ s.totalDepartments }}</b></div>
        <div class="card stat"><span>Average salary</span><b>{{ s.averageSalary | currency: 'INR' : 'symbol' : '1.0-0' }}</b></div>
        <div class="card stat"><span>Monthly payroll</span><b>{{ s.totalPayroll | currency: 'INR' : 'symbol' : '1.0-0' }}</b></div>
      </div>

      <div class="two">
        <div class="card">
          <h2>Employees by department</h2>
          @for (d of s.employeesByDepartment; track d.name) {
            <div class="bar-row">
              <span class="bar-name">{{ d.name }}</span>
              <div class="bar"><div class="fill" [style.width.%]="(d.count / maxCount(s)) * 100"></div></div>
              <span class="bar-n">{{ d.count }}</span>
            </div>
          } @empty {
            <div class="state">No employees yet</div>
          }
        </div>

        <div class="card">
          <h2>Recently added</h2>
          @for (e of s.recentEmployees; track e._id) {
            <a class="recent" [routerLink]="['/employees', e._id]">
              <span class="avatar">{{ initials(e.fullName) }}</span>
              <span class="grow"><b>{{ e.fullName }}</b><small>{{ e.designation }} · {{ e.department?.name }}</small></span>
              <small>{{ e.joiningDate | date: 'mediumDate' }}</small>
            </a>
          } @empty {
            <div class="state">
              <div class="big">👥</div>No employees yet.
              <p><a routerLink="/employees/new">Add your first employee</a></p>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
    .stat span { color: var(--muted); font-size: 14px; }
    .stat b { display: block; font-size: 28px; margin-top: 4px; }
    .ok { color: var(--ok); } .warn { color: var(--warn); }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .bar-row { display: grid; grid-template-columns: 110px 1fr 28px; align-items: center; gap: 10px; margin-bottom: 12px; }
    .bar-name { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar { background: var(--bg); border-radius: 99px; height: 10px; overflow: hidden; }
    .fill { background: linear-gradient(90deg, var(--primary), #7c3aed); height: 100%; border-radius: 99px; }
    .bar-n { font-weight: 600; text-align: right; }
    .recent { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); text-decoration: none; color: var(--text); }
    .recent:last-child { border-bottom: 0; }
    .grow { flex: 1; min-width: 0; } .grow b, .grow small { display: block; }
    small { color: var(--muted); }
    @media (max-width: 800px) { .two { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr 1fr; } }
  `,
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  stats = signal<Stats | null>(null);
  loading = signal(true);
  error = signal('');
  initials = initials;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: (e) => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  maxCount(s: Stats) {
    return Math.max(1, ...s.employeesByDepartment.map((d) => d.count));
  }
}
