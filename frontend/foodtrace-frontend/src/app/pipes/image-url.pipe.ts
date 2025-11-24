import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      // Link ảnh mặc định nếu không có ảnh
      return 'assets/images/no-image.png'; 
    }
    if (value.startsWith('http')) {
      return value; // Nếu là link online thì giữ nguyên
    }
    // Nối đường dẫn API vào trước: http://localhost:3000/uploads/...
    return `${environment.apiUrl}${value}`;
  }
}