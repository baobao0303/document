# Interceptors Module

Module này chứa các HTTP interceptors để xử lý các request/response trong ứng dụng Angular.

## Tổng quan

Interceptors module cung cấp:
- Duplicate Request Interceptor: Ngăn chặn các request trùng lặp
- Loading Bar Interceptor: Theo dõi trạng thái loading của requests

## Danh sách Interceptors

### 1. Duplicate Request Interceptor

**File**: `duplicate-request.interceptor.ts`

**Mục đích**: Ngăn chặn việc gửi nhiều request GET giống nhau cùng lúc, giúp tối ưu performance và tránh duplicate data.

**Chức năng chính**:
- Chỉ áp dụng cho GET requests
- Cache các pending requests
- Trả về cùng một Observable cho các request trùng lặp
- Tự động cleanup khi request hoàn thành hoặc lỗi

**Quy trình xử lý**:
```
1. Request đến → Kiểm tra method (chỉ GET)
2. Tạo cache key từ URL + params
3. Kiểm tra pending requests cache
4. Nếu đã có → Trả về Observable đang pending
5. Nếu chưa có → Tạo request mới và cache
6. Cleanup cache khi hoàn thành
```

**Cấu trúc code**:
```typescript
export const duplicateRequestInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  // Chỉ áp dụng cho GET requests
  if (request.method !== 'GET') {
    return next(request);
  }

  const cacheKey = generateCacheKey(request);
  
  // Kiểm tra nếu có request đang pending
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Tạo request mới và cache
  const request$ = next(request).pipe(
    take(1),
    catchError(error => {
      pendingRequests.delete(cacheKey);
      throw error;
    }),
    switchMap(response => {
      pendingRequests.delete(cacheKey);
      return of(response);
    })
  );

  pendingRequests.set(cacheKey, request$);
  return request$;
};
```

**Cache Key Generation**:
```typescript
function generateCacheKey(request: HttpRequest<any>): string {
  const url = request.url;
  const params = request.params.toString();
  return `${request.method}:${url}${params ? `?${params}` : ''}`;
}
```

**Cách sử dụng**:

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { duplicateRequestInterceptor } from '@cci-web/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([duplicateRequestInterceptor])
    )
  ]
};

// Trong service
@Injectable()
export class DataService {
  constructor(private http: HttpClient) {}
  
  // Các request này sẽ được deduplicate tự động
  getData() {
    return this.http.get('/api/data');
  }
  
  getDataWithParams(id: string) {
    return this.http.get(`/api/data/${id}`);
  }
}

// Trong component - multiple calls sẽ chỉ tạo 1 HTTP request
@Component({...})
export class MyComponent {
  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    // Chỉ 1 HTTP request được gửi dù có 3 calls
    this.dataService.getData().subscribe(data1 => console.log(data1));
    this.dataService.getData().subscribe(data2 => console.log(data2));
    this.dataService.getData().subscribe(data3 => console.log(data3));
  }
}
```

**Ưu điểm**:
- Giảm số lượng HTTP requests
- Tối ưu bandwidth và server load
- Tự động cleanup, không memory leak
- Transparent cho developers

**Nhược điểm**:
- Chỉ áp dụng cho GET requests
- Có thể gây confusion khi debug network tab
- Cache chỉ tồn tại trong thời gian request pending

### 2. Loading Bar Interceptor

**File**: `loading-bar.interceptor.ts`

**Mục đích**: Theo dõi số lượng HTTP requests đang active để hiển thị loading indicator.

**Chức năng chính**:
- Đếm số lượng requests đang chạy
- Logging để debug
- Tự động cleanup khi request hoàn thành
- Hỗ trợ multiple concurrent requests

**Quy trình xử lý**:
```
1. Request bắt đầu → Tăng counter cho request key
2. Log trạng thái (starting/duplicate)
3. Thực hiện request
4. Request hoàn thành → Giảm counter
5. Nếu counter = 0 → Xóa khỏi map
6. Log trạng thái completion
```

**Cấu trúc code**:
```typescript
export const loadingBarInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const requestKey = generateRequestKey(request);
  
  // Tăng số lượng requests cho key này
  const currentCount = activeRequests.get(requestKey) || 0;
  activeRequests.set(requestKey, currentCount + 1);
  
  // Log để debug
  if (currentCount === 0) {
    console.log(`[LoadingBarInterceptor] Starting request: ${requestKey}`);
  }

  return next(request).pipe(
    finalize(() => {
      // Giảm số lượng requests khi hoàn thành
      const count = activeRequests.get(requestKey) || 0;
      if (count <= 1) {
        activeRequests.delete(requestKey);
        console.log(`[LoadingBarInterceptor] Completed request: ${requestKey}`);
      } else {
        activeRequests.set(requestKey, count - 1);
      }
    })
  );
};
```

**Request Key Generation**:
```typescript
function generateRequestKey(request: HttpRequest<any>): string {
  const url = request.url;
  const method = request.method;
  const params = request.params.toString();
  return `${method}:${url}${params ? `?${params}` : ''}`;
}
```

**Cách sử dụng**:

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingBarInterceptor } from '@cci-web/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([loadingBarInterceptor])
    )
  ]
};

// Tạo service để expose loading state
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // Method để interceptor có thể call
  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }
}

// Enhanced interceptor với LoadingService
export const enhancedLoadingBarInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const loadingService = inject(LoadingService);
  const requestKey = generateRequestKey(request);
  
  const currentCount = activeRequests.get(requestKey) || 0;
  activeRequests.set(requestKey, currentCount + 1);
  
  // Notify loading started
  if (getTotalActiveRequests() === 1) {
    loadingService.setLoading(true);
  }

  return next(request).pipe(
    finalize(() => {
      const count = activeRequests.get(requestKey) || 0;
      if (count <= 1) {
        activeRequests.delete(requestKey);
      } else {
        activeRequests.set(requestKey, count - 1);
      }
      
      // Notify loading completed
      if (getTotalActiveRequests() === 0) {
        loadingService.setLoading(false);
      }
    })
  );
};

function getTotalActiveRequests(): number {
  return Array.from(activeRequests.values()).reduce((sum, count) => sum + count, 0);
}

// Trong component để hiển thị loading
@Component({
  selector: 'app-loading-bar',
  template: `
    <div class="loading-bar" *ngIf="loading$ | async">
      <div class="progress"></div>
    </div>
  `
})
export class LoadingBarComponent {
  loading$ = this.loadingService.loading$;
  
  constructor(private loadingService: LoadingService) {}
}
```

**Ưu điểm**:
- Tự động tracking tất cả HTTP requests
- Hỗ trợ concurrent requests
- Detailed logging cho debugging
- Lightweight và efficient

**Nhược điểm**:
- Chỉ log, không tự động hiển thị UI
- Cần tích hợp với LoadingService để có UI
- Console logs có thể spam trong development

## Cách tích hợp cả hai Interceptors

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  duplicateRequestInterceptor, 
  loadingBarInterceptor 
} from '@cci-web/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        duplicateRequestInterceptor,  // Chạy trước để deduplicate
        loadingBarInterceptor        // Chạy sau để track loading
      ])
    )
  ]
};

// Hoặc sử dụng provider function
import { provideCciWebCore } from '@cci-web/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCciWebCore({
      // Config sẽ tự động include các interceptors
      interceptors: {
        duplicateRequest: true,
        loadingBar: true
      }
    })
  ]
};
```

## Best Practices

### 1. Thứ tự Interceptors
```typescript
// Thứ tự quan trọng:
withInterceptors([
  authInterceptor,              // 1. Authentication
  duplicateRequestInterceptor,  // 2. Deduplicate requests
  loadingBarInterceptor,        // 3. Track loading
  errorHandlingInterceptor,     // 4. Handle errors
  cachingInterceptor           // 5. Cache responses
])
```

### 2. Environment-specific Configuration
```typescript
// interceptors.config.ts
export const getInterceptorsConfig = () => {
  const interceptors = [];
  
  if (!environment.production) {
    interceptors.push(loadingBarInterceptor); // Chỉ log trong dev
  }
  
  interceptors.push(duplicateRequestInterceptor); // Luôn enable
  
  return interceptors;
};
```

### 3. Custom Configuration
```typescript
// Tạo configurable interceptors
export const createDuplicateRequestInterceptor = (config: {
  methods?: string[];
  excludeUrls?: string[];
}) => {
  return (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const methods = config.methods || ['GET'];
    const excludeUrls = config.excludeUrls || [];
    
    if (!methods.includes(request.method)) {
      return next(request);
    }
    
    if (excludeUrls.some(url => request.url.includes(url))) {
      return next(request);
    }
    
    // Original logic...
  };
};
```

## Lỗi thường gặp và cách khắc phục

### 1. Memory Leaks
**Lỗi**: Pending requests không được cleanup
**Nguyên nhân**: Không handle error cases properly
**Giải pháp**:
```typescript
// ❌ Sai - không cleanup khi error
const request$ = next(request).pipe(
  switchMap(response => {
    pendingRequests.delete(cacheKey);
    return of(response);
  })
);

// ✅ Đúng - cleanup trong mọi trường hợp
const request$ = next(request).pipe(
  take(1),
  finalize(() => {
    pendingRequests.delete(cacheKey); // Luôn cleanup
  })
);
```

### 2. Interceptor không hoạt động
**Lỗi**: Interceptors không được apply
**Nguyên nhân**: Cấu hình sai hoặc thứ tự sai
**Giải pháp**:
```typescript
// ❌ Sai - sử dụng legacy HTTP_INTERCEPTORS
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true }
]

// ✅ Đúng - sử dụng functional interceptors
providers: [
  provideHttpClient(
    withInterceptors([myInterceptor])
  )
]
```

### 3. Duplicate requests vẫn xảy ra
**Lỗi**: Cache key không unique
**Nguyên nhân**: Không include đủ thông tin trong cache key
**Giải pháp**:
```typescript
// ❌ Sai - chỉ dùng URL
function generateCacheKey(request: HttpRequest<any>): string {
  return request.url;
}

// ✅ Đúng - include method, URL, params, headers
function generateCacheKey(request: HttpRequest<any>): string {
  const url = request.url;
  const method = request.method;
  const params = request.params.toString();
  const headers = JSON.stringify(request.headers.keys().sort());
  return `${method}:${url}:${params}:${headers}`;
}
```

### 4. Loading state không chính xác
**Lỗi**: Loading indicator không tắt
**Nguyên nhân**: Counter không được reset đúng
**Giải pháp**:
```typescript
// Thêm safety mechanism
const resetLoadingState = () => {
  activeRequests.clear();
  loadingService.setLoading(false);
};

// Reset khi navigate
router.events.pipe(
  filter(event => event instanceof NavigationEnd)
).subscribe(() => {
  resetLoadingState();
});
```

## Performance Considerations

### 1. Cache Size Management
```typescript
const MAX_CACHE_SIZE = 100;
const pendingRequests = new Map<string, Observable<any>>();

function addToPendingRequests(key: string, request$: Observable<any>) {
  if (pendingRequests.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = pendingRequests.keys().next().value;
    pendingRequests.delete(firstKey);
  }
  pendingRequests.set(key, request$);
}
```

### 2. Debounce Rapid Requests
```typescript
export const debouncedDuplicateRequestInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const cacheKey = generateCacheKey(request);
  
  // Debounce rapid requests
  return timer(50).pipe(
    switchMap(() => {
      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey)!;
      }
      
      const request$ = next(request).pipe(
        finalize(() => pendingRequests.delete(cacheKey))
      );
      
      pendingRequests.set(cacheKey, request$);
      return request$;
    })
  );
};
```

### 3. Selective Application
```typescript
// Chỉ apply cho specific URLs
const CACHEABLE_URLS = ['/api/data', '/api/config', '/api/lookup'];

export const selectiveDuplicateRequestInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const shouldCache = CACHEABLE_URLS.some(url => request.url.includes(url));
  
  if (!shouldCache || request.method !== 'GET') {
    return next(request);
  }
  
  // Apply duplicate request logic
};
```

## Testing

```typescript
// duplicate-request.interceptor.spec.ts
describe('DuplicateRequestInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(
          withInterceptors([duplicateRequestInterceptor])
        )
      ]
    });
    
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });
  
  it('should deduplicate identical GET requests', () => {
    const url = '/api/test';
    const responses: any[] = [];
    
    // Make 3 identical requests
    httpClient.get(url).subscribe(res => responses.push(res));
    httpClient.get(url).subscribe(res => responses.push(res));
    httpClient.get(url).subscribe(res => responses.push(res));
    
    // Should only create 1 HTTP request
    const req = httpMock.expectOne(url);
    req.flush({ data: 'test' });
    
    // All 3 subscribers should receive the response
    expect(responses).toHaveLength(3);
    expect(responses[0]).toEqual({ data: 'test' });
    
    httpMock.verify();
  });
});
```