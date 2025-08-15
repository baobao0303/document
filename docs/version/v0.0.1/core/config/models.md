# Models Module - @cci-web/core

Module này chứa các model và interface định nghĩa cấu trúc dữ liệu được sử dụng trong toàn bộ ứng dụng CCI-Web.

## 📋 Danh sách Models

### 1. AppUserPrincipal

**File**: `app-user-principal.ts`

**Mô tả**: Model đại diện cho thông tin người dùng hiện tại trong hệ thống.

**Cấu trúc**:

```typescript
export class AppUserPrincipal {
  customer_id: number; // ID khách hàng
  customer_uid: string; // UID duy nhất của khách hàng
  username: string; // Tên đăng nhập
  customer_name: string; // Tên hiển thị của khách hàng
  avatar_url: string; // URL ảnh đại diện
  gender: number; // Giới tính (0: Nữ, 1: Nam)

  constructor(currentUser: AppUserPrincipal) {
    // Constructor copy dữ liệu từ object khác
  }
}
```

**Đối tượng sử dụng**:

- Authentication services
- User profile components
- Authorization guards
- User state management

**Ví dụ sử dụng**:

```typescript
import { AppUserPrincipal } from "@cci-web/core";

// Tạo instance từ dữ liệu API
const userData = {
  customer_id: 12345,
  customer_uid: "user-uuid-123",
  username: "john.doe",
  customer_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg",
  gender: 1,
};

const user = new AppUserPrincipal(userData);
console.log(user.customer_name); // "John Doe"
```

### 2. BreadcrumbRes

**File**: `breadcrumb.res.ts`

**Mô tả**: Model cho dữ liệu breadcrumb navigation.

**Cấu trúc**:

```typescript
export interface BreadcrumbRes {
  title: string; // Tiêu đề hiển thị
  link: string; // Đường dẫn liên kết
  isActive: boolean; // Trạng thái active
}
```

**Đối tượng sử dụng**:

- Navigation components
- SEO breadcrumb structured data
- Page header components

**Ví dụ sử dụng**:

```typescript
import { BreadcrumbRes } from "@cci-web/core";

// Tạo breadcrumb cho trang sản phẩm
const breadcrumbs: BreadcrumbRes[] = [
  { title: "Trang chủ", link: "/", isActive: false },
  { title: "Sản phẩm", link: "/products", isActive: false },
  { title: "Laptop", link: "/products/laptop", isActive: true },
];

// Component sử dụng
@Component({
  selector: "app-breadcrumb",
  template: `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li *ngFor="let item of breadcrumbs; let last = last" class="breadcrumb-item" [class.active]="last">
          <a *ngIf="!last" [routerLink]="item.link">{{ item.title }}</a>
          <span *ngIf="last">{{ item.title }}</span>
        </li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() breadcrumbs: BreadcrumbRes[] = [];
}
```

### 3. Paging

**File**: `paging.ts`

**Mô tả**: Model cho cấu hình phân trang.

**Cấu trúc**:

```typescript
export interface PagingConfig {
  TotalRecord: number; // Tổng số bản ghi
  CurrentPageIndex: number; // Trang hiện tại (1-based)
  PageIndex: number; // Index trang (0-based)
  PageSize: number; // Số item trên mỗi trang
}
```

**Đối tượng sử dụng**:

- Data table components
- API request parameters
- List view components

**Ví dụ sử dụng**:

```typescript
import { PagingConfig } from "@cci-web/core";

// Cấu hình phân trang mặc định
const defaultPaging: PagingConfig = {
  TotalRecord: 0,
  CurrentPageIndex: 1,
  PageIndex: 1,
  PageSize: 20,
};

// Helper functions
class PagingHelper {
  static calculateTotalPages(config: PagingConfig): number {
    return Math.ceil(config.TotalRecord / config.PageSize);
  }

  static hasNextPage(config: PagingConfig): boolean {
    return config.CurrentPageIndex < this.calculateTotalPages(config);
  }

  static hasPreviousPage(config: PagingConfig): boolean {
    return config.CurrentPageIndex > 1;
  }
}
```

### 4. PagingResponse

**File**: `paging.res.ts`

**Mô tả**: Generic interface cho response API có phân trang.

**Cấu trúc**:

```typescript
export interface PagingResponse<T> {
  StatusCode: number; // Mã trạng thái HTTP
  ErrorMessage: string; // Thông báo lỗi (nếu có)
  TotalRecord: number; // Tổng số bản ghi
  CurrentPageIndex: number; // Trang hiện tại
  PageSize: number; // Kích thước trang
  Records: T[]; // Mảng dữ liệu
}
```

**Đối tượng sử dụng**:

- API service responses
- Data loading components
- Pagination controls

**Ví dụ sử dụng**:

```typescript
import { PagingResponse } from "@cci-web/core";

interface Product {
  id: number;
  name: string;
  price: number;
}

// Service method
getProducts(page: number, size: number): Observable<PagingResponse<Product>> {
  return this.http.get<PagingResponse<Product>>(`/api/products`, {
    params: { page: page.toString(), size: size.toString() }
  });
}

processProductResponse(response: PagingResponse<Product>) {
  console.log(`Total: ${response.TotalRecord}`);
  console.log(`Current Page: ${response.CurrentPageIndex}`);
  response.Records.forEach(product => {
    console.log(product.name);
  });
}

// Component sử dụng
@Component({
  selector: "app-product-list",
  template: `
    <div *ngFor="let product of products">{{ product.name }}</div>
    <app-pagination
      [totalRecords]="totalRecords"
      [currentPage]="currentPage"
      [pageSize]="pageSize"
      (pageChange)="onPageChange($event)">
    </app-pagination>
  `,
})
export class ProductListComponent {
  products: Product[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts(this.currentPage, this.pageSize)
      .subscribe(response => {
        this.products = response.Records;
        this.totalRecords = response.TotalRecord;
      });
  }
}
```

### 5. SeoSocialShareData

**File**: `seo-social-share-data.ts`

**Mô tả**: Model cho dữ liệu SEO và social media sharing.

**Cấu trúc**:

```typescript
export interface SeoSocialShareData {
  title: string; // Tiêu đề trang
  description: string; // Mô tả trang
  image: string; // URL hình ảnh đại diện
  url: string; // URL canonical
  type: string; // Loại content (article, website, etc.)
  siteName: string; // Tên website
  locale: string; // Ngôn ngữ (vi_VN, en_US)
  author?: string; // Tác giả (optional)
  publishedTime?: string; // Thời gian xuất bản (optional)
  modifiedTime?: string; // Thời gian cập nhật (optional)
  tags?: string[]; // Tags/keywords (optional)
}
```

**Đối tượng sử dụng**:

- SEO service
- Meta tags management
- Social media sharing
- Open Graph protocol

**Ví dụ sử dụng**:

```typescript
import { SeoSocialShareData } from "@cci-web/core";

// Dữ liệu SEO cho trang sản phẩm
const productSeoData: SeoSocialShareData = {
  title: "iPhone 15 Pro Max - Điện thoại cao cấp",
  description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình Super Retina XDR 6.7 inch",
  image: "https://example.com/iphone-15-pro-max.jpg",
  url: "https://example.com/products/iphone-15-pro-max",
  type: "product",
  siteName: "CCI Store",
  locale: "vi_VN",
  tags: ["iPhone", "Apple", "Smartphone", "Cao cấp"]
};

// Component sử dụng
@Component({
  selector: "app-product-detail",
  template: `<div>Product Detail Page</div>`,
})
export class ProductDetailComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSeoData(productSeoData);
  }
}
```

## 🔧 Utility Functions

### Model Validation

```typescript
// Validation helpers
export class ModelValidator {
  static validateAppUserPrincipal(user: AppUserPrincipal): boolean {
    return !!(user.customer_id && user.customer_uid && user.username);
  }

  static validatePagingConfig(config: PagingConfig): string[] {
    const errors: string[] = [];
    
    if (config.PageSize <= 0 || config.PageSize > 100) {
      errors.push('PageSize must be between 1 and 100');
    }
    
    if (config.CurrentPageIndex <= 0) {
      errors.push('CurrentPageIndex must be greater than 0');
    }
    
    if (config.TotalRecord < 0) {
      errors.push('TotalRecord cannot be negative');
    }
    
    return errors;
  }

  static validateSeoData(data: SeoSocialShareData): boolean {
    return !!(data.title && data.description && data.url);
  }
}
```

### Model Transformers

```typescript
// Transform helpers
export class ModelTransformer {
  static toDisplayPage(config: PagingConfig): number {
    return config.CurrentPageIndex;
  }

  static fromDisplayPage(displayPage: number): number {
    return displayPage;
  }

  static calculateOffset(config: PagingConfig): number {
    return (config.CurrentPageIndex - 1) * config.PageSize;
  }

  static createBreadcrumbFromRoute(route: string): BreadcrumbRes[] {
    const segments = route.split('/').filter(s => s);
    const breadcrumbs: BreadcrumbRes[] = [
      { title: 'Trang chủ', link: '/', isActive: false }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      breadcrumbs.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  }
}
```

## 📚 Best Practices

### 1. Type Safety

```typescript
// ✅ Đúng - Sử dụng generic types
this.apiService
  .get<PagingResponse<Product>>("/api/products") // ✅ Đúng
  .subscribe(response => {
    // TypeScript sẽ biết response.Records là Product[]
    response.Records.forEach(product => {
      console.log(product.name); // ✅ Type-safe
    });
  });

// ❌ Sai - Không sử dụng types
this.apiService
  .get("/api/products") // ❌ Sai - Không có type
  .subscribe((response: any) => {
    // Không có type safety
  });
```

### 2. Model Updates

```typescript
// ✅ Đúng - Immutable updates
static updatePagingConfig(current: PagingConfig, updates: Partial<PagingConfig>): PagingConfig {
  return {
    ...current,
    ...updates
  };
}

// ❌ Sai - Mutating original object
static updatePagingConfigBad(config: PagingConfig, updates: Partial<PagingConfig>) {
  Object.assign(config, updates); // ❌ Mutates original
  return config;
}
```

### 3. Caching Strategies

```typescript
// Service với caching
export class UserService {
  private userCache = new Map<string, AppUserPrincipal>();

  getUser(userId: string): Observable<AppUserPrincipal> {
    const cached = this.userCache.get(userId);
    if (cached) {
      return of(cached);
    }

    return this.apiService.getById<AppUserPrincipal>('/api/users', userId)
      .pipe(
        tap(user => this.userCache.set(userId, user))
      );
  }

  clearUserCache(userId?: string) {
    if (userId) {
      this.userCache.delete(userId);
    } else {
      this.userCache.clear();
    }
  }
}
```

## 🧪 Testing

### Model Testing

```typescript
describe('ModelValidator', () => {
  it('should validate AppUserPrincipal correctly', () => {
    const validUser: AppUserPrincipal = {
      customer_id: 1,
      customer_uid: 'test-uid',
      username: 'testuser',
      customer_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      gender: 1
    };

    expect(ModelValidator.validateAppUserPrincipal(validUser)).toBe(true);
  });

  it('should invalidate incomplete user data', () => {
    const invalidUser = {
      customer_id: 0, // Invalid
      customer_uid: '',
      username: ''
    } as AppUserPrincipal;

    expect(ModelValidator.validateAppUserPrincipal(invalidUser)).toBe(false);
  });
});
```

Các models này cung cấp foundation vững chắc cho việc quản lý dữ liệu trong ứng dụng CCI-Web, đảm bảo type safety và consistency across toàn bộ hệ thống.
