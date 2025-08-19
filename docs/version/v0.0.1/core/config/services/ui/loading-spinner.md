# Loading Spinner Service - Quản lý trạng thái loading

## Giới thiệu

Loading Spinner Service cung cấp hệ thống quản lý trạng thái loading toàn cục cho ứng dụng Angular. Service này cho phép hiển thị và ẩn loading spinner từ bất kỳ đâu trong ứng dụng, với observable stream để components có thể phản ứng với thay đổi trạng thái loading.

## Tính năng chính

- **Global Loading State**: Quản lý trạng thái loading toàn cục
- **Observable Stream**: Cung cấp observable để components subscribe
- **Simple API**: API đơn giản với show() và hide() methods
- **Memory Management**: Extends UnsubscribeOnDestroyAdapter để tự động cleanup
- **Type Safety**: TypeScript support với proper typing

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `loading$` | `Observable<boolean>` | Observable stream của loading state |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `show()` | `show(): void` | Hiển thị loading spinner |
| `hide()` | `hide(): void` | Ẩn loading spinner |

## Implementation Details

### Service Implementation

```typescript
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UnsubscribeOnDestroyAdapter } from '../utils/unsubscribe-on-destroy.adapter';

@Injectable({
  providedIn: "root"
})
export class LoadingSpinnerService extends UnsubscribeOnDestroyAdapter {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  constructor() {
    super();
  }

  show() {
    this._loading.next(true);
  }

  hide() {
    this._loading.next(false);
  }
}
```

### UnsubscribeOnDestroyAdapter

Service extends `UnsubscribeOnDestroyAdapter` để tự động quản lý subscriptions và tránh memory leaks.

## Cách sử dụng

### Basic Usage trong Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingSpinnerService } from '@cci-web/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-data-component',
  template: `
    <div class="container">
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
      
      <div *ngIf="!isLoading" class="content">
        <h2>Data Content</h2>
        <button (click)="loadData()">Load Data</button>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DataComponent implements OnInit, OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private loadingSpinnerService: LoadingSpinnerService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // Subscribe to loading state
    this.loadingSpinnerService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  loadData() {
    // Show loading
    this.loadingSpinnerService.show();
    
    this.dataService.getData().subscribe({
      next: (data) => {
        // Process data
        console.log('Data loaded:', data);
        // Hide loading
        this.loadingSpinnerService.hide();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        // Hide loading on error
        this.loadingSpinnerService.hide();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Sử dụng với Async Pipe

```typescript
@Component({
  selector: 'app-async-loading',
  template: `
    <div class="container">
      <!-- Loading overlay với async pipe -->
      <div *ngIf="loadingSpinnerService.loading$ | async" class="loading-overlay">
        <mat-spinner></mat-spinner>
        <p>Please wait...</p>
      </div>
      
      <!-- Content -->
      <div class="content" [class.blur]="loadingSpinnerService.loading$ | async">
        <h2>Application Content</h2>
        <button (click)="performAction()">Perform Action</button>
      </div>
    </div>
  `,
  styles: [`
    .blur {
      filter: blur(2px);
      pointer-events: none;
    }
  `]
})
export class AsyncLoadingComponent {
  constructor(
    public loadingSpinnerService: LoadingSpinnerService,
    private actionService: ActionService
  ) {}

  performAction() {
    this.loadingSpinnerService.show();
    
    this.actionService.performLongRunningAction()
      .pipe(
        finalize(() => this.loadingSpinnerService.hide())
      )
      .subscribe(result => {
        console.log('Action completed:', result);
      });
  }
}
```

### Sử dụng trong Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinnerService } from '@cci-web/core';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private loadingSpinnerService: LoadingSpinnerService
  ) {}

  getData(): Observable<any> {
    this.loadingSpinnerService.show();
    
    return this.http.get('/api/data').pipe(
      finalize(() => this.loadingSpinnerService.hide())
    );
  }

  saveData(data: any): Observable<any> {
    this.loadingSpinnerService.show();
    
    return this.http.post('/api/data', data).pipe(
      finalize(() => this.loadingSpinnerService.hide())
    );
  }

  // Method với custom loading message
  performComplexOperation(): Observable<any> {
    this.loadingSpinnerService.show();
    
    return this.http.post('/api/complex-operation', {}).pipe(
      finalize(() => {
        // Delay hide để user có thể thấy completion
        setTimeout(() => {
          this.loadingSpinnerService.hide();
        }, 500);
      })
    );
  }
}
```

### Global Loading Component

```typescript
@Component({
  selector: 'app-global-loading',
  template: `
    <div *ngIf="loadingSpinnerService.loading$ | async" 
         class="global-loading-overlay"
         [@fadeInOut]>
      <div class="loading-content">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(3px);
    }
    
    .loading-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .loading-text {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class GlobalLoadingComponent {
  loadingMessage = 'Loading...';

  constructor(public loadingSpinnerService: LoadingSpinnerService) {}
}
```

### HTTP Interceptor Integration

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingSpinnerService } from '@cci-web/core';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingSpinnerService: LoadingSpinnerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain requests
    if (request.headers.has('X-Skip-Loading')) {
      return next.handle(request);
    }

    // Increment active requests
    this.activeRequests++;
    
    // Show loading if this is the first request
    if (this.activeRequests === 1) {
      this.loadingSpinnerService.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        // Decrement active requests
        this.activeRequests--;
        
        // Hide loading if no more active requests
        if (this.activeRequests === 0) {
          this.loadingSpinnerService.hide();
        }
      })
    );
  }
}
```

## Advanced Usage Patterns

### Loading với Timeout

```typescript
@Injectable({
  providedIn: 'root'
})
export class EnhancedLoadingService {
  private loadingTimeout: any;

  constructor(private loadingSpinnerService: LoadingSpinnerService) {}

  showWithTimeout(timeoutMs: number = 30000) {
    this.loadingSpinnerService.show();
    
    // Auto hide after timeout
    this.loadingTimeout = setTimeout(() => {
      this.loadingSpinnerService.hide();
      console.warn('Loading timeout reached');
    }, timeoutMs);
  }

  hide() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    this.loadingSpinnerService.hide();
  }
}
```

### Loading Counter Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class LoadingCounterService {
  private loadingCounter = 0;

  constructor(private loadingSpinnerService: LoadingSpinnerService) {}

  increment() {
    this.loadingCounter++;
    if (this.loadingCounter === 1) {
      this.loadingSpinnerService.show();
    }
  }

  decrement() {
    this.loadingCounter = Math.max(0, this.loadingCounter - 1);
    if (this.loadingCounter === 0) {
      this.loadingSpinnerService.hide();
    }
  }

  reset() {
    this.loadingCounter = 0;
    this.loadingSpinnerService.hide();
  }

  get isLoading(): boolean {
    return this.loadingCounter > 0;
  }
}
```

### Loading với Progress

```typescript
@Injectable({
  providedIn: 'root'
})
export class ProgressLoadingService {
  private progressSubject = new BehaviorSubject<number>(0);
  public progress$ = this.progressSubject.asObservable();

  constructor(private loadingSpinnerService: LoadingSpinnerService) {}

  startWithProgress() {
    this.loadingSpinnerService.show();
    this.progressSubject.next(0);
  }

  updateProgress(progress: number) {
    this.progressSubject.next(Math.min(100, Math.max(0, progress)));
  }

  complete() {
    this.progressSubject.next(100);
    setTimeout(() => {
      this.loadingSpinnerService.hide();
      this.progressSubject.next(0);
    }, 500);
  }
}
```

## Best Practices

### 1. Always Hide Loading

```typescript
// ✅ Good - Always hide loading
performAction() {
  this.loadingSpinnerService.show();
  
  this.apiService.getData().pipe(
    finalize(() => this.loadingSpinnerService.hide())
  ).subscribe({
    next: (data) => {
      // Process data
    },
    error: (error) => {
      // Handle error
    }
  });
}

// ❌ Bad - Might not hide on error
performAction() {
  this.loadingSpinnerService.show();
  
  this.apiService.getData().subscribe({
    next: (data) => {
      this.loadingSpinnerService.hide();
    },
    error: (error) => {
      // Loading not hidden!
    }
  });
}
```

### 2. Use Async Pipe When Possible

```typescript
// ✅ Good - Async pipe handles subscription automatically
@Component({
  template: `
    <div *ngIf="loadingSpinnerService.loading$ | async">
      Loading...
    </div>
  `
})
export class MyComponent {
  constructor(public loadingSpinnerService: LoadingSpinnerService) {}
}
```

### 3. Proper Unsubscription

```typescript
// ✅ Good - Proper cleanup
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadingSpinnerService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        // Handle loading state
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Integration với Material Design

```typescript
@Component({
  selector: 'app-material-loading',
  template: `
    <div *ngIf="loadingSpinnerService.loading$ | async" class="loading-container">
      <mat-progress-spinner 
        mode="indeterminate" 
        diameter="50"
        strokeWidth="4">
      </mat-progress-spinner>
      <p class="loading-message">Please wait...</p>
    </div>
  `,
  styles: [`
    .loading-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      z-index: 1000;
    }
  `]
})
export class MaterialLoadingComponent {
  constructor(public loadingSpinnerService: LoadingSpinnerService) {}
}
```

## Performance Considerations

- **Single Instance**: Service được provide ở root level
- **Memory Management**: Extends UnsubscribeOnDestroyAdapter
- **Efficient Updates**: Sử dụng BehaviorSubject cho immediate state
- **Minimal DOM Impact**: Chỉ render loading UI khi cần thiết

## Troubleshooting

### Common Issues

1. **Loading không ẩn**
   - Đảm bảo gọi hide() trong finalize() operator
   - Kiểm tra error handling

2. **Multiple loading states**
   - Sử dụng loading counter pattern
   - Implement request tracking

3. **Memory leaks**
   - Service tự động cleanup nhờ UnsubscribeOnDestroyAdapter
   - Đảm bảo proper unsubscription trong components

## Dependencies

- `rxjs` - BehaviorSubject, Observable
- `UnsubscribeOnDestroyAdapter` - Memory management utility

## Tóm tắt

Loading Spinner Service cung cấp giải pháp đơn giản và hiệu quả để quản lý trạng thái loading toàn cục trong ứng dụng Angular. Với API đơn giản và tích hợp tốt với RxJS, service này giúp cải thiện user experience bằng cách cung cấp feedback visual cho các operations bất đồng bộ.