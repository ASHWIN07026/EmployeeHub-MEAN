import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Department, EmployeeInput, STATUSES } from '../models';
import { ToastService } from '../toast.service';
import { errorMessage } from '../utils';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-head">
      <div><h1>{{ id ? 'Edit employee' : 'Add employee' }}</h1></div>
      <a class="btn" routerLink="/employees">Cancel</a>
    </div>

    @if (loading()) {
      <div class="state"><div class="spinner"></div>Loading…</div>
    } @else {
      @if (error()) { <div class="banner">{{ error() }}</div> }
      <form class="card form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field" [class.invalid]="bad('employeeId')">
          <label for="employeeId">Employee ID</label>
          <input id="employeeId" formControlName="employeeId" placeholder="EMP001" />
          @if (bad('employeeId')) { <div class="err-text">Employee ID is required</div> }
        </div>
        <div class="field" [class.invalid]="bad('fullName')">
          <label for="fullName">Full name</label>
          <input id="fullName" formControlName="fullName" autocomplete="name" />
          @if (bad('fullName')) { <div class="err-text">Full name is required</div> }
        </div>
        <div class="field" [class.invalid]="bad('email')">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
          @if (bad('email')) { <div class="err-text">Enter a valid email address</div> }
        </div>
        <div class="field" [class.invalid]="bad('phone')">
          <label for="phone">Phone</label>
          <input id="phone" type="tel" formControlName="phone" autocomplete="tel" />
          @if (bad('phone')) { <div class="err-text">Enter 7–15 digits (+, -, spaces allowed)</div> }
        </div>
        <div class="field" [class.invalid]="bad('department')">
          <label for="department">Department</label>
          <select id="department" formControlName="department">
            <option value="">Select department</option>
            @for (d of departments(); track d._id) { <option [value]="d._id">{{ d.name }}</option> }
          </select>
          @if (bad('department')) { <div class="err-text">Choose a department</div> }
          @if (departments().length === 0) { <div class="err-text">No departments yet — <a routerLink="/departments">create one first</a>.</div> }
        </div>
        <div class="field" [class.invalid]="bad('designation')">
          <label for="designation">Job role</label>
          <input id="designation" formControlName="designation" />
          @if (bad('designation')) { <div class="err-text">Job role is required</div> }
        </div>
        <div class="field" [class.invalid]="bad('salary')">
          <label for="salary">Salary (₹)</label>
          <input id="salary" type="number" min="0" inputmode="numeric" formControlName="salary" />
          @if (bad('salary')) { <div class="err-text">Enter a salary of 0 or more</div> }
        </div>
        <div class="field" [class.invalid]="bad('joiningDate')">
          <label for="joiningDate">Joining date</label>
          <input id="joiningDate" type="date" formControlName="joiningDate" />
          @if (bad('joiningDate')) { <div class="err-text">Joining date is required</div> }
        </div>
        <div class="field">
          <label for="status">Status</label>
          <select id="status" formControlName="status">
            @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>
        <div class="submit">
          <button class="btn primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : id ? 'Save changes' : 'Create employee' }}</button>
        </div>
      </form>
    }
  `,
  styles: `
    .form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; max-width: 800px; }
    .submit { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
    @media (max-width: 700px) { .form { grid-template-columns: 1fr; } .submit .btn { width: 100%; } }
  `,
})
export class EmployeeForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  id = this.route.snapshot.paramMap.get('id');
  statuses = STATUSES;
  departments = signal<Department[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,15}$/)]],
    department: ['', Validators.required],
    designation: ['', Validators.required],
    salary: [null as number | null, [Validators.required, Validators.min(0)]],
    joiningDate: ['', Validators.required],
    status: ['Active'],
  });

  ngOnInit() {
    this.api.getDepartments().subscribe({
      next: (d) => {
        this.departments.set(d);
        if (!this.id) return this.loading.set(false);
        this.api.getEmployee(this.id).subscribe({
          next: (e) => {
            this.form.patchValue({
              ...e,
              department: e.department?._id ?? '',
              joiningDate: e.joiningDate.slice(0, 10),
            });
            this.loading.set(false);
          },
          error: (err) => { this.error.set(errorMessage(err)); this.loading.set(false); },
        });
      },
      error: (err) => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  bad(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const body = this.form.getRawValue() as unknown as EmployeeInput;
    const req = this.id ? this.api.updateEmployee(this.id, body) : this.api.createEmployee(body);
    req.subscribe({
      next: () => {
        this.toast.success(this.id ? 'Employee updated' : 'Employee created');
        this.router.navigate(['/employees']);
      },
      error: (err) => { this.saving.set(false); this.error.set(errorMessage(err)); window.scrollTo(0, 0); },
    });
  }
}
