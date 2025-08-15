# Hướng dẫn xử lý lỗi thường gặp

## Lỗi Import Module

**Lỗi**: `Cannot find module '@core/providers'`

**Nguyên nhân**: Chưa cấu hình TypeScript paths đúng

**Giải pháp**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["projects/cci-web/core/src/lib/*"],
      "@shared/*": ["projects/cci-web/shared/src/lib/*"],
      "@server/*": ["projects/cci-web/server/src/lib/*"]
    }
  }
}
```

## Lỗi Dependency Injection

**Lỗi**: `No provider for APP_CONFIG`

**Nguyên nhân**: Chưa import provideCciWebCore trong app.config.ts

**Giải pháp**:

```typescript
// app.config.ts
import { provideCciWebCore } from "@core/providers";

export const appConfig: ApplicationConfig = {
  providers: [
    provideCciWebCore({
      appName: "your-app",
      // ... other config
    }),
  ],
};
```

## Lỗi HTTP Interceptor

**Lỗi**: `HTTP interceptor not working`

**Nguyên nhân**: Interceptors không được đăng ký đúng cách

**Giải pháp**:

```typescript
// Đảm bảo sử dụng provideCciWebCore sẽ tự động đăng ký interceptors
// Hoặc đăng ký thủ công:
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor, errorInterceptor } from "@core/interceptors";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ],
};
```

## Lỗi SSR

**Lỗi**: `ReferenceError: window is not defined`

**Nguyên nhân**: Sử dụng browser APIs trong server-side code

**Giải pháp**:

```typescript
import { isPlatformBrowser } from "@angular/common";
import { PLATFORM_ID, Inject } from "@angular/core";

@Injectable()
export class MyService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  someMethod() {
    if (isPlatformBrowser(this.platformId)) {
      // Browser-specific code
      const width = window.innerWidth;
    }
  }
}
```

## Lỗi Build Production

**Lỗi**: `Cannot resolve all parameters for...`

**Nguyên nhân**: Missing decorators hoặc circular dependencies

**Giải pháp**:

```typescript
// Đảm bảo tất cả services có @Injectable() decorator
@Injectable({
  providedIn: "root",
})
export class MyService {
  constructor(private http: HttpClient) {}
}

// Tránh circular dependencies bằng cách sử dụng forwardRef
import { forwardRef } from "@angular/core";

@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB
  ) {}
}
```

## Lỗi Memory Leak

**Lỗi**: Memory leaks trong subscriptions

**Giải pháp**:

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({...})
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Lỗi Performance

**Lỗi**: Ứng dụng chạy chậm

**Nguyên nhân**: Không sử dụng OnPush change detection, không lazy load modules

**Giải pháp**:

```typescript
// Sử dụng OnPush change detection
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class MyComponent {}

// Lazy load modules
export const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
  }
];
```

## Lỗi CORS

**Lỗi**: `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`

**Nguyên nhân**: Server không cấu hình CORS đúng

**Giải pháp**:

```typescript
// Trong development, sử dụng proxy
// angular.json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}

// proxy.conf.json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": true,
    "changeOrigin": true
  }
}
```

## Lỗi Bundle Size

**Lỗi**: Bundle size quá lớn

**Giải pháp**:

```typescript
// Sử dụng tree shaking
// Import chỉ những gì cần thiết
import { map } from 'rxjs/operators';
// Thay vì
// import * as rxjs from 'rxjs';

// Lazy load modules
// Sử dụng dynamic imports
const module = await import('./heavy-module');

// Optimize build
// angular.json
{
  "build": {
    "options": {
      "optimization": true,
      "buildOptimizer": true,
      "vendorChunk": true,
      "commonChunk": true
    }
  }
}
```

## Lỗi Testing

**Lỗi**: Tests failing với dependency injection

**Giải pháp**:

```typescript
// Provide mocks trong testing
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: MyService, useValue: mockService },
      { provide: APP_CONFIG, useValue: mockConfig }
    ]
  });
});

// Sử dụng HttpClientTestingModule
import { HttpClientTestingModule } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  });
});
```

## Công cụ Debug

### Angular DevTools

1. Cài đặt Angular DevTools extension
2. Mở Developer Tools
3. Chọn tab "Angular"
4. Kiểm tra component tree, profiler, và router

### Console Logging

```typescript
// Sử dụng logging service
import { LoggerService } from '@core/services';

@Injectable()
export class MyService {
  constructor(private logger: LoggerService) {}

  someMethod() {
    this.logger.debug('Debug message');
    this.logger.error('Error message');
  }
}
```

### Network Debugging

```typescript
// Sử dụng HTTP interceptor để log requests
import { HttpInterceptor } from '@angular/common/http';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('HTTP Request:', req);
    return next.handle(req).pipe(
      tap(response => console.log('HTTP Response:', response))
    );
  }
}
```