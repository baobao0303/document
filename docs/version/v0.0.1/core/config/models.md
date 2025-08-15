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

// Sử dụng trong service
@Injectable()
export class AuthService {
  private currentUser: AppUserPrincipal | null = null;

  setCurrentUser(userData: any) {
    this.currentUser = new AppUserPrincipal(userData);
  }

  getCurrentUser(): AppUserPrincipal | null {
    return this.currentUser;
  }
}
```

### 2. BreadcrumbRes

**File**: `breadcrumb.res.ts`

**Mô tả**: Interface định nghĩa cấu trúc dữ liệu cho breadcrumb navigation.

**Cấu trúc**:

```typescript
export interface BreadcrumbRes {
  title: string; // Tiêu đề hiển thị
  link: string; // Đường dẫn liên kết
}
```

**Đối tượng sử dụng**:

- Breadcrumb components
- Navigation services
- SEO metadata generation
- Page routing logic

**Ví dụ sử dụng**:

```typescript
import { BreadcrumbRes } from "@cci-web/core";

// Tạo breadcrumb cho trang sản phẩm
const breadcrumbs: BreadcrumbRes[] = [
  { title: "Trang chủ", link: "/" },
  { title: "Sản phẩm", link: "/products" },
  { title: "Điện thoại", link: "/products/phones" },
  { title: "iPhone 15", link: "/products/phones/iphone-15" },
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

### 3. PagingConfig

**File**: `paging.config.ts`

**Mô tả**: Interface cấu hình cho phân trang dữ liệu.

**Cấu trúc**:

```typescript
export interface PagingConfig {
  TotalRecord: number; // Tổng số bản ghi
  CurrentPageIndex: number; // Chỉ số trang hiện tại
  PageIndex: number; // Chỉ số trang (có thể khác CurrentPageIndex)
  PageSize: number; // Số bản ghi trên mỗi trang
}
```

**Đối tượng sử dụng**:

- Pagination components
- Data table services
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

// Service xử lý phân trang
@Injectable()
export class PaginationService {
  calculateTotalPages(config: PagingConfig): number {
    return Math.ceil(config.TotalRecord / config.PageSize);
  }

  getPageRange(config: PagingConfig): { start: number; end: number } {
    const start = (config.CurrentPageIndex - 1) * config.PageSize + 1;
    const end = Math.min(start + config.PageSize - 1, config.TotalRecord);
    return { start, end };
  }

  hasNextPage(config: PagingConfig): boolean {
    return config.CurrentPageIndex < this.calculateTotalPages(config);
  }

  hasPreviousPage(config: PagingConfig): boolean {
    return config.CurrentPageIndex > 1;
  }
}
```

### 4. PagingResponse<T>

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
  Records: [T]; // Mảng dữ liệu
}
```

**Đối tượng sử dụng**:

- API response handling
- Data services
- List components
- Search result processing

**Ví dụ sử dụng**:

```typescript
import { PagingResponse } from "@cci-web/core";

// Interface cho sản phẩm
interface Product {
  id: number;
  name: string;
  price: number;
}

// Service xử lý API
@Injectable()
export class ProductService {
  getProducts(page: number, size: number): Observable<PagingResponse<Product>> {
    return this.http.get<PagingResponse<Product>>(`/api/products`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  processProductResponse(response: PagingResponse<Product>) {
    if (response.StatusCode === 200) {
      console.log(`Loaded ${response.Records.length} of ${response.TotalRecord} products`);
      return response.Records;
    } else {
      throw new Error(response.ErrorMessage);
    }
  }
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
      (pageChange)="onPageChange($event)"
    >
    </app-pagination>
  `,
})
export class ProductListComponent {
  products: Product[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  constructor(private productService: ProductService) {}

  loadProducts() {
    this.productService.getProducts(this.currentPage, this.pageSize).subscribe((response) => {
      this.products = response.Records;
      this.totalRecords = response.TotalRecord;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }
}
```

### 5. SeoSocialShareData

**File**: `seo-social-share-data.ts`

**Mô tả**: Interface định nghĩa metadata cho SEO và social media sharing.

**Cấu trúc**:

```typescript
export interface SeoSocialShareData {
  title?: string; // Tiêu đề trang
  keywords?: string; // Từ khóa SEO
  description?: string; // Mô tả trang
  image?: string; // Hình ảnh đại diện
  url?: string; // URL canonical
  type?: string; // Loại nội dung (article, product, etc.)
  author?: string; // Tác giả
  section?: string; // Phân mục
  published?: string; // Ngày xuất bản
  modified?: string; // Ngày chỉnh sửa
}
```

**Đối tượng sử dụng**:

- SEO services
- Meta tag management
- Social media sharing
- Open Graph implementation

**Ví dụ sử dụng**:

```typescript
import { SeoSocialShareData } from "@cci-web/core";
import { Meta, Title } from "@angular/platform-browser";

// SEO Service
@Injectable()
export class SeoService {
  constructor(private meta: Meta, private title: Title) {}

  updateSeoData(data: SeoSocialShareData) {
    // Cập nhật title
    if (data.title) {
      this.title.setTitle(data.title);
    }

    // Cập nhật meta tags
    const metaTags = [
      { name: "description", content: data.description || "" },
      { name: "keywords", content: data.keywords || "" },
      { name: "author", content: data.author || "" },

      // Open Graph tags
      { property: "og:title", content: data.title || "" },
      { property: "og:description", content: data.description || "" },
      { property: "og:image", content: data.image || "" },
      { property: "og:url", content: data.url || "" },
      { property: "og:type", content: data.type || "website" },

      // Twitter Card tags
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: data.title || "" },
      { name: "twitter:description", content: data.description || "" },
      { name: "twitter:image", content: data.image || "" },
    ];

    metaTags.forEach((tag) => {
      if (tag.name) {
        this.meta.updateTag(tag);
      } else if (tag.property) {
        this.meta.updateTag({ property: tag.property, content: tag.content });
      }
    });
  }
}

// Component sử dụng
@Component({
  selector: "app-product-detail",
  template: `<div>Product Detail Page</div>`,
})
export class ProductDetailComponent implements OnInit {
  constructor(private seoService: SeoService, private route: ActivatedRoute) {}

  ngOnInit() {
    // Giả sử lấy thông tin sản phẩm từ API
    const productSeoData: SeoSocialShareData = {
      title: "iPhone 15 Pro Max - CCI Store",
      description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình Super Retina XDR",
      keywords: "iPhone 15, Apple, smartphone, CCI Store",
      image: "https://example.com/iphone-15-pro-max.jpg",
      url: "https://ccistore.com/products/iphone-15-pro-max",
      type: "product",
      author: "CCI Store",
      section: "Electronics",
      published: "2024-01-15T10:00:00Z",
      modified: "2024-01-20T15:30:00Z",
    };

    this.seoService.updateSeoData(productSeoData);
  }
}
```

## 🔗 Quan hệ giữa các Models

### Mối quan hệ chính:

1. **PagingConfig ↔ PagingResponse**:

   - `PagingConfig` định nghĩa cấu hình phân trang
   - `PagingResponse` chứa kết quả phân trang từ API

2. **AppUserPrincipal ↔ SeoSocialShareData**:

   - `AppUserPrincipal.customer_name` có thể được sử dụng làm `author` trong SEO data

3. **BreadcrumbRes ↔ SeoSocialShareData**:
   - Breadcrumb có thể được sử dụng để tạo structured data cho SEO

### Sơ đồ quan hệ:

```
AppUserPrincipal ──┐
                   ├─→ Application State
BreadcrumbRes ─────┤
                   └─→ SEO Metadata
SeoSocialShareData ─┘

PagingConfig ──────┐
                   ├─→ Data Pagination
PagingResponse ────┘
```

## ✅ Validation Rules

### AppUserPrincipal

```typescript
// Validation helper
export class AppUserPrincipalValidator {
  static validate(user: AppUserPrincipal): string[] {
    const errors: string[] = [];

    if (!user.customer_id || user.customer_id <= 0) {
      errors.push("Customer ID phải là số dương");
    }

    if (!user.customer_uid || user.customer_uid.trim() === "") {
      errors.push("Customer UID không được để trống");
    }

    if (!user.username || user.username.trim() === "") {
      errors.push("Username không được để trống");
    }

    if (user.gender !== 0 && user.gender !== 1) {
      errors.push("Gender phải là 0 (Nữ) hoặc 1 (Nam)");
    }

    return errors;
  }
}
```

### PagingConfig

```typescript
export class PagingConfigValidator {
  static validate(config: PagingConfig): string[] {
    const errors: string[] = [];

    if (config.PageSize <= 0 || config.PageSize > 100) {
      errors.push("PageSize phải từ 1 đến 100");
    }

    if (config.CurrentPageIndex <= 0) {
      errors.push("CurrentPageIndex phải lớn hơn 0");
    }

    if (config.TotalRecord < 0) {
      errors.push("TotalRecord không được âm");
    }

    return errors;
  }
}
```

### SeoSocialShareData

```typescript
export class SeoDataValidator {
  static validate(data: SeoSocialShareData): string[] {
    const errors: string[] = [];

    if (data.title && data.title.length > 60) {
      errors.push("Title không nên vượt quá 60 ký tự");
    }

    if (data.description && data.description.length > 160) {
      errors.push("Description không nên vượt quá 160 ký tự");
    }

    if (data.url && !this.isValidUrl(data.url)) {
      errors.push("URL không hợp lệ");
    }

    return errors;
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
```

## 🚨 Xử lý lỗi thường gặp

### 1. Lỗi khởi tạo AppUserPrincipal

**Lỗi**: `Cannot read property 'customer_id' of null`

**Nguyên nhân**: Truyền null hoặc undefined vào constructor

**Giải pháp**:

```typescript
// Thay vì:
const user = new AppUserPrincipal(null); // ❌ Lỗi

// Sử dụng:
const user = userData ? new AppUserPrincipal(userData) : null; // ✅ Đúng

// Hoặc tạo factory method:
export class AppUserPrincipal {
  static fromApiResponse(data: any): AppUserPrincipal | null {
    if (!data) return null;
    return new AppUserPrincipal(data);
  }
}
```

### 2. Lỗi phân trang không đúng

**Lỗi**: Hiển thị sai số trang hoặc dữ liệu

**Nguyên nhân**: Confusion giữa `CurrentPageIndex` và `PageIndex`

**Giải pháp**:

```typescript
// Luôn sử dụng CurrentPageIndex cho UI
const displayPage = response.CurrentPageIndex;
const totalPages = Math.ceil(response.TotalRecord / response.PageSize);

// Validation trước khi sử dụng
if (displayPage < 1 || displayPage > totalPages) {
  console.warn("Invalid page index:", displayPage);
}
```

### 3. Lỗi SEO metadata không hiển thị

**Lỗi**: Meta tags không được cập nhật

**Nguyên nhân**: Gọi SEO service trước khi component được khởi tạo

**Giải pháp**:

```typescript
@Component({...})
export class ProductComponent implements OnInit, OnDestroy {
  ngOnInit() {
    // Đợi dữ liệu load xong mới cập nhật SEO
    this.productService.getProduct(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(product => {
        const seoData: SeoSocialShareData = {
          title: product.name,
          description: product.description
        };
        this.seoService.updateSeoData(seoData);
      });
  }
}
```

### 4. Lỗi Generic Type trong PagingResponse

**Lỗi**: TypeScript không nhận diện đúng type của Records

**Giải pháp**:

```typescript
// Luôn specify generic type
this.http
  .get<PagingResponse<Product>>("/api/products") // ✅ Đúng
  .subscribe((response) => {
    // TypeScript biết response.Records là Product[]
    response.Records.forEach((product) => {
      console.log(product.name); // ✅ Type-safe
    });
  });

// Thay vì:
this.http.get("/api/products"); // ❌ Không type-safe
```

## 🎯 Best Practices

### 1. Sử dụng Type Guards

```typescript
export function isValidAppUser(user: any): user is AppUserPrincipal {
  return (
    user &&
    typeof user.customer_id === "number" &&
    typeof user.customer_uid === "string" &&
    typeof user.username === "string"
  );
}

// Sử dụng:
if (isValidAppUser(userData)) {
  const user = new AppUserPrincipal(userData);
}
```

### 2. Immutable Updates

```typescript
// Tạo helper cho immutable updates
export class ModelHelpers {
  static updatePagingConfig(current: PagingConfig, updates: Partial<PagingConfig>): PagingConfig {
    return { ...current, ...updates };
  }
}
```

### 3. Default Values

```typescript
// Tạo factory functions với default values
export const createDefaultPagingConfig = (): PagingConfig => ({
  TotalRecord: 0,
  CurrentPageIndex: 1,
  PageIndex: 1,
  PageSize: 20,
});

export const createDefaultSeoData = (): SeoSocialShareData => ({
  title: "CCI Store - Mua sắm trực tuyến",
  description: "Cửa hàng trực tuyến uy tín với hàng ngàn sản phẩm chất lượng",
  type: "website",
});
```

## 📊 Performance Considerations

### 1. Memory Management

- Sử dụng `OnDestroy` để cleanup subscriptions khi làm việc với models
- Avoid creating unnecessary instances của `AppUserPrincipal`

### 2. Caching Strategy

```typescript
@Injectable()
export class ModelCacheService {
  private userCache = new Map<string, AppUserPrincipal>();

  getCachedUser(uid: string): AppUserPrincipal | null {
    return this.userCache.get(uid) || null;
  }

  setCachedUser(user: AppUserPrincipal): void {
    this.userCache.set(user.customer_uid, user);
  }
}
```

### 3. Lazy Loading

- Chỉ load SEO data khi cần thiết
- Sử dụng pagination để tránh load quá nhiều dữ liệu

---

_Tài liệu này được tạo cho @cci-web/core package. Để biết thêm thông tin, vui lòng tham khảo documentation chính của thư viện._
