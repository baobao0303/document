# API Service - HTTP Client Service

## Giới thiệu

API Service là service cốt lõi để thực hiện các HTTP requests trong ứng dụng Angular. Service này cung cấp một interface thống nhất để giao tiếp với backend APIs, bao gồm caching, error handling, và tích hợp với các services khác như BreakpointService và PlatformService.

## Tính năng chính

- **Hỗ trợ phương thức HTTP**: GET, POST, PUT, DELETE với full TypeScript support
- **Intelligent Caching**: Tích hợp CacheService với configurable caching
- **File Upload Support**: FormData và file upload với progress tracking
- **Responsive Headers**: Tự động set headers dựa trên breakpoint (mobile/desktop)
- **Platform Detection**: Khác biệt xử lý giữa browser và server
- **Error Handling**: Comprehensive error handling với custom error messages
- **Request Intercepting**: Custom headers và authentication support
- **Query String Builder**: Utility để build query parameters
- **UUID Generation**: Tự động generate correlation IDs

## Phụ thuộc

Service này phụ thuộc vào các services và providers sau:

```typescript
// Core Dependencies
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpEventType, HttpEvent } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Internal Dependencies
import { BreakpointService, Breakpoints } from './breakpoint.service';
import { PlatformService } from './platform.service';
import { CacheService } from '../storage';
import { ENVIRONMENT, IEnvironment } from '../providers/environment.provider';
import { APP_NAME } from '../providers/app-config.provider';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isBrowser` | `boolean` | Kiểm tra môi trường browser |
| `gateway_api` | `string` | Gateway API endpoint |
| `breakpoints` | `Breakpoints` | Current breakpoint information |

### Phương thức HTTP cốt lõi

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `get<T>()` | `get<T>(url: string, params?: HttpParams, useCache?: boolean): Observable<T>` | GET request với optional caching |
| `getById<T>()` | `getById<T>(url: string, id: number, useCache?: boolean): Observable<T>` | GET by ID với caching |
| `post<T>()` | `post<T>(url: string, value?: any, useCache?: boolean): Observable<T>` | POST request |
| `put<T>()` | `put<T>(url: string, value: any): Observable<T>` | PUT request |
| `delete<T>()` | `delete<T>(url: string, id: string): Observable<T>` | DELETE request |

### Phương thức tải file

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `postFormData<T>()` | `postFormData<T>(url: string, value?: any): Observable<T>` | POST FormData với progress |
| `postFile<T>()` | `postFile<T>(url: string, file: File, value?: any): Observable<T>` | POST file upload |

### Phương thức tiện ích

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `objectToQueryString()` | `objectToQueryString(obj: { [key: string]: any }): string` | Convert object to query string |
| `setHeaders()` | `setHeaders(customHeaders?: { [key: string]: string }): HttpHeaders` | Set request headers |
| `getDefaultHeaders()` | `getDefaultHeaders(): { [key: string]: string }` | Get default headers |

## Chi tiết triển khai

### Cấu trúc Service

```typescript
import { Inject, Injectable, PLATFORM_ID, inject } from "@angular/core";
import { catchError, filter, map, tap } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpEventType,
  HttpEvent,
} from "@angular/common/http";
import { throwError, Observable, of } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { Breakpoints, BreakpointService } from "./breakpoint.service";
import { PlatformService } from "./platform.service";
import { ENVIRONMENT, IEnvironment } from "../providers/environment.provider";
import { APP_NAME } from "../providers/app-config.provider";
import { CacheService } from "../storage";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  isBrowser: boolean;
  protected gateway_api: string = "";
  private _http = inject(HttpClient);
  private _breakpoints = inject(BreakpointService);
  private _cache = inject(CacheService);
  private _platformService = inject(PlatformService);
  private environment = inject(ENVIRONMENT);
  private appName = inject(APP_NAME);

  breakpoints: Breakpoints;

  constructor() {
    this.isBrowser = this._platformService.isBrowser;
    this._breakpoints.breakpointsResult$.subscribe((observer) => {
      this.breakpoints = observer;
    });
  }

  // Implementation methods...
}
```

### GET Request với Caching

```typescript
get<T>(url: string, params?: HttpParams, useCache: boolean = false): Observable<T> {
  if (useCache) {
    const cacheKey = this._cache.generateKey(url, params?.toString());
    const cachedData = this._cache.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }
  }
  return this.sendRequest<T>("get", url, null, params).pipe(
    tap((response) => {
      if (useCache) {
        const cacheKey = this._cache.generateKey(url, params?.toString());
        this._cache.set(cacheKey, response);
      }
    })
  );
}
```

### GET by ID với Caching

```typescript
getById<T>(url: string, id: number, useCache: boolean = true): Observable<T> {
  const fullUrl = `${url}/${id}`;
  if (useCache) {
    const cacheKey = this._cache.generateKey(fullUrl);
    const cachedData = this._cache.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }
  }
  return this.sendRequest<T>("get", fullUrl).pipe(
    tap((response) => {
      if (useCache) {
        const cacheKey = this._cache.generateKey(fullUrl);
        this._cache.set(cacheKey, response);
      }
    })
  );
}
```

### POST Request

```typescript
post<T>(url: string, value?: any, useCache: boolean = false): Observable<T> {
  if (useCache) {
    const cacheKey = this._cache.generateKey(url, value);
    const cachedData = this._cache.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }
  }
  return this.sendRequest<T>("post", url, value).pipe(
    tap((response) => {
      if (useCache) {
        const cacheKey = this._cache.generateKey(url, value);
        this._cache.set(cacheKey, response);
      }
    })
  );
}
```

### File Upload với FormData

```typescript
postFormData<T>(url: string, value?: any): Observable<T> {
  const formData: FormData = new FormData();
  if (value) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        formData.append(key, value[key]);
      }
    }
  }
  const req = new HttpRequest("POST", url, formData, {
    reportProgress: true,
    responseType: "json",
    headers: this.setHeaders(),
  });
  return this._http.request<CRUDResult>(req).pipe(
    filter((event: HttpEvent<CRUDResult>) => event.type === HttpEventType.Response),
    map((response: HttpResponse<CRUDResult>) => response.body as CRUDResult),
    tap((apiResponse: CRUDResult) => {
      if (apiResponse.status !== 200) {
        throw {
          status: apiResponse.status,
          message: apiResponse.message,
        };
      }
    }),
    map((apiResponse: CRUDResult) => apiResponse.data as T),
    catchError((error: any) => {
      if (!this.environment.production) {
        console.log("There was an error!", error);
      }
      return throwError(error);
    })
  );
}
```

### File Upload

```typescript
postFile<T>(url: string, file: File, value?: any): Observable<T> {
  const formData: FormData = new FormData();
  formData.append("file", file);
  if (value) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        formData.append(key, value[key]);
      }
    }
  }
  const req = new HttpRequest("POST", url, formData, {
    reportProgress: true,
    responseType: "json",
  });
  return this._http.request<CRUDResult>(req).pipe(
    filter((event: HttpEvent<CRUDResult>) => event.type === HttpEventType.Response),
    map((response: HttpResponse<CRUDResult>) => response.body as CRUDResult),
    tap((apiResponse: CRUDResult) => {
      if (apiResponse.status !== 200) {
        throw {
          status: apiResponse.status,
          message: apiResponse.message,
        };
      }
    }),
    map((apiResponse: CRUDResult) => apiResponse.data as T),
    catchError((error: any) => {
      if (!this.environment.production) {
        console.log("There was an error!", error);
      }
      if (error && error.status === 400) {
        return throwError({
          status: error.status,
          message: "Dữ liệu không hợp lệ. Vui lòng thao tác lại",
        });
      }
      return throwError(error);
    })
  );
}
```

### Core Request Method

```typescript
private sendRequest<T>(method: string, url: string, data: any | null = null, params?: HttpParams): Observable<T> {
  const requestOptions: HttpRequest<CRUDResult> = new HttpRequest(method, url, data, {
    headers: this.setHeaders(),
    params: params,
    withCredentials: true,
    responseType: "json",
  });

  return this._http.request<CRUDResult>(requestOptions).pipe(
    filter((event: HttpEvent<CRUDResult>) => event && event.type === HttpEventType.Response),
    map((response: HttpResponse<CRUDResult>) => response.body as CRUDResult),
    tap((apiResponse: CRUDResult) => {
      if (apiResponse.status !== 200) {
        throw {
          status: apiResponse.status,
          message: apiResponse.message,
        };
      }
    }),
    map((apiResponse: CRUDResult) => apiResponse.data as T),
    catchError((error: any) => {
      if (!this.environment.production) {
        console.log("There was an error!", error);
      }

      if (error && error.status === 400) {
        return throwError({
          status: error.status,
          message: "Dữ liệu không hợp lệ. Vui lòng thao tác lại",
        });
      }
      return throwError(error);
    })
  );
}
```

### Headers Management

```typescript
protected getDefaultHeaders(): { [key: string]: string } {
  let headers = {
    ConcungContextID: this.generateUUID().replace(/-/g, ""),
    "platform-id": this.breakpoints?.isPhoneOnly ? "1" : "2",
  };
  if (this.isBrowser) {
    headers["returnUrl"] = window.location.href;
  }
  return headers;
}

protected setHeaders(customHeaders?: { [key: string]: string }) {
  const headersObj = {
    "app-name": this.appName,
    "gatewate-api": this.gateway_api,
    ...this.getDefaultHeaders(),
    ...(customHeaders || {}),
  };

  let headers = new HttpHeaders();

  for (const key in headersObj) {
    const value = headersObj[key];
    if (key && value != null) {
      headers = headers.set(key, value);
    }
  }
  return headers;
}
```

### Query String Utility

```typescript
public objectToQueryString(obj: { [key: string]: any }): string {
  const queryParams = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      if (obj[key] != null) {
        const value = encodeURIComponent(obj[key]);
        queryParams.push(`${encodeURIComponent(key)}=${value}`);
      }
    }
  }

  return queryParams.join("&");
}
```

## Ví dụ sử dụng

### GET Request cơ bản

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService } from '@cci-web/core';
import { Observable } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <h2>Users</h2>
      <div class="user-item" *ngFor="let user of users$ | async">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]>;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // GET request với caching
    this.users$ = this.apiService.get<User[]>('/api/users', undefined, true);
  }
}
```

### GET with Query Parameters

```typescript
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-user-search',
  template: `
    <div class="search-container">
      <input [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search users...">
      <div class="results">
        <div *ngFor="let user of searchResults" class="user-card">
          {{ user.name }} - {{ user.email }}
        </div>
      </div>
    </div>
  `
})
export class UserSearchComponent {
  searchTerm = '';
  searchResults: User[] = [];

  constructor(private apiService: ApiService) {}

  onSearch() {
    if (this.searchTerm.length >= 2) {
      const params = new HttpParams()
        .set('search', this.searchTerm)
        .set('limit', '10')
        .set('offset', '0');

      this.apiService.get<User[]>('/api/users/search', params, true)
        .subscribe({
          next: (users) => {
            this.searchResults = users;
          },
          error: (error) => {
            console.error('Search error:', error);
            this.searchResults = [];
          }
        });
    } else {
      this.searchResults = [];
    }
  }
}
```

### POST Request với Form Data

```typescript
@Component({
  selector: 'app-user-form',
  template: `
    <form (ngSubmit)="onSubmit()" #userForm="ngForm">
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" [(ngModel)]="user.name" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" type="email" [(ngModel)]="user.email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="avatar">Avatar:</label>
        <input id="avatar" type="file" (change)="onFileSelect($event)" accept="image/*">
      </div>
      
      <button type="submit" [disabled]="!userForm.valid || isSubmitting">
        {{ isSubmitting ? 'Creating...' : 'Create User' }}
      </button>
    </form>
  `
})
export class UserFormComponent {
  user = { name: '', email: '' };
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(private apiService: ApiService) {}

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;

    if (this.selectedFile) {
      // Upload với file
      this.apiService.postFile<User>('/api/users', this.selectedFile, this.user)
        .subscribe({
          next: (createdUser) => {
            console.log('User created with avatar:', createdUser);
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.isSubmitting = false;
          }
        });
    } else {
      // POST thông thường
      this.apiService.post<User>('/api/users', this.user)
        .subscribe({
          next: (createdUser) => {
            console.log('User created:', createdUser);
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.isSubmitting = false;
          }
        });
    }
  }

  private resetForm() {
    this.user = { name: '', email: '' };
    this.selectedFile = null;
    this.isSubmitting = false;
  }
}
```

### PUT và DELETE Operations

```typescript
@Component({
  selector: 'app-user-detail',
  template: `
    <div class="user-detail" *ngIf="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      
      <div class="actions">
        <button (click)="editUser()" [disabled]="isEditing">Edit</button>
        <button (click)="deleteUser()" [disabled]="isDeleting" class="danger">
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
      
      <!-- Edit Form -->
      <form *ngIf="isEditing" (ngSubmit)="saveUser()">
        <div class="form-group">
          <label>Name:</label>
          <input [(ngModel)]="editedUser.name" name="name" required>
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input [(ngModel)]="editedUser.email" name="email" type="email" required>
        </div>
        <div class="form-actions">
          <button type="submit" [disabled]="isSaving">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" (click)="cancelEdit()">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  @Input() userId: number;
  user: User | null = null;
  editedUser: User;
  isEditing = false;
  isSaving = false;
  isDeleting = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.apiService.getById<User>('/api/users', this.userId)
      .subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Error loading user:', error);
        }
      });
  }

  editUser() {
    this.isEditing = true;
    this.editedUser = { ...this.user };
  }

  saveUser() {
    if (this.isSaving) return;
    
    this.isSaving = true;
    
    this.apiService.put<User>(`/api/users/${this.user.id}`, this.editedUser)
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isEditing = false;
          this.isSaving = false;
          console.log('User updated successfully');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isSaving = false;
        }
      });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedUser = null;
  }

  deleteUser() {
    if (this.isDeleting) return;
    
    if (confirm('Are you sure you want to delete this user?')) {
      this.isDeleting = true;
      
      this.apiService.delete(`/api/users`, this.user.id.toString())
        .subscribe({
          next: () => {
            console.log('User deleted successfully');
            this.router.navigate(['/users']);
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.isDeleting = false;
          }
        });
    }
  }
}
```

### Advanced Usage với Custom Headers

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  constructor(private apiService: ApiService) {}

  getUsersWithAuth(authToken: string): Observable<User[]> {
    // Tạo custom headers
    const customHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'X-Custom-Header': 'custom-value'
    };

    // Sử dụng private method thông qua inheritance hoặc composition
    return this.makeAuthenticatedRequest<User[]>('GET', '/api/users', null, customHeaders);
  }

  private makeAuthenticatedRequest<T>(
    method: string, 
    url: string, 
    data?: any, 
    customHeaders?: { [key: string]: string }
  ): Observable<T> {
    // Extend ApiService để access protected methods
    // hoặc sử dụng composition pattern
    return this.apiService.get<T>(url); // Simplified example
  }
}
```

### Query String Builder Usage

```typescript
@Component({
  selector: 'app-product-filter',
  template: `
    <div class="filter-container">
      <div class="filter-group">
        <label>Category:</label>
        <select [(ngModel)]="filters.category" (change)="applyFilters()">
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Price Range:</label>
        <input type="range" [(ngModel)]="filters.minPrice" (input)="applyFilters()" min="0" max="1000">
        <span>{{ filters.minPrice }} - {{ filters.maxPrice }}</span>
        <input type="range" [(ngModel)]="filters.maxPrice" (input)="applyFilters()" min="0" max="1000">
      </div>
      
      <div class="filter-group">
        <label>Sort By:</label>
        <select [(ngModel)]="filters.sortBy" (change)="applyFilters()">
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      
      <div class="results">
        <div *ngFor="let product of products" class="product-card">
          {{ product.name }} - ${{ product.price }}
        </div>
      </div>
    </div>
  `
})
export class ProductFilterComponent {
  filters = {
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name',
    inStock: true
  };
  
  products: any[] = [];

  constructor(private apiService: ApiService) {}

  applyFilters() {
    // Sử dụng objectToQueryString utility
    const queryString = this.apiService.objectToQueryString(this.filters);
    const url = `/api/products?${queryString}`;
    
    console.log('Generated URL:', url);
    // Output: /api/products?category=electronics&minPrice=100&maxPrice=500&sortBy=price&inStock=true
    
    this.apiService.get<any[]>(url, undefined, true)
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: (error) => {
          console.error('Filter error:', error);
        }
      });
  }
}
```

## Thực hành tốt nhất

### 1. Chiến lược Caching

```typescript
// ✅ Good: Selective caching
class ProductService {
  constructor(private apiService: ApiService) {}

  // Cache static data
  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('/api/categories', undefined, true);
  }

  // Don't cache dynamic data
  getCurrentUserOrders(): Observable<Order[]> {
    return this.apiService.get<Order[]>('/api/orders/current', undefined, false);
  }

  // Cache search results temporarily
  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('q', query);
    return this.apiService.get<Product[]>('/api/products/search', params, true);
  }
}
```

### 2. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
class UserService {
  constructor(private apiService: ApiService) {}

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.apiService.post<User>('/api/users', userData).pipe(
      catchError((error) => {
        // Log error for monitoring
        console.error('User creation failed:', error);
        
        // Transform error for UI
        if (error.status === 400) {
          return throwError({
            message: 'Invalid user data. Please check your input.',
            field: error.field || 'general'
          });
        }
        
        if (error.status === 409) {
          return throwError({
            message: 'User with this email already exists.',
            field: 'email'
          });
        }
        
        return throwError({
          message: 'An unexpected error occurred. Please try again.',
          field: 'general'
        });
      })
    );
  }
}
```

### 3. Type Safety

```typescript
// ✅ Good: Strong typing
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

class ApiTypedService {
  constructor(private apiService: ApiService) {}

  getUsers(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.apiService.get<PaginatedResponse<User>>('/api/users', params, true);
  }

  getUserById(id: number): Observable<User> {
    return this.apiService.getById<User>('/api/users', id, true);
  }
}
```

### 4. Request Optimization

```typescript
// ✅ Good: Request optimization
class OptimizedApiService {
  constructor(private apiService: ApiService) {}

  // Batch requests
  getUsersWithDetails(userIds: number[]): Observable<UserDetail[]> {
    const batchRequest = {
      userIds: userIds,
      includeProfile: true,
      includePreferences: true
    };
    
    return this.apiService.post<UserDetail[]>('/api/users/batch', batchRequest);
  }

  // Debounced search
  searchWithDebounce(searchTerm$: Observable<string>): Observable<SearchResult[]> {
    return searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          return of([]);
        }
        const params = new HttpParams().set('q', term);
        return this.apiService.get<SearchResult[]>('/api/search', params, true);
      })
    );
  }
}
```

## Cân nhắc về hiệu suất

### 1. Caching Strategy
- Sử dụng caching cho static data (categories, configurations)
- Tránh cache cho user-specific hoặc real-time data
- Implement cache invalidation khi cần thiết

### 2. Request Optimization
- Batch multiple requests khi có thể
- Sử dụng debouncing cho search và autocomplete
- Implement request cancellation cho outdated requests

### 3. Memory Management
- Unsubscribe từ observables trong ngOnDestroy
- Sử dụng takeUntil pattern cho automatic unsubscription
- Monitor memory usage với large datasets

## Khắc phục sự cố

### Các vấn đề thường gặp

**1. CORS Errors**
```typescript
// Check headers configuration
console.log('Request headers:', this.apiService.setHeaders());

// Verify withCredentials setting
// In sendRequest method, withCredentials: true is set
```

**2. Caching Issues**
```typescript
// Clear specific cache
this._cache.clearCache(cacheKey);

// Clear all cache
this._cache.clearAllCache();

// Disable caching for debugging
this.apiService.get('/api/data', undefined, false);
```

**3. Headers Not Applied**
```typescript
// Check platform detection
console.log('Is browser:', this.apiService.isBrowser);

// Check breakpoint detection
console.log('Current breakpoints:', this.apiService.breakpoints);

// Verify custom headers
const headers = this.apiService.setHeaders({ 'Custom-Header': 'value' });
console.log('Final headers:', headers);
```

## Dependencies

- `@angular/core`: Angular framework
- `@angular/common/http`: HTTP client
- `@angular/common`: Platform detection
- `rxjs`: Reactive programming
- `@cci-web/core`: Internal services (BreakpointService, PlatformService, CacheService)

## Related Services

- **BreakpointService**: Responsive headers
- **PlatformService**: Browser/server detection
- **CacheService**: Request caching
- **Loading Spinner Service**: Loading states
- **Notification Service**: Error notifications