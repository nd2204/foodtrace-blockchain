import { Routes } from '@angular/router';

// 1. Layout & Dashboard
import { DashboardComponent } from './pages/dashboard/dashboard.component'; // Layout Shell
import { DashboardContentComponent } from './pages/dashboard/dashboard-content.component'; // Nội dung trang chủ

// 2. Auth (Xác thực)
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { VerifyComponent } from './pages/verify/verify.component';

// 3. Farms (Nông trại)
import { FarmsListComponent } from './pages/farms/farms-list.component';
import { FarmFormComponent } from './pages/farms/farm-form.component';

// 4. Batches (Lô hàng)
import { BatchesListComponent } from './pages/batches/batches-list.component';
import { BatchFormComponent } from './pages/batches/batch-form.component';
import { BatchDetailComponent } from './pages/batches/batch-detail.component';

// 5. Products (Sản phẩm)
import { ProductListComponent } from './pages/products/product-list.component';
import { ProductFormComponent } from './pages/products/product-form.component';

// 6. Categories (Danh mục)
import { CategoryListComponent } from './pages/categories/category-list.component';
import { CategoryFormComponent } from './pages/categories/category-form.component';

// 7. Others (Truy xuất, Hoạt động)
import { TraceComponent } from './pages/trace/trace.component';
import { ActivitiesComponent } from './pages/activities/activities.component';

export const routes: Routes = [
  // --- A. ĐIỀU HƯỚNG MẶC ĐỊNH ---
  // Vào trang chủ ('') sẽ tự nhảy về trang Login
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // --- B. CÁC TRANG PUBLIC (Không có Sidebar) ---
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify', component: VerifyComponent },

  // --- C. CÁC TRANG NỘI BỘ (Dùng chung Layout Dashboard) ---
  {
    path: '', 
    component: DashboardComponent, // Component chứa Sidebar & Header
    children: [
      // 1. Dashboard
      { path: 'dashboard', component: DashboardContentComponent },
      
      // 2. Nông trại
      { path: 'farms', component: FarmsListComponent },
      { path: 'farms/create', component: FarmFormComponent },     // Trang Thêm
      { path: 'farms/edit/:id', component: FarmFormComponent },   // Trang Sửa

      // 3. Lô hàng
      { path: 'batches', component: BatchesListComponent },
      { path: 'batches/create', component: BatchFormComponent },  // Trang Thêm
      { path: 'batches/:id', component: BatchDetailComponent },   // Trang Chi tiết

      // 4. Sản phẩm
      { path: 'products', component: ProductListComponent },
      { path: 'products/create', component: ProductFormComponent }, // Trang Thêm
      { path: 'products/edit/:id', component: ProductFormComponent }, // Trang Sửa

      // 5. Danh mục
      { path: 'categories', component: CategoryListComponent },
      { path: 'categories/create', component: CategoryFormComponent }, // Trang Thêm
      { path: 'categories/edit/:id', component: CategoryFormComponent }, // Trang Sửa
      
      // 6. Chức năng khác
      { path: 'trace', component: TraceComponent },
      { path: 'activities', component: ActivitiesComponent },
    ],
  },

  // --- D. XỬ LÝ LỖI ---
  // Nếu đường dẫn sai, quay về Login
  { path: '**', redirectTo: 'login' },
];