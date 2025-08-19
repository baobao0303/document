# Components Module

Module này cung cấp các Angular components tái sử dụng cho ứng dụng CCI Web.

## Tổng quan

Module Components bao gồm các thành phần UI được thiết kế để sử dụng chung trong toàn bộ hệ sinh thái CCI Web. Tất cả components đều được tối ưu hóa cho hiệu suất và khả năng tái sử dụng.

### Tóm tắt nhanh

| STT | Tên                                     | Mô tả ngắn                                  |
| --- | --------------------------------------- | ------------------------------------------- |
| 1   | `LoadingSpinnerComponent`               | Hiển thị trạng thái loading toàn cục/cục bộ |
| 2   | `OverlayComponent`                      | Lớp phủ (overlay) chặn tương tác nền        |
| 3   | `SpinnerInitAppComponent`               | Spinner cho giai đoạn khởi tạo app          |
| 4   | `SafePageComponent`                     | Khung trang an toàn (bao lỗi/empty)         |
| 5   | `BaseImageComponent`                    | Ảnh cơ bản có xử lý tiện ích                |
| 6   | `BaseSectionComponent`                  | Khối section có tiêu đề/khe chứa nội dung   |
| 7   | `BaseBlockSkeletonComponent`            | Khối skeleton placeholder                   |
| 8   | `ProductSkeletonComponent`              | Skeleton cho danh sách sản phẩm             |
| 9   | `BaseOwlCarouselComponent`              | Carousel hiển thị item                      |
| 10  | `BaseProductItemComponent`              | Item sản phẩm cơ bản                        |
| 11  | `PaginationComponent`                   | Phân trang                                  |
| 12  | `SearchNoProductComponent`              | Trạng thái không có kết quả                 |
| 13  | `BasePromotionFocusSearchComponent`     | Ô tìm kiếm khuyến mãi                       |
| 14  | `BaseRadioButtonIconComponent`          | Radio button dạng icon                      |
| 15  | `RadioButtonCustomComponent`            | Radio tùy biến                              |
| 16  | `ResponsiveContainerComponent`          | Container phản hồi kích thước               |
| 17  | `ChipComponent`                         | Nhãn chip                                   |
| 18  | `MobileScrollSmoothComponent`           | Scroll mượt mobile                          |
| 19  | `SortItemComponent`                     | Mục sắp xếp                                 |
| 20  | `PageNotFoundComponent`                 | Trang 404                                   |
| 21  | `MfeTailwindcssIsolationComponent`      | Cô lập style khi MFE                        |
| 22  | `WrapperComponent` (+ `wrapper-config`) | Bọc nội dung, cấu hình wrapper              |

Ví dụ dùng nhanh:

```html
<app-loading-spinner></app-loading-spinner>
<app-overlay></app-overlay>
<app-pagination [total]="120" [page]="page" (pageChange)="page=$event"></app-pagination>
```

## Danh sách Components

### Base Components

#### BaseImageComponent

Component hiển thị hình ảnh với lazy loading và fallback.

```typescript
import { BaseImageComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-base-image [src]="imageUrl" [alt]="imageAlt" [lazyLoad]="true" [fallbackSrc]="fallbackUrl"> </cci-base-image>
  `,
})
export class ExampleComponent {
  imageUrl = "https://example.com/image.jpg";
  imageAlt = "Example image";
  fallbackUrl = "assets/placeholder.jpg";
}
```

**Properties:**

- `src: string` - URL của hình ảnh
- `alt: string` - Text thay thế cho hình ảnh
- `lazyLoad: boolean` - Bật/tắt lazy loading (mặc định: true)
- `fallbackSrc: string` - URL hình ảnh dự phòng khi load lỗi

#### BaseSectionComponent

Component section cơ bản với tiêu đề và nội dung.

```typescript
import { BaseSectionComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-base-section [title]="sectionTitle" [subtitle]="sectionSubtitle" [showDivider]="true">
      <p>Nội dung của section</p>
    </cci-base-section>
  `,
})
export class ExampleComponent {
  sectionTitle = "Tiêu đề section";
  sectionSubtitle = "Mô tả ngắn";
}
```

**Properties:**

- `title: string` - Tiêu đề chính của section
- `subtitle: string` - Tiêu đề phụ (tùy chọn)
- `showDivider: boolean` - Hiển thị đường phân cách (mặc định: false)

### Loading Components

#### LoadingSpinnerComponent

Component hiển thị trạng thái loading với spinner.

```typescript
import { LoadingSpinnerComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-loading-spinner [size]="'medium'" [color]="'primary'" [message]="loadingMessage"> </cci-loading-spinner>
  `,
})
export class ExampleComponent {
  loadingMessage = "Đang tải dữ liệu...";
}
```

**Properties:**

- `size: 'small' | 'medium' | 'large'` - Kích thước spinner (mặc định: 'medium')
- `color: 'primary' | 'secondary' | 'accent'` - Màu sắc spinner (mặc định: 'primary')
- `message: string` - Thông báo hiển thị cùng spinner (tùy chọn)

#### SpinnerInitAppComponent

Component spinner đặc biệt cho việc khởi tạo ứng dụng.

```typescript
import { SpinnerInitAppComponent } from "@cci-web/shared";

@Component({
  template: ` <cci-spinner-init-app [appName]="'CCI Web'" [version]="'1.0.0'"> </cci-spinner-init-app> `,
})
export class AppInitComponent {
  // Component logic
}
```

### Product Components

#### BaseProductItemComponent

Component hiển thị thông tin sản phẩm cơ bản.

```typescript
import { BaseProductItemComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-base-product-item
      [product]="productData"
      [showDiscount]="true"
      [showRating]="true"
      (productClick)="onProductClick($event)"
      (addToCart)="onAddToCart($event)"
    >
    </cci-base-product-item>
  `,
})
export class ProductListComponent {
  productData = {
    id: 1,
    name: "Sản phẩm A",
    price: 100000,
    originalPrice: 120000,
    image: "product-a.jpg",
    rating: 4.5,
    reviewCount: 100,
  };

  onProductClick(product: any): void {
    console.log("Product clicked:", product);
  }

  onAddToCart(product: any): void {
    console.log("Add to cart:", product);
  }
}
```

**Properties:**

- `product: ProductItem` - Dữ liệu sản phẩm
- `showDiscount: boolean` - Hiển thị thông tin giảm giá (mặc định: true)
- `showRating: boolean` - Hiển thị đánh giá (mặc định: true)
- `showAddToCart: boolean` - Hiển thị nút thêm vào giỏ (mặc định: true)

**Events:**

- `productClick: EventEmitter<ProductItem>` - Sự kiện click vào sản phẩm
- `addToCart: EventEmitter<ProductItem>` - Sự kiện thêm vào giỏ hàng

#### ProductSkeletonComponent

Component skeleton loading cho sản phẩm.

```typescript
import { ProductSkeletonComponent } from "@cci-web/shared";

@Component({
  template: `
    <div class="product-grid">
      <cci-product-skeleton *ngFor="let item of skeletonItems" [showPrice]="true" [showRating]="true">
      </cci-product-skeleton>
    </div>
  `,
})
export class ProductGridComponent {
  skeletonItems = new Array(8); // Hiển thị 8 skeleton items
}
```

### UI Components

#### OverlayComponent

Component overlay cho modals, popups và dialogs.

```typescript
import { OverlayComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-overlay [visible]="showOverlay" [closeOnBackdropClick]="true" (overlayClick)="onOverlayClick()">
      <div class="modal-content">
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
        <button (click)="closeModal()">Close</button>
      </div>
    </cci-overlay>
  `,
})
export class ModalComponent {
  showOverlay = false;

  openModal(): void {
    this.showOverlay = true;
  }

  closeModal(): void {
    this.showOverlay = false;
  }

  onOverlayClick(): void {
    this.closeModal();
  }
}
```

#### PaginationComponent

Component phân trang với các tùy chọn cấu hình.

```typescript
import { PaginationComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-pagination
      [currentPage]="currentPage"
      [totalPages]="totalPages"
      [pageSize]="pageSize"
      [totalItems]="totalItems"
      [showPageSize]="true"
      [pageSizeOptions]="[10, 20, 50]"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
    >
    </cci-pagination>
  `,
})
export class DataTableComponent {
  currentPage = 1;
  totalPages = 10;
  pageSize = 20;
  totalItems = 200;

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadData();
  }

  private loadData(): void {
    // Load data logic
  }
}
```

### Form Components

#### BaseRadioButtonIconComponent

Component radio button với icon tùy chỉnh.

```typescript
import { BaseRadioButtonIconComponent } from "@cci-web/shared";

@Component({
  template: `
    <div class="radio-group">
      <cci-base-radio-button-icon
        *ngFor="let option of options"
        [value]="option.value"
        [label]="option.label"
        [icon]="option.icon"
        [checked]="selectedValue === option.value"
        (valueChange)="onSelectionChange($event)"
      >
      </cci-base-radio-button-icon>
    </div>
  `,
})
export class PaymentMethodComponent {
  selectedValue = "credit-card";

  options = [
    { value: "credit-card", label: "Thẻ tín dụng", icon: "credit-card" },
    { value: "paypal", label: "PayPal", icon: "paypal" },
    { value: "bank-transfer", label: "Chuyển khoản", icon: "bank" },
  ];

  onSelectionChange(value: string): void {
    this.selectedValue = value;
  }
}
```

### Utility Components

#### ResponsiveContainerComponent

Component container responsive với breakpoints.

```typescript
import { ResponsiveContainerComponent } from "@cci-web/shared";

@Component({
  template: `
    <cci-responsive-container [maxWidth]="'1200px'" [padding]="'16px'" [centerContent]="true">
      <div class="content">Nội dung responsive</div>
    </cci-responsive-container>
  `,
})
export class PageComponent {}
```

#### WrapperComponent

Component wrapper với cấu hình linh hoạt.

```typescript
import { WrapperComponent, WrapperConfig } from "@cci-web/shared";

@Component({
  template: `
    <cci-wrapper [config]="wrapperConfig">
      <div class="wrapped-content">Nội dung được wrap</div>
    </cci-wrapper>
  `,
})
export class ContentComponent {
  wrapperConfig: WrapperConfig = {
    padding: "20px",
    margin: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
  };
}
```

## Styling

Tất cả components đều hỗ trợ CSS custom properties để tùy chỉnh giao diện:

```scss
// Tùy chỉnh màu sắc
:root {
  --cci-component-primary: #007bff;
  --cci-component-secondary: #6c757d;
  --cci-component-background: #ffffff;
  --cci-component-border: #dee2e6;
}

// Tùy chỉnh kích thước
:root {
  --cci-component-padding: 16px;
  --cci-component-margin: 8px;
  --cci-component-border-radius: 4px;
}
```

## Best Practices

1. **Sử dụng OnPush Change Detection**: Tất cả components đều sử dụng OnPush strategy để tối ưu hiệu suất.

2. **Lazy Loading**: Sử dụng lazy loading cho hình ảnh và nội dung nặng.

3. **Accessibility**: Tất cả components đều tuân thủ WCAG guidelines.

4. **Responsive Design**: Components tự động thích ứng với các kích thước màn hình khác nhau.

5. **Error Handling**: Xử lý graceful khi có lỗi xảy ra (ví dụ: hình ảnh không load được).

## Testing

Mỗi component đều có unit tests tương ứng:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BaseImageComponent } from "./base-image.component";

describe("BaseImageComponent", () => {
  let component: BaseImageComponent;
  let fixture: ComponentFixture<BaseImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BaseImageComponent],
    });
    fixture = TestBed.createComponent(BaseImageComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```
