export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';
export const STATUSES: EmployeeStatus[] = ['Active', 'On Leave', 'Inactive'];

export interface Department {
  _id: string;
  name: string;
  description?: string;
  employeeCount?: number;
}

export interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: { _id: string; name: string } | null;
  designation: string;
  salary: number;
  joiningDate: string;
  status: EmployeeStatus;
}

export interface EmployeeInput {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: EmployeeStatus;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
}

export interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  inactiveEmployees: number;
  totalDepartments: number;
  averageSalary: number;
  totalPayroll: number;
  employeesByDepartment: { name: string; count: number }[];
  recentEmployees: Employee[];
}
