import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Department, Employee, EmployeeFilters, EmployeeInput, Stats } from './models';

// Relative URL: in development the Angular proxy (proxy.conf.json) forwards /api to http://localhost:5000.
// For a separately hosted production backend, replace with its full URL, e.g. 'https://my-api.onrender.com/api'.
export const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getStats() {
    return this.http.get<Stats>(`${API_URL}/stats`);
  }

  getEmployees(filters: EmployeeFilters = {}) {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<Employee[]>(`${API_URL}/employees`, { params });
  }
  getEmployee(id: string) {
    return this.http.get<Employee>(`${API_URL}/employees/${id}`);
  }
  createEmployee(body: EmployeeInput) {
    return this.http.post<Employee>(`${API_URL}/employees`, body);
  }
  updateEmployee(id: string, body: EmployeeInput) {
    return this.http.put<Employee>(`${API_URL}/employees/${id}`, body);
  }
  deleteEmployee(id: string) {
    return this.http.delete<{ message: string }>(`${API_URL}/employees/${id}`);
  }

  getDepartments() {
    return this.http.get<Department[]>(`${API_URL}/departments`);
  }
  createDepartment(body: { name: string; description: string }) {
    return this.http.post<Department>(`${API_URL}/departments`, body);
  }
  updateDepartment(id: string, body: { name: string; description: string }) {
    return this.http.put<Department>(`${API_URL}/departments/${id}`, body);
  }
  deleteDepartment(id: string) {
    return this.http.delete<{ message: string }>(`${API_URL}/departments/${id}`);
  }
}
