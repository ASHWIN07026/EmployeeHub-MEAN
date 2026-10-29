import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Department } from '../models';
import { ToastService } from '../toast.service';
import { errorMessage } from '../utils';

@Component({
  selector: 'app-departments',
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-head">
      <div><h1>Departments</h1><p>{{ departments().length }} total</p></div>
      <button class="btn primary" (click)="openForm()">+ Add department</button>
    </div>

    @if (error()) { <div class="banner">{{ error() }} <button class="btn sm" (click)="load()">Retry</button></div> }

    @if (loading()) {
      <div class="state"><div class="spinner"></div>Loading departments…</div>
    } @else if (departments().length === 0 && !error()) {
      <div class="state card"><div class="big">🏢</div><p>No departments yet.</p><button class="btn primary" (click)="openForm()">Add department</button></div>
    } @else {
      <div class="grid">
        @for (d of departments(); track d._id) {
          <div class="card">
            <h2>{{ d.name }}</h2>
            <p class="desc">{{ d.description || 'No description' }}</p>
            <p class="count">{{ d.employeeCount }} employee{{ d.employeeCount === 1 ? '' : 's' }}</p>
            <div class="acts">
              <button class="btn sm" (click)="openForm(d)">Edit</button>
              <button class="btn sm danger" (click)="toDelete.set(d)">Delete</button>
            </div>
          </div>
        }
      </div>
    }

    @if (showForm()) {
      <div class="modal-back" (click)="showForm.set(false)">
        <form class="modal" [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()" novalidate>
          <h2>{{ editing() ? 'Edit department' : 'Add department' }}</h2>
          @if (formError()) { <div class="banner">{{ formError() }}</div> }
          <div class="field" [class.invalid]="form.controls.name.invalid && form.controls.name.touched">
            <label for="dname">Name</label>
            <input id="dname" formControlName="name" />
            @if (form.controls.name.invalid && form.controls.name.touched) { <div class="err-text">Name is required</div> }
          </div>
          <div class="field" style="margin-top:12px">
            <label for="ddesc">Description</label>
            <textarea id="ddesc" rows="3" formControlName="description"></textarea>
          </div>
          <div class="actions">
            <button class="btn" type="button" (click)="showForm.set(false)">Cancel</button>
            <button class="btn primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </div>
    }

    @if (toDelete(); as d) {
      <div class="modal-back" (click)="toDelete.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Delete "{{ d.name }}"?</h2>
          <p>Departments that still have employees cannot be deleted.</p>
          <div class="actions">
            <button class="btn" (click)="toDelete.set(null)">Cancel</button>
            <button class="btn danger solid" (click)="remove(d)">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .card h2 { margin-bottom: 6px; }
    .desc { color: var(--muted); margin: 0 0 8px; min-height: 24px; }
    .count { font-weight: 600; margin: 0 0 14px; }
    .acts { display: flex; gap: 8px; }
  `,
})
export class Departments implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  departments = signal<Department[]>([]);
  loading = signal(true);
  error = signal('');
  showForm = signal(false);
  editing = signal<Department | null>(null);
  saving = signal(false);
  formError = signal('');
  toDelete = signal<Department | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.getDepartments().subscribe({
      next: (d) => { this.departments.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  openForm(d?: Department) {
    this.editing.set(d ?? null);
    this.formError.set('');
    this.form.reset({ name: d?.name ?? '', description: d?.description ?? '' });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.saving.set(true);
    this.formError.set('');
    const body = this.form.getRawValue();
    const ed = this.editing();
    const req = ed ? this.api.updateDepartment(ed._id, body) : this.api.createDepartment(body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(ed ? 'Department updated' : 'Department created');
        this.load();
      },
      error: (e) => { this.saving.set(false); this.formError.set(errorMessage(e)); },
    });
  }

  remove(d: Department) {
    this.api.deleteDepartment(d._id).subscribe({
      next: () => { this.toDelete.set(null); this.toast.success('Department deleted'); this.load(); },
      error: (e) => { this.toDelete.set(null); this.toast.error(errorMessage(e)); },
    });
  }
}
