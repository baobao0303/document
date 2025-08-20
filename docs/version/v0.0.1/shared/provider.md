# Providers Module - CCI Web Shared Library

Module providers cung cấp các injection token và provider functions để quản lý dependency injection trong ứng dụng Angular.

## Tổng quan

Module này chứa các provider và injection token cho:

- Quản lý môi trường (Environment)
- Responsive breakpoints
- Loading spinner
- Overlay components

## Tóm tắt nhanh

| STT | Tên                             | Loại       | Mô tả ngắn                                            |
| --- | ------------------------------- | ---------- | ----------------------------------------------------- |
| 1   | `SHARED_ENVIRONMENT`            | Token      | Cấu hình môi trường cho shared (cdnUrl, apiUrl, …)    |
| 2   | `provideSharedEnvironment(env)` | ProviderFn | Đăng ký giá trị `SHARED_ENVIRONMENT`                  |
| 3   | `BREAKPOINT_PORT`               | Token      | Cung cấp `breakpointsResult$: Observable<{L,XL,XXL}>` |
| 4   | `LOADING_SPINNER_PORT`          | Token      | Cung cấp `loading$: Observable<boolean>`              |

Ví dụ cấu hình environment:

```typescript
providers: [
  provideSharedEnvironment({
    production: false,
    cdnUrl: "https://cdn.example.com",
    apiUrl: "https://api.example.com",
  }),
];
```

## Cấu trúc thư mục

```
providers/
├── README.md                    # Tài liệu này
├── shared.provider.ts           # Environment providers
└── breakpoint.provider.ts       # Breakpoint providers
```

## Providers

### SharedProvider

Provider quản lý cấu hình môi trường cho thư viện shared.

#### Interfaces

```typescript
export interface ISharedEnvironment {
  production: boolean;
  cdnUrl: string;
  apiUrl: string;
  [key: string]: any;
}
```

#### Injection Tokens

```typescript
// Token chung cho shared library
export const SHARED_TOKEN = new InjectionToken<string>("SHARED_TOKEN");

// Token cho environment configuration
export const SHARED_ENVIRONMENT = new InjectionToken<ISharedEnvironment>("SHARED_ENVIRONMENT");
```

#### Provider Functions

```typescript
// Tạo provider cho shared environment
export function provideSharedEnvironment(environment: ISharedEnvironment): Provider {
  return {
    provide: SHARED_ENVIRONMENT,
    useValue: environment,
  };
}
```

#### Cách sử dụng

```typescript
import { provideSharedEnvironment, SHARED_ENVIRONMENT, ISharedEnvironment } from "@cci-web/shared";

// Trong app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideSharedEnvironment({
      production: false,
      cdnUrl: "https://cdn.example.com",
      apiUrl: "https://api.example.com",
      customProperty: "custom-value",
    }),
    // other providers...
  ],
};

// Trong component/service
@Component({
  // component config
})
export class MyComponent {
  constructor(@Inject(SHARED_ENVIRONMENT) private env: ISharedEnvironment) {
    console.log("API URL:", this.env.apiUrl);
    console.log("CDN URL:", this.env.cdnUrl);
    console.log("Is Production:", this.env.production);
  }
}
```

### BreakpointProvider

Provider quản lý responsive breakpoints cho ứng dụng.

#### Interfaces

```typescript
export interface Breakpoints {
  L: number; // Large screens
  XL: number; // Extra large screens
  XXL: number; // Extra extra large screens
}

export interface BreakpointPort {
  breakpointsResult$: Observable<Breakpoints>;
}
```

#### Injection Token

```typescript
export const BREAKPOINT_PORT = new InjectionToken<BreakpointPort>("BREAKPOINT_PORT");
```

#### Sử dụng

```typescript
import { BREAKPOINT_PORT, BreakpointPort } from "@cci-web/shared";

@Component({
  // component config
})
export class ResponsiveComponent implements OnInit {
  constructor(@Optional() @Inject(BREAKPOINT_PORT) private breakpointService?: BreakpointPort) {}

  ngOnInit(): void {
    this.breakpointService?.breakpointsResult$.subscribe((breakpoints) => {
      console.log("Current breakpoints:", breakpoints);
      // Xử lý responsive logic
      if (window.innerWidth >= breakpoints.XL) {
        // Logic cho màn hình lớn
      } else if (window.innerWidth >= breakpoints.L) {
        // Logic cho màn hình trung bình
      }
    });
  }
}
```

## Component Providers

### LoadingSpinnerProvider

Provider cho loading spinner component (nằm trong components/loading-spinner/).

#### Interface

```typescript
export interface LoadingSpinnerPort {
  loading$: Observable<boolean>;
}
```

#### Injection Token

```typescript
export const LOADING_SPINNER_PORT = new InjectionToken<LoadingSpinnerPort>("LOADING_SPINNER_PORT");
```

#### Sử dụng

```typescript
import { LOADING_SPINNER_PORT, LoadingSpinnerPort } from "@cci-web/shared";

@Injectable()
export class LoadingService implements LoadingSpinnerPort {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  showLoading(): void {
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.loadingSubject.next(false);
  }
}

// Trong app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOADING_SPINNER_PORT,
      useClass: LoadingService,
    },
    // other providers...
  ],
};
```

### OverlayProvider

Provider cho overlay component (nằm trong components/overlay/).

#### Interface

```typescript
export interface OverlayPort {
  isOverlay$: Observable<boolean>;
  onShowOverlay(scope: string): void;
  onHiddenOverlay(scope: string): void;
}
```

#### Injection Token

```typescript
export const OVERLAY_PORT = new InjectionToken<OverlayPort>("OVERLAY_PORT");
```

#### Sử dụng

```typescript
import { OVERLAY_PORT, OverlayPort } from "@cci-web/shared";

@Injectable()
export class OverlayService implements OverlayPort {
  private overlaySubject = new BehaviorSubject<boolean>(false);
  isOverlay$ = this.overlaySubject.asObservable();

  onShowOverlay(scope: string): void {
    console.log(`Showing overlay for scope: ${scope}`);
    this.overlaySubject.next(true);
  }

  onHiddenOverlay(scope: string): void {
    console.log(`Hiding overlay for scope: ${scope}`);
    this.overlaySubject.next(false);
  }
}

// Trong app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: OVERLAY_PORT,
      useClass: OverlayService,
    },
    // other providers...
  ],
};
```

## Port-based Architecture

Tất cả providers trong module này sử dụng kiến trúc port-based (hexagonal architecture) để:

1. **Tách biệt interface và implementation**: Định nghĩa contract thông qua interface, implementation có thể thay đổi
2. **Dependency Inversion**: High-level modules không phụ thuộc vào low-level modules
3. **Testability**: Dễ dàng mock và test các dependencies
4. **Flexibility**: Có thể swap implementation mà không ảnh hưởng đến code sử dụng

### Ví dụ về Port Pattern

```typescript
// Port (Interface)
export interface DataPort {
  getData$: Observable<any[]>;
  saveData(data: any): Observable<void>;
}

// Adapter (Implementation)
@Injectable()
export class HttpDataAdapter implements DataPort {
  constructor(private http: HttpClient) {}

  getData$: Observable<any[]> {
    return this.http.get<any[]>('/api/data');
  }

  saveData(data: any): Observable<void> {
    return this.http.post<void>('/api/data', data);
  }
}

// Mock Adapter (for testing)
@Injectable()
export class MockDataAdapter implements DataPort {
  getData$ = of([{ id: 1, name: 'Test' }]);

  saveData(data: any): Observable<void> {
    return of(void 0);
  }
}
```

## Thực hành tốt nhất

### 1. Cấu hình môi trường

```typescript
// Tốt: Sử dụng interface để type-safe
const environment: ISharedEnvironment = {
  production: true,
  cdnUrl: "https://cdn.production.com",
  apiUrl: "https://api.production.com",
  version: "1.0.0",
};

// Tránh: Hardcode values
const badConfig = {
  prod: true, // không consistent với interface
  url: "some-url", // thiếu type safety
};
```

### 2. Injection tùy chọn

```typescript
// Tốt: Sử dụng @Optional() cho providers có thể không có
constructor(
  @Optional() @Inject(BREAKPOINT_PORT) private breakpoints?: BreakpointPort
) {
  if (this.breakpoints) {
    // Sử dụng service
  }
}

// Tránh: Inject bắt buộc khi có thể không có provider
constructor(
  @Inject(BREAKPOINT_PORT) private breakpoints: BreakpointPort // Có thể throw error
) {}
```

### 3. Xử lý lỗi

```typescript
// Tốt: Handle errors trong Observable streams
this.loadingService?.loading$
  .pipe(
    catchError((error) => {
      console.error("Loading state error:", error);
      return of(false); // fallback value
    })
  )
  .subscribe((isLoading) => {
    // Handle loading state
  });
```

### 4. Quản lý bộ nhớ

```typescript
// Tốt: Unsubscribe để tránh memory leaks
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.overlayService?.isOverlay$.pipe(takeUntil(this.destroy$)).subscribe((isVisible) => {
      // Handle overlay state
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Kiểm thử

### Kiểm thử đơn vị Providers

```typescript
describe("SharedProvider", () => {
  let provider: Provider;
  let environment: ISharedEnvironment;

  beforeEach(() => {
    environment = {
      production: false,
      cdnUrl: "https://test-cdn.com",
      apiUrl: "https://test-api.com",
    };

    provider = provideSharedEnvironment(environment);
  });

  it("should create provider with correct configuration", () => {
    expect(provider.provide).toBe(SHARED_ENVIRONMENT);
    expect(provider.useValue).toEqual(environment);
  });
});
```

### Kiểm thử tích hợp

```typescript
describe("Component with Providers", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let mockBreakpointService: jasmine.SpyObj<BreakpointPort>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj("BreakpointPort", [], {
      breakpointsResult$: of({ L: 768, XL: 1024, XXL: 1440 }),
    });

    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [{ provide: BREAKPOINT_PORT, useValue: spy }],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    mockBreakpointService = TestBed.inject(BREAKPOINT_PORT) as jasmine.SpyObj<BreakpointPort>;
  });

  it("should handle breakpoint changes", () => {
    fixture.detectChanges();

    expect(component.currentBreakpoints).toEqual({
      L: 768,
      XL: 1024,
      XXL: 1440,
    });
  });
});
```

## Khắc phục sự cố

### Lỗi thường gặp

1. **Provider not found**

   ```
   Error: No provider for InjectionToken SHARED_ENVIRONMENT
   ```

   **Giải pháp**: Đảm bảo đã provide token trong app.config.ts

2. **Circular dependency**

   ```
   Error: Cannot instantiate cyclic dependency
   ```

   **Giải pháp**: Sử dụng forwardRef() hoặc tái cấu trúc dependencies

3. **Type mismatch**
   ```
   Error: Type 'X' is not assignable to type 'Y'
   ```
   **Giải pháp**: Đảm bảo implementation tuân thủ đúng interface

### Mẹo Debug

```typescript
// Log provider injection để debug
constructor(
  @Inject(SHARED_ENVIRONMENT) private env: ISharedEnvironment
) {
  console.log('Injected environment:', this.env);
}

// Kiểm tra provider có tồn tại
constructor(
  @Optional() @Inject(BREAKPOINT_PORT) private breakpoints?: BreakpointPort
) {
  if (!this.breakpoints) {
    console.warn('BreakpointPort not provided');
  }
}
```

## Kết luận

Module providers cung cấp foundation cho dependency injection trong CCI Web Shared Library, sử dụng:

- **Port-based architecture** cho flexibility và testability
- **Type-safe interfaces** cho development experience tốt hơn
- **Optional injection** cho graceful degradation
- **Environment configuration** cho multi-environment support

Việc sử dụng đúng các patterns này sẽ giúp ứng dụng dễ maintain, test và scale.
