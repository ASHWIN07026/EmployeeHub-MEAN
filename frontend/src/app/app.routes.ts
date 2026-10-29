import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard';
import { EmployeeList } from './pages/employee-list';
import { EmployeeForm } from './pages/employee-form';
import { EmployeeDetail } from './pages/employee-detail';
import { Departments } from './pages/departments';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Dashboard, title: 'Dashboard · EmployeeHub' },
  { path: 'employees', component: EmployeeList, title: 'Employees · EmployeeHub' },
  { path: 'employees/new', component: EmployeeForm, title: 'Add employee · EmployeeHub' },
  { path: 'employees/:id/edit', component: EmployeeForm, title: 'Edit employee · EmployeeHub' },
  { path: 'employees/:id', component: EmployeeDetail, title: 'Employee · EmployeeHub' },
  { path: 'departments', component: Departments, title: 'Departments · EmployeeHub' },
  { path: '**', redirectTo: '' },
];
