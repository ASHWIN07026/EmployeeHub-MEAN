import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  toast = inject(ToastService);
  nav = [
    { path: '/', label: 'Dashboard', icon: '▦', exact: true },
    { path: '/employees', label: 'Employees', icon: '☺', exact: false },
    { path: '/departments', label: 'Departments', icon: '▤', exact: false },
  ];
}
