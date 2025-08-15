# Services Module - @cci-web/core

Module services cung cấp các dịch vụ cốt lõi cho ứng dụng Angular, bao gồm API client, cache, authentication, SEO, storage và các utility services khác.

## Danh sách Services

### 1. API Service (`api.service.ts`)

**Mục đích**: Service chính để thực hiện các HTTP requests với caching và error handling

**API Methods**:

```typescript
import { ApiService } from "@cci-web/core/services";

@Component({})
export class MyComponent {
  constructor(private apiService: ApiService) {}

  // GET request với cache
  loadData() {
    this.apiService.get<any[]>("/api/products", null, true).subscribe((data) => console.log(data));
  }

  // GET by ID
  loadProduct(id: number) {
    this.apiService.getById<Product>("/api/products", id).subscribe((product) => console.log(product));
  }

  // POST request
  createProduct(product: Product) {
    this.apiService.post<Product>("/api/products", product).subscribe((result) => console.log(result));
  }

  // PUT request
  updateProduct(product: Product) {
    this.apiService.put<Product>("/api/products", product).subscribe((result) => console.log(result));
  }

  // DELETE request
  deleteProduct(id: string) {
    this.apiService.delete("/api/products", id).subscribe((result) => console.log(result));
  }

  // Upload file
  uploadFile(file: File) {
    this.apiService.postFile<any>("/api/upload", file).subscribe((result) => console.log(result));
  }

  // Form data
  submitForm(formData: FormData) {
    this.apiService.postFormData<any>("/api/form", formData).subscribe((result) => console.log(result));
  }
}
```

**Features**:

- Tự động caching với CacheService
- Support cho file upload
- Form data handling
- Responsive breakpoint integration
- UUID generation
- Query string utilities

**Best Practices**:

- Sử dụng cache cho GET requests không thay đổi thường xuyên
- Implement proper error handling
- Use TypeScript generics cho type safety

### 2. Base API Service (`base.api.service.ts`)

**Mục đích**: Base class để extend ApiService cho các service cụ thể

```typescript
import { BaseApiService } from "@cci-web/core/services";

@Injectable()
export class ProductService extends BaseApiService {
  private readonly endpoint = "/api/products";

  getProducts() {
    return this.get<Product[]>(this.endpoint, null, true);
  }

  getProduct(id: number) {
    return this.getById<Product>(this.endpoint, id);
  }

  createProduct(product: Product) {
    return this.post<Product>(this.endpoint, product);
  }
}
```

### 3. Cache Service (`cache.service.ts`)

**Mục đích**: Quản lý cache trong memory với TTL và LRU eviction

**API Methods**:

```typescript
import { CacheService } from "@cci-web/core/services";

@Component({})
export class MyComponent {
  constructor(private cacheService: CacheService) {}

  // Lưu data vào cache
  cacheData() {
    const data = { id: 1, name: "Product 1" };
    this.cacheService.set("product-1", data, 300000); // 5 minutes TTL
  }

  // Lấy data từ cache
  getCachedData() {
    const data = this.cacheService.get("product-1");
    if (data) {
      console.log("From cache:", data);
    } else {
      console.log("Cache miss");
    }
  }

  // Kiểm tra cache tồn tại
  checkCache() {
    if (this.cacheService.has("product-1")) {
      console.log("Cache exists");
    }
  }

  // Xóa cache
  clearCache() {
    this.cacheService.remove("product-1");
    // hoặc xóa tất cả
    this.cacheService.clear();
  }

  // Generate cache key
  generateKey() {
    const key = this.cacheService.generateKey("/api/products", { page: 1 });
    console.log("Cache key:", key);
  }
}
```

**Features**:

- TTL (Time To Live) support
- LRU (Least Recently Used) eviction
- Configurable cache size limit
- Automatic key generation
- Last access tracking

**Performance Considerations**:

- Cache size limit để tránh memory leak
- TTL phù hợp với tính chất data
- Monitor cache hit rate

### 4. SEO Service (`seo.service.ts`)

**Mục đích**: Quản lý SEO metadata và social sharing tags

**API Methods**:

```typescript
import { SeoService, SeoSocialShareData } from "@cci-web/core/services";

@Component({})
export class ProductDetailComponent {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    const seoData: SeoSocialShareData = {
      title: "iPhone 15 Pro Max - Chính hãng",
      description: "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ",
      keywords: "iPhone, Apple, smartphone, chính hãng",
      image: "https://example.com/iphone-15.jpg",
      url: "https://example.com/products/iphone-15-pro-max",
      type: "product",
      author: "CCI Store",
      published: "2024-01-15",
      modified: "2024-01-20",
      section: "Electronics",
    };

    this.seoService.setData(seoData);
  }

  // Set individual meta tags
  updateSEO() {
    this.seoService.setTitle("New Product Title");
    this.seoService.setDescription("Updated description");
    this.seoService.setKeywords("new, keywords, here");
    this.seoService.setImage("https://example.com/new-image.jpg");
    this.seoService.setCanonicalUrl("https://example.com/canonical-url");
  }

  // Social media specific
  setSocialMedia() {
    this.seoService.setTwitterCard("summary_large_image");
    this.seoService.setTwitterSiteCreator("@mystore");
    this.seoService.setFbAppId("123456789");
  }
}
```

**Features**:

- Open Graph tags
- Twitter Card tags
- Standard meta tags
- Canonical URL support
- Article metadata
- Facebook App ID

**Best Practices**:

- Set SEO data trong ngOnInit của từng page
- Use structured data cho rich snippets
- Optimize images cho social sharing
- Keep titles under 60 characters
- Keep descriptions under 160 characters

### 5. Local Storage Service (`local-storage.service.ts`)

**Mục đích**: Wrapper cho localStorage với SSR support

```typescript
import { LocalStorageService } from "@cci-web/core/services";

@Component({})
export class UserPreferencesComponent {
  constructor(private localStorage: LocalStorageService) {}

  // Lưu user preferences
  savePreferences() {
    const preferences = {
      theme: "dark",
      language: "vi",
      currency: "VND",
    };
    this.localStorage.setItem("user-preferences", JSON.stringify(preferences));
  }

  // Load user preferences
  loadPreferences() {
    const data = this.localStorage.getItem("user-preferences");
    if (data) {
      const preferences = JSON.parse(data);
      console.log("User preferences:", preferences);
    }
  }

  // Check if key exists
  checkPreferences() {
    if (this.localStorage.hasKey("user-preferences")) {
      console.log("Preferences found");
    }
  }

  // Clear preferences
  clearPreferences() {
    this.localStorage.removeItem("user-preferences");
    // hoặc clear tất cả
    this.localStorage.clear();
  }
}
```

**Features**:

- SSR safe operations
- Platform detection
- Null safety

### 6. Breakpoint Service (`breakpoint.service.ts`)

**Mục đích**: Quản lý responsive breakpoints và screen size detection

```typescript
import { BreakpointService, Breakpoints } from "@cci-web/core/services";

@Component({})
export class ResponsiveComponent {
  breakpoints: Breakpoints;

  constructor(private breakpointService: BreakpointService) {
    // Subscribe to breakpoint changes
    this.breakpointService.breakpointsResult$.subscribe((breakpoints) => {
      this.breakpoints = breakpoints;
      this.handleBreakpointChange();
    });
  }

  handleBreakpointChange() {
    if (this.breakpoints.isPhoneOnly) {
      console.log("Mobile view");
      // Mobile specific logic
    } else if (this.breakpoints.isTabletPortraitUp) {
      console.log("Tablet view");
      // Tablet specific logic
    } else if (this.breakpoints.isDesktopUp) {
      console.log("Desktop view");
      // Desktop specific logic
    }
  }

  // Get current breakpoints
  getCurrentBreakpoints() {
    const current = this.breakpointService.getBreakpoints();
    console.log("Current breakpoints:", current);
  }
}
```

**Breakpoint Definitions**:

- `isPhoneOnly`: Mobile devices only
- `isTabletPortraitUp`: Tablet portrait and up
- `isTabletLandscapeUp`: Tablet landscape and up
- `isDesktopUp`: Desktop and up
- `isBigDesktopUp`: Large desktop screens

### 7. Loading Spinner Service (`loading-spinner.service.ts`)

**Mục đích**: Quản lý global loading state

```typescript
import { LoadingSpinnerService } from "@cci-web/core/services";

@Component({
  template: `
    <div *ngIf="loadingService.loading$ | async" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  `,
})
export class LoadingComponent {
  constructor(public loadingService: LoadingSpinnerService) {}
}

@Component({})
export class DataComponent {
  constructor(private loadingService: LoadingSpinnerService) {}

  loadData() {
    this.loadingService.show();

    this.apiService.get("/api/data").subscribe({
      next: (data) => {
        console.log(data);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }
}
```

### 8. App Initialize Service (`app-initialize.service.ts`)

**Mục đích**: Quản lý application initialization state

```typescript
import { AppInitializeService } from "@cci-web/core/services";

@Component({})
export class AppComponent {
  constructor(private appInitService: AppInitializeService) {
    // Listen to initialization status
    this.appInitService.initialize().subscribe((isInitialized) => {
      if (isInitialized) {
        console.log("App is initialized");
        // Proceed with app logic
      }
    });
  }

  completeInitialization() {
    // Call this when app setup is complete
    this.appInitService.setInitialize(true);
  }
}
```

## Utility Services

### Session Storage Service

Tương tự LocalStorageService nhưng sử dụng sessionStorage

### Cookie Service

Quản lý cookies với SSR support

### Platform Service

Detect platform (browser/server) và provide safe execution context

### Window Service

SSR-safe window object access

### Document Service

SSR-safe document object access

### Responsive Service

Advanced responsive utilities

### Overlay Service

Quản lý modal và overlay components

### Remote CSS Service

Dynamic CSS loading

### Request Cache Service

HTTP request caching với advanced features

### Search Event Bridge Service

Event communication cho search functionality

### Open Menu Service

Quản lý menu state

### Loader Service

Asset loading utilities

### Config Merge Service

Configuration merging utilities

## Best Practices

### 1. Error Handling

```typescript
// Luôn handle errors trong service calls
this.apiService.get("/api/data").subscribe({
  next: (data) => {
    // Handle success
  },
  error: (error) => {
    console.error("API Error:", error);
    // Show user-friendly error message
    this.notificationService.showError("Có lỗi xảy ra khi tải dữ liệu");
  },
});
```

### 2. Memory Management

```typescript
// Unsubscribe để tránh memory leaks
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.apiService
      .get("/api/data")
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // Handle data
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. Caching Strategy

```typescript
// Cache cho data ít thay đổi
getCategories() {
  return this.apiService.get<Category[]>('/api/categories', null, true);
}

// Không cache cho data thay đổi thường xuyên
getUserProfile() {
  return this.apiService.get<User>('/api/user/profile', null, false);
}
```

### 4. Type Safety

```typescript
// Luôn sử dụng TypeScript interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Type-safe service calls
getProduct(id: number): Observable<Product> {
  return this.apiService.getById<Product>('/api/products', id);
}
```

## Common Errors & Solutions

### 1. Cache Memory Issues

**Lỗi**: OutOfMemoryError do cache quá lớn
**Khắc phục**:

- Giảm cache size limit
- Implement proper TTL
- Clear cache định kỳ

### 2. SSR Errors

**Lỗi**: localStorage/sessionStorage not defined
**Khắc phục**: Sử dụng platform-safe services

```typescript
// BAD
localStorage.setItem("key", "value");

// GOOD
this.localStorageService.setItem("key", "value");
```

### 3. SEO Meta Tags Not Updating

**Lỗi**: Meta tags không update trong SPA
**Khắc phục**:

- Call setData() trong ngOnInit của mỗi route
- Ensure proper cleanup

### 4. API Request Timeout

**Lỗi**: Request timeout trong slow network
**Khắc phục**:

- Increase timeout trong config
- Implement retry logic
- Show loading indicators

## Testing

```typescript
// Testing services với mocks
describe("ApiService", () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ENVIRONMENT, useValue: { apiUrl: "test" } },
        { provide: APP_NAME, useValue: "Test App" },
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should get data", () => {
    const mockData = [{ id: 1, name: "Test" }];

    service.get("/api/test").subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne("/api/test");
    expect(req.request.method).toBe("GET");
    req.flush(mockData);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

## Performance Optimization

### 1. Lazy Loading

```typescript
// Lazy load services khi cần
const { SeoService } = await import("@cci-web/core/services");
```

### 2. Request Debouncing

```typescript
// Debounce search requests
searchProducts(term: string) {
  return this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.apiService.get(`/api/search?q=${term}`))
  );
}
```

### 3. Caching Strategy

```typescript
// Smart caching based on data type
getStaticData() {
  return this.apiService.get('/api/static', null, true); // Cache enabled
}

getDynamicData() {
  return this.apiService.get('/api/dynamic', null, false); // No cache
}
```

---

_Tài liệu này được cập nhật cho phiên bản mới nhất của @cci-web/core_
