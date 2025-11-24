import { Routes } from '@angular/router';

// Imports
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardContentComponent } from './pages/dashboard/dashboard-content.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component'; // <--- Đảm bảo import này đúng
import { FarmsListComponent } from './pages/farms/farms-list.component';
import { BatchesListComponent } from './pages/batches/batches-list.component';
import { BatchDetailComponent } from './pages/batches/batch-detail.component';
import { TraceComponent } from './pages/trace/trace.component';
import { ActivitiesComponent } from './pages/activities/activities.component';

export const routes: Routes = [
  // 1. Redirect mặc định
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // 2. Các trang Public (Không có Sidebar)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent }, // <--- QUAN TRỌNG: Phải nằm ở đây

  // 3. Các trang Nội bộ (Có Sidebar)
  {
    path: '',
    component: DashboardComponent, 
    children: [
      { path: 'dashboard', component: DashboardContentComponent },
      { path: 'farms', component: FarmsListComponent },
      { path: 'batches', component: BatchesListComponent },
      { path: 'batches/:id', component: BatchDetailComponent },
      { path: 'trace', component: TraceComponent },
      { path: 'activities', component: ActivitiesComponent },
    ],
  },
  
  // 4. Fallback
  { path: '**', redirectTo: 'login' }, 
];