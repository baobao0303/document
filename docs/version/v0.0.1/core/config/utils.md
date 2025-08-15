# Utils Module - @cci-web/core

Module utils cung cấp các utility functions và helper classes để hỗ trợ phát triển ứng dụng Angular, bao gồm subscription management, preloading strategies, carousel helpers và federation utilities.

## Danh sách Utilities

### 1. Unsubscribe On Destroy Adapter (`unsubscribe-on-destroy.adapter.ts`)

**Mục đích**: Base class để tự động unsubscribe tất cả observables khi component bị destroy

**Cách sử dụng**:

```typescript
import { UnsubscribeOnDestroyAdapter } from "@cci-web/core/utils";
import { Component } from "@angular/core";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-my-component",
  template: `<div>My Component</div>`,
})
export class MyComponent extends UnsubscribeOnDestroyAdapter {
  ngOnInit() {
    // Cách 1: Sử dụng SubSink
    this.subs.sink = this.dataService.getData().subscribe((data) => {
      console.log(data);
    });

    // Cách 2: Sử dụng takeUntil với destroy$
    this.apiService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        console.log(users);
      });

    // Cách 3: Add multiple subscriptions
    this.subs.add(
      this.service1.getData().subscribe(),
      this.service2.getData().subscribe(),
      this.service3.getData().subscribe()
    );
  }

  // ngOnDestroy sẽ được tự động gọi từ base class
  // Tất cả subscriptions sẽ được unsubscribe tự động
}
```

**Ưu điểm**:

- Tự động prevent memory leaks
- Giảm boilerplate code
- Cung cấp nhiều cách để manage subscriptions
- Type-safe với TypeScript

**Performance Considerations**:

- Luôn extend class này cho components có subscriptions
- Không cần implement ngOnDestroy manually
- Sử dụng takeUntil cho complex observable chains

### 2. SubSink (`sub-sink.ts`)

**Mục đích**: Utility class để quản lý multiple subscriptions một cách hiệu quả

**Cách sử dụng**:

```typescript
import { SubSink } from "@cci-web/core/utils";
import { Component, OnDestroy } from "@angular/core";

@Component({})
export class MyComponent implements OnDestroy {
  private subs = new SubSink();

  ngOnInit() {
    // Cách 1: Sử dụng sink property
    this.subs.sink = this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });

    this.subs.sink = this.productService.getProducts().subscribe((products) => {
      this.products = products;
    });

    // Cách 2: Sử dụng add method
    this.subs.add(
      this.notificationService.getNotifications().subscribe(),
      this.settingsService.getSettings().subscribe(),
      this.themeService.themeChanges$.subscribe()
    );

    // Cách 3: Add từng subscription riêng lẻ
    const userSub = this.userService.getCurrentUser().subscribe();
    const dataSub = this.dataService.loadData().subscribe();
    this.subs.add(userSub, dataSub);
  }

  ngOnDestroy() {
    // Unsubscribe tất cả subscriptions cùng lúc
    this.subs.unsubscribe();
  }
}
```

**API Methods**:

- `sink`: Setter để add single subscription
- `add(...subscriptions)`: Add multiple subscriptions
- `unsubscribe()`: Unsubscribe tất cả và clear array

**Best Practices**:

- Luôn call unsubscribe() trong ngOnDestroy
- Sử dụng add() cho multiple subscriptions cùng lúc
- Combine với UnsubscribeOnDestroyAdapter để tự động hóa

### 3. Federation Utils (`federation-utils.ts`)

**Mục đích**: Utilities để làm việc với Module Federation trong micro-frontend architecture

**Cách sử dụng**:

```typescript
import { fetchFederationManifest } from "@cci-web/core/utils";

@Component({})
export class AppComponent {
  async ngOnInit() {
    try {
      // Load federation manifest từ remote URL
      const manifest = await fetchFederationManifest();
      console.log("Federation manifest:", manifest);

      // Sử dụng manifest để load remote modules
      this.loadRemoteModules(manifest);
    } catch (error) {
      console.error("Failed to load federation manifest:", error);
      // Fallback logic
      this.loadDefaultModules();
    }
  }

  private loadRemoteModules(manifest: any) {
    // Logic để load remote modules dựa trên manifest
    Object.keys(manifest.remotes).forEach((remoteName) => {
      const remoteConfig = manifest.remotes[remoteName];
      // Load remote module
    });
  }

  private loadDefaultModules() {
    // Fallback khi không load được manifest
    console.log("Loading default modules...");
  }
}
```

**Features**:

- Cross-platform support (Browser & Node.js)
- Error handling với meaningful messages
- Promise-based API
- Environment detection

**Error Handling**:

```typescript
try {
  const manifest = await fetchFederationManifest();
  // Success logic
} catch (error) {
  if (error.message.includes("status")) {
    // HTTP error
    console.error("Network error:", error);
  } else if (error.message.includes("environment")) {
    // Environment error
    console.error("Environment not supported:", error);
  } else {
    // Other errors
    console.error("Unknown error:", error);
  }
}
```

### 4. Flag-Based Preloading Strategy (`flag-based-preloading.strategy.ts`)

**Mục đích**: Custom preloading strategy cho Angular Router để selective preload modules

**Cách sử dụng**:

```typescript
import { FlagBasedPreloadingStrategy } from "@cci-web/core/utils";
import { RouterModule } from "@angular/router";

// 1. Configure trong app routing
const routes: Routes = [
  {
    path: "products",
    loadChildren: () => import("./products/products.module").then((m) => m.ProductsModule),
    data: { preload: true }, // Sẽ được preload
  },
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.module").then((m) => m.AdminModule),
    data: { preload: false }, // Không preload
  },
  {
    path: "reports",
    loadChildren: () => import("./reports/reports.module").then((m) => m.ReportsModule),
    // Không có preload flag = không preload
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: FlagBasedPreloadingStrategy,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

// 2. Hoặc provide trong app config
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(FlagBasedPreloadingStrategy))],
};
```

**Dynamic Preloading**:

```typescript
// Service để control preloading dynamically
@Injectable()
export class PreloadControlService {
  private preloadFlags = new Map<string, boolean>();

  setPreloadFlag(route: string, shouldPreload: boolean) {
    this.preloadFlags.set(route, shouldPreload);
  }

  shouldPreload(route: string): boolean {
    return this.preloadFlags.get(route) ?? false;
  }
}

// Custom strategy với dynamic control
@Injectable()
export class DynamicPreloadingStrategy extends PreloadingStrategy {
  constructor(private preloadControl: PreloadControlService) {
    super();
  }

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const shouldPreload = route.data?.["preload"] === true || this.preloadControl.shouldPreload(route.path);
    return shouldPreload ? load() : of(null);
  }
}
```

**Performance Benefits**:

- Giảm initial bundle size
- Faster initial page load
- Selective preloading based on user behavior
- Better user experience

### 5. Base Owl Carousel Helper (`base-owl-carousel.helper.ts`)

**Mục đích**: Helper functions để configure ngx-owl-carousel với responsive settings

**Cách sử dụng**:

```typescript
import { baseOwlOption, onDraggingToStopLink } from "@cci-web/core/utils";
import { OwlOptions } from "ngx-owl-carousel-o";

@Component({
  template: `
    <owl-carousel-o [options]="carouselOptions" (dragging)="onDragging($event)">
      <ng-slide *ngFor="let product of products">
        <div class="product-card">
          <a [href]="product.url" (click)="onProductClick($event, product)">
            <img [src]="product.image" [alt]="product.name" />
            <h3>{{ product.name }}</h3>
          </a>
        </div>
      </ng-slide>
    </owl-carousel-o>
  `,
})
export class ProductCarouselComponent {
  products: Product[] = [];
  draggingState = { isDragging: false, clearTimeEvent: null };

  // Cấu hình carousel với responsive breakpoints
  carouselOptions: OwlOptions = baseOwlOption(
    {
      items: {
        L: 1, // Mobile: 1 item
        XL: 3, // Desktop: 3 items
        XXL: 4, // Large desktop: 4 items
      },
      loop: {
        L: true,
        XL: true,
        XXL: true,
      },
      margin: {
        L: 10, // Mobile: 10px margin
        XL: 20, // Desktop: 20px margin
        XXL: 30, // Large desktop: 30px margin
      },
      autoplay: {
        L: false, // No autoplay on mobile
        XL: true, // Autoplay on desktop
        XXL: true,
      },
      autoplayTimeout: {
        L: 3000,
        XL: 5000,
        XXL: 5000,
      },
      dots: {
        L: true, // Show dots on mobile
        XL: false, // Hide dots on desktop
        XXL: false,
      },
      nav: {
        L: false, // Hide nav on mobile
        XL: true, // Show nav on desktop
        XXL: true,
      },
    },
    ["‹", "›"]
  ); // Custom nav text

  onDragging(event: any) {
    // Prevent link clicks during dragging
    onDraggingToStopLink(event.dragging, this.draggingState, 300);
  }

  onProductClick(event: Event, product: Product) {
    // Prevent navigation if carousel is being dragged
    if (this.draggingState.isDragging) {
      event.preventDefault();
      return false;
    }
    // Normal click handling
    return true;
  }
}
```

**Advanced Configuration**:

```typescript
// Carousel cho testimonials
testimonialOptions: OwlOptions = baseOwlOption({
  items: { L: 1, XL: 2, XXL: 3 },
  loop: { L: true, XL: true, XXL: true },
  autoplay: { L: true, XL: true, XXL: true },
  autoplayTimeout: { L: 4000, XL: 6000, XXL: 6000 },
  dots: { L: true, XL: true, XXL: true },
  nav: { L: false, XL: false, XXL: false },
  stagePadding: { L: 20, XL: 40, XXL: 60 },
  mouseDrag: { L: true, XL: true, XXL: true },
  touchDrag: { L: true, XL: true, XXL: true },
});

// Carousel cho hero banners
heroOptions: OwlOptions = baseOwlOption(
  {
    items: { L: 1, XL: 1, XXL: 1 },
    loop: { L: true, XL: true, XXL: true },
    autoplay: { L: true, XL: true, XXL: true },
    autoplayTimeout: { L: 5000, XL: 7000, XXL: 7000 },
    dots: { L: true, XL: true, XXL: true },
    nav: { L: false, XL: true, XXL: true },
    autoWidth: { L: false, XL: false, XXL: false },
  },
  ["❮", "❯"]
);
```

**Responsive Breakpoints**:

- `L`: Large mobile and up (≥768px)
- `XL`: Desktop and up (≥1200px)
- `XXL`: Large desktop and up (≥1400px)

## Best Practices

### 1. Memory Management

```typescript
// ✅ GOOD: Sử dụng UnsubscribeOnDestroyAdapter
export class MyComponent extends UnsubscribeOnDestroyAdapter {
  ngOnInit() {
    this.subs.sink = this.service.getData().subscribe();
  }
}

// ❌ BAD: Không unsubscribe
export class BadComponent {
  ngOnInit() {
    this.service.getData().subscribe(); // Memory leak!
  }
}
```

### 2. Error Handling

```typescript
// ✅ GOOD: Proper error handling
async loadFederationConfig() {
  try {
    const manifest = await fetchFederationManifest();
    this.processManifest(manifest);
  } catch (error) {
    console.error('Federation error:', error);
    this.fallbackToLocalConfig();
  }
}

// ❌ BAD: No error handling
async badLoadConfig() {
  const manifest = await fetchFederationManifest(); // Có thể throw error
  this.processManifest(manifest);
}
```

### 3. Performance Optimization

```typescript
// ✅ GOOD: Selective preloading
const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => import("./dashboard/dashboard.module"),
    data: { preload: true }, // Critical route
  },
  {
    path: "settings",
    loadChildren: () => import("./settings/settings.module"),
    data: { preload: false }, // Less critical
  },
];

// ❌ BAD: Preload everything
const badRoutes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => import("./dashboard/dashboard.module"),
    // No selective preloading
  },
];
```

### 4. Carousel Configuration

```typescript
// ✅ GOOD: Responsive configuration
const responsiveCarousel = baseOwlOption({
  items: { L: 1, XL: 3, XXL: 4 }, // Responsive items
  autoplay: { L: false, XL: true, XXL: true }, // No autoplay on mobile
  nav: { L: false, XL: true, XXL: true }, // Touch-friendly on mobile
});

// ❌ BAD: Fixed configuration
const fixedCarousel: OwlOptions = {
  items: 3, // Not responsive
  autoplay: true, // May be annoying on mobile
  nav: true, // May be hard to use on touch devices
};
```

## Performance Considerations

### 1. Subscription Management

- **Memory Usage**: UnsubscribeOnDestroyAdapter giúp prevent memory leaks
- **Performance Impact**: SubSink có overhead nhỏ nhưng đáng giá cho việc quản lý
- **Best Practice**: Luôn unsubscribe trong ngOnDestroy

### 2. Module Federation

- **Network**: fetchFederationManifest tạo HTTP request
- **Caching**: Consider caching manifest để giảm network calls
- **Fallback**: Luôn có fallback strategy khi remote fails

### 3. Preloading Strategy

- **Bundle Size**: Flag-based preloading giúp giảm initial bundle
- **Network**: Preload modules dựa trên user behavior
- **Memory**: Preloaded modules consume memory

### 4. Carousel Performance

- **DOM**: Owl Carousel tạo nhiều DOM elements
- **Images**: Lazy load images trong carousel
- **Touch**: Optimize cho touch devices

## Common Errors & Solutions

### 1. Memory Leaks

**Lỗi**: Component không unsubscribe observables

```typescript
// ❌ Problematic
export class LeakyComponent {
  ngOnInit() {
    this.service.getData().subscribe(); // Never unsubscribed
  }
}

// ✅ Solution
export class SafeComponent extends UnsubscribeOnDestroyAdapter {
  ngOnInit() {
    this.subs.sink = this.service.getData().subscribe();
  }
}
```

### 2. Federation Manifest Loading

**Lỗi**: Network timeout hoặc CORS issues

```typescript
// ✅ Solution với timeout và retry
async loadManifestWithRetry(retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFederationManifest();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Carousel Responsive Issues

**Lỗi**: Carousel không responsive đúng cách

```typescript
// ✅ Solution: Proper breakpoint configuration
const carouselOptions = baseOwlOption({
  items: {
    L: 1, // Mobile first
    XL: 2, // Then tablet
    XXL: 3, // Finally desktop
  },
  // Ensure proper responsive behavior
  responsive: {
    0: { items: 1 },
    768: { items: 2 },
    1200: { items: 3 },
  },
});
```

### 4. Preloading Strategy Not Working

**Lỗi**: Modules không được preload

```typescript
// ✅ Solution: Ensure proper configuration
// 1. Check route data
const routes: Routes = [
  {
    path: "feature",
    loadChildren: () => import("./feature/feature.module"),
    data: { preload: true }, // Must be exactly 'preload: true'
  },
];

// 2. Check router configuration
RouterModule.forRoot(routes, {
  preloadingStrategy: FlagBasedPreloadingStrategy, // Must be provided
});
```

## Testing

### 1. Testing Components với UnsubscribeOnDestroyAdapter

```typescript
describe("MyComponent", () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockService: jasmine.SpyObj<DataService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj("DataService", ["getData"]);

    TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [{ provide: DataService, useValue: spy }],
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  it("should unsubscribe on destroy", () => {
    spyOn(component.subs, "unsubscribe");

    component.ngOnDestroy();

    expect(component.subs.unsubscribe).toHaveBeenCalled();
  });
});
```

### 2. Testing Federation Utils

```typescript
describe("fetchFederationManifest", () => {
  beforeEach(() => {
    spyOn(window, "fetch");
  });

  it("should fetch manifest successfully", async () => {
    const mockManifest = { remotes: {} };
    (window.fetch as jasmine.Spy).and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      })
    );

    const result = await fetchFederationManifest();

    expect(result).toEqual(mockManifest);
  });

  it("should handle fetch errors", async () => {
    (window.fetch as jasmine.Spy).and.returnValue(Promise.reject(new Error("Network error")));

    await expectAsync(fetchFederationManifest()).toBeRejectedWithError(/Error fetching manifest/);
  });
});
```

## Migration Guide

Khi nâng cấp từ phiên bản cũ:

### 1. Subscription Management

```typescript
// Cũ: Manual unsubscribe
export class OldComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(this.service.getData().subscribe());
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

// Mới: Sử dụng UnsubscribeOnDestroyAdapter
export class NewComponent extends UnsubscribeOnDestroyAdapter {
  ngOnInit() {
    this.subs.sink = this.service.getData().subscribe();
  }
}
```

### 2. Carousel Configuration

```typescript
// Cũ: Manual OwlOptions
const oldOptions: OwlOptions = {
  responsive: {
    0: { items: 1 },
    768: { items: 2 },
    1200: { items: 3 },
  },
  loop: true,
  margin: 20,
};

// Mới: Sử dụng baseOwlOption
const newOptions = baseOwlOption({
  items: { L: 1, XL: 2, XXL: 3 },
  loop: { L: true, XL: true, XXL: true },
  margin: { L: 10, XL: 20, XXL: 20 },
});
```

---

_Tài liệu này được cập nhật cho phiên bản mới nhất của @cci-web/core_
