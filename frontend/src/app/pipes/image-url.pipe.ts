import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return 'assets/images/no-image.png'; // Ảnh mặc định nếu null
    }
    if (value.startsWith('http')) {
      return value; // Nếu là link online thì giữ nguyên
    }
    // Nối domain API vào trước đường dẫn
    return `${environment.apiUrl}${value}`;
  }
}