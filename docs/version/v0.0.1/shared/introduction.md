# @cci-web/shared

Thư viện chia sẻ các components, directives, pipes và utilities cho các ứng dụng Angular CCI Web.

## Tổng quan

`@cci-web/shared` là một thư viện Angular cung cấp các thành phần UI và tiện ích được sử dụng chung trong hệ sinh thái CCI Web. Thư viện bao gồm:

- **Components**: Các thành phần UI tái sử dụng
- **Directives**: Các directive mở rộng chức năng HTML
- **Pipes**: Các pipe xử lý và định dạng dữ liệu
- **Utils**: Các hàm tiện ích và helpers
- **Providers**: Các provider cung cấp dịch vụ chung

## Cài đặt

```bash
npm install @cci-web/shared
```

## Sử dụng cơ bản

### Import module

```typescript
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '@cci-web/shared';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `<cci-loading-spinner></cci-loading-spinner>`
})
export class ExampleComponent {}
```

### Sử dụng pipes

```typescript
import { Component } from '@angular/core';
import { FormatMoneyPipe } from '@cci-web/shared';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FormatMoneyPipe],
  template: `<p>{{ 1000000 | formatMoney }}</p>` // Hiển thị: 1.000.000 ₫
})
export class ExampleComponent {}
```

### Sử dụng utilities

```typescript
import { Component } from '@angular/core';
import { getUrlImageCDN } from '@cci-web/shared';

@Component({
  selector: 'app-example',
  template: `<img [src]="imageUrl" alt="Example">`
})
export class ExampleComponent {
  cdnDomain = 'https://cdn.example.com';
  imageUrl = getUrlImageCDN('products/image.jpg', this.cdnDomain);
}
```

## Các module chính

### Components

Thư viện cung cấp nhiều components tái sử dụng:

- **Base Image**: Component hiển thị hình ảnh với lazy loading
- **Base Section**: Component section cơ bản với tiêu đề và nội dung
- **Loading Spinner**: Component hiển thị trạng thái loading
- **Overlay**: Component overlay cho modals và popups
- **Pagination**: Component phân trang
- **Product Skeleton**: Component skeleton loading cho sản phẩm
- **Base Product Item**: Component hiển thị thông tin sản phẩm cơ bản
- **Base Owl Carousel**: Component carousel dựa trên Owl Carousel

[Xem chi tiết về Components](./components)

### Directives

Các directive mở rộng chức năng HTML:

- **Open Search**: Directive mở chức năng tìm kiếm

[Xem chi tiết về Directives](./directives)

### Pipes

Các pipe xử lý và định dạng dữ liệu:

- **Format Money**: Định dạng số thành tiền tệ
- **Format Date**: Định dạng ngày tháng
- **Format Delivery Time**: Định dạng thời gian giao hàng
- **Discount**: Tính toán giảm giá
- **Safe**: Pipe bỏ qua sanitization cho URL, HTML, v.v.

[Xem chi tiết về Pipes](./pipes)

### Utils

Các hàm tiện ích:

- **checkUrl**: Kiểm tra URL có chứa path cụ thể
- **convertISOToDateObject**: Chuyển đổi chuỗi ISO thành đối tượng ngày
- **getUrlImageCDN**: Lấy URL hình ảnh từ CDN
- **navigateHistory**: Quay lại trang trước đó

[Xem chi tiết về Utils](./utils)

### Providers

Các provider cung cấp dịch vụ chung:

- **Shared Provider**: Provider cung cấp môi trường và cấu hình chung
- **Breakpoint Provider**: Provider quản lý breakpoints cho responsive design

[Xem chi tiết về Providers](./provider)

## Ví dụ nâng cao

### Sử dụng Shared Environment

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideSharedEnvironment, ISharedEnvironment } from '@cci-web/shared';

const environment: ISharedEnvironment = {
  production: false,
  cdnUrl: 'https://cdn.example.com',
  apiUrl: 'https://api.example.com'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideSharedEnvironment(environment)
  ]
};
```

### Sử dụng Breakpoint Provider

```typescript
import { Component, inject } from '@angular/core';
import { BreakpointProvider } from '@cci-web/shared';

@Component({
  selector: 'app-responsive',
  template: `<div [class.mobile]="isMobile$ | async">Responsive content</div>`
})
export class ResponsiveComponent {
  private breakpointProvider = inject(BreakpointProvider);
  isMobile$ = this.breakpointProvider.isMobile$;
}
```

### Sử dụng Base Product Item

```typescript
import { Component } from '@angular/core';
import { BaseProductItemComponent } from '@cci-web/shared';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [BaseProductItemComponent],
  template: `
    <div class="product-grid">
      <cci-base-product-item
        *ngFor="let product of products"
        [product]="product"
        [showDiscount]="true"
        (productClick)="onProductClick($event)">
      </cci-base-product-item>
    </div>
  `
})
export class ProductListComponent {
  products = [/* ... */];
  
  onProductClick(product: any): void {
    console.log('Product clicked:', product);
  }
}
```

## Tùy chỉnh theme

Thư viện hỗ trợ tùy chỉnh theme thông qua CSS variables:

```scss
:root {
  --cci-primary-color: #007bff;
  --cci-secondary-color: #6c757d;
  --cci-success-color: #28a745;
  --cci-danger-color: #dc3545;
  --cci-warning-color: #ffc107;
  --cci-info-color: #17a2b8;
  --cci-light-color: #f8f9fa;
  --cci-dark-color: #343a40;
  
  --cci-font-family: 'Roboto', sans-serif;
  --cci-border-radius: 4px;
}
```

## Troubleshooting

### Lỗi thường gặp

1. **Component không hiển thị đúng style**
   
   Đảm bảo bạn đã import CSS của thư viện trong file styles.scss:
   
   ```scss
   @import '@cci-web/shared/styles';
   ```

2. **Lỗi "No provider for SHARED_ENVIRONMENT"**
   
   Đảm bảo bạn đã cung cấp SHARED_ENVIRONMENT trong providers:
   
   ```typescript
   providers: [provideSharedEnvironment({ /* config */ })]
   ```

## Dependencies

- `@angular/common`: ^19.2.0
- `@angular/core`: ^19.2.0
- `tslib`: ^2.3.0

## License

MIT License - xem file [LICENSE](./LICENSE) để biết thêm chi tiết.

## Đóng góp

Vui lòng đọc hướng dẫn đóng góp trong file [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Changelog

Xem [CHANGELOG.md](./CHANGELOG.md) để biết lịch sử thay đổi của thư viện.