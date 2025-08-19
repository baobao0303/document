# Base API Service - Foundation HTTP Service

## Giới thiệu

Base API Service là service nền tảng cung cấp các chức năng HTTP cơ bản và được thiết kế để làm base class cho các API services khác. Service này cung cấp một foundation vững chắc với các tính năng cốt lõi như error handling, request transformation, response processing, và configuration management.

## Tính năng chính

- **Foundation HTTP Methods**: Các phương thức HTTP cơ bản
- **Request/Response Transformation**: Transform data trước và sau requests
- **Error Handling Foundation**: Base error handling logic
- **Configuration Management**: Quản lý cấu hình API endpoints
- **Type Safety**: Strong typing cho requests và responses
- **Extensible Architecture**: Dễ dàng extend cho specific use cases
- **SSR Compatible**: Tương thích với Server-Side Rendering
- **Interceptor Support**: Hỗ trợ request/response interceptors
- **Retry Logic**: Base retry functionality
- **Loading State Management**: Quản lý loading states
- **URL Building**: Utilities để build URLs
- **Header Management**: Quản lý HTTP headers

## Dependencies

Service này phụ thuộc vào các Angular modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `baseUrl` | `string` | Base URL cho API endpoints |
| `defaultHeaders` | `HttpHeaders` | Default headers cho requests |
| `isLoading$` | `Observable<boolean>` | Observable cho loading state |
| `lastError$` | `Observable<ApiError \| null>` | Observable cho error gần nhất |

### Core HTTP Methods
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `get<T>()` | `get<T>(endpoint: string, options?: RequestOptions): Observable<T>` | GET request |
| `post<T>()` | `post<T>(endpoint: string, data?: any, options?: RequestOptions): Observable<T>` | POST request |
| `put<T>()` | `put<T>(endpoint: string, data?: any, options?: RequestOptions): Observable<T>` | PUT request |
| `patch<T>()` | `patch<T>(endpoint: string, data?: any, options?: RequestOptions): Observable<T>` | PATCH request |
| `delete<T>()` | `delete<T>(endpoint: string, options?: RequestOptions): Observable<T>` | DELETE request |

### URL and Parameter Methods
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `buildUrl()` | `buildUrl(endpoint: string, params?: Record<string, any>): string` | Build complete URL |
| `buildParams()` | `buildParams(params: Record<string, any>): HttpParams` | Build HTTP params |
| `buildHeaders()` | `buildHeaders(headers?: Record<string, string>): HttpHeaders` | Build HTTP headers |

### Request Processing
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `processRequest<T>()` | `processRequest<T>(request: Observable<T>, options?: RequestOptions): Observable<T>` | Process request với common logic |
| `transformRequest()` | `transformRequest(data: any): any` | Transform request data |
| `transformResponse<T>()` | `transformResponse<T>(response: any): T` | Transform response data |

### Error Handling
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `handleError()` | `handleError(error: HttpErrorResponse): Observable<never>` | Handle HTTP errors |
| `createErrorResponse()` | `createErrorResponse(error: HttpErrorResponse): ApiError` | Create standardized error |
| `isRetryableError()` | `isRetryableError(error: HttpErrorResponse): boolean` | Check if error is retryable |

### Configuration Methods
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `setBaseUrl()` | `setBaseUrl(url: string): void` | Set base URL |
| `setDefaultHeaders()` | `setDefaultHeaders(headers: Record<string, string>): void` | Set default headers |
| `getEndpointUrl()` | `getEndpointUrl(endpoint: string): string` | Get full endpoint URL |

### Utility Methods
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `isOnline()` | `isOnline(): boolean` | Check network status |
| `generateRequestId()` | `generateRequestId(): string` | Generate unique request ID |
| `logRequest()` | `logRequest(method: string, url: string, data?: any): void` | Log request details |
| `logResponse()` | `logResponse(response: any): void` | Log response details |

## Implementation Details

### Interfaces

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  withCredentials?: boolean;
  timeout?: number;
  retries?: number;
  skipErrorHandler?: boolean;
  skipTransform?: boolean;
  loadingKey?: string;
  metadata?: any;
}

interface ApiError {
  message: string;
  status: number;
  statusText: string;
  url: string;
  timestamp: Date;
  requestId: string;
  originalError: HttpErrorResponse;
  retryable: boolean;
  context?: any;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: Date;
  requestId: string;
}

interface BaseApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  defaultHeaders: Record<string, string>;
  enableLogging: boolean;
  enableTransform: boolean;
  errorHandler?: (error: HttpErrorResponse) => string;
  requestTransformer?: (data: any) => any;
  responseTransformer?: (data: any) => any;
}

interface EndpointConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  transform?: boolean;
}

interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  retries: number;
  error?: ApiError;
}
```

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, finalize, retry, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected readonly _config: BaseApiConfig;
  protected readonly _isBrowser: boolean;
  
  // State management
  protected _loadingSubject = new BehaviorSubject<boolean>(false);
  protected _errorSubject = new BehaviorSubject<ApiError | null>(null);
  
  // Public observables
  public isLoading$ = this._loadingSubject.asObservable();
  public lastError$ = this._errorSubject.asObservable();
  
  // Internal tracking
  protected _requestContexts = new Map<string, RequestContext>();
  protected _requestCounter = 0;

  constructor(
    protected http: HttpClient,
    @Inject(PLATFORM_ID) protected platformId: Object,
    config?: Partial<BaseApiConfig>
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this._config = this.mergeConfig(this.getDefaultConfig(), config);
  }

  protected getDefaultConfig(): BaseApiConfig {
    return {
      baseUrl: '',
      timeout: 30000,
      retries: 3,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      enableLogging: false,
      enableTransform: true,
      errorHandler: (error: HttpErrorResponse) => {
        return error.error?.message || error.message || 'An error occurred';
      }
    };
  }

  protected mergeConfig(defaultConfig: BaseApiConfig, userConfig?: Partial<BaseApiConfig>): BaseApiConfig {
    return {
      ...defaultConfig,
      ...userConfig,
      defaultHeaders: {
        ...defaultConfig.defaultHeaders,
        ...userConfig?.defaultHeaders
      }
    };
  }

  // Core HTTP Methods
  protected get<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    
    const request$ = this.http.get<T>(url, httpOptions);
    return this.processRequest(request$, { ...options, method: 'GET', url });
  }

  protected post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    const transformedData = this.shouldTransformRequest(options) ? this.transformRequest(data) : data;
    
    const request$ = this.http.post<T>(url, transformedData, httpOptions);
    return this.processRequest(request$, { ...options, method: 'POST', url, data: transformedData });
  }

  protected put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    const transformedData = this.shouldTransformRequest(options) ? this.transformRequest(data) : data;
    
    const request$ = this.http.put<T>(url, transformedData, httpOptions);
    return this.processRequest(request$, { ...options, method: 'PUT', url, data: transformedData });
  }

  protected patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    const transformedData = this.shouldTransformRequest(options) ? this.transformRequest(data) : data;
    
    const request$ = this.http.patch<T>(url, transformedData, httpOptions);
    return this.processRequest(request$, { ...options, method: 'PATCH', url, data: transformedData });
  }

  protected delete<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);
    
    const request$ = this.http.delete<T>(url, httpOptions);
    return this.processRequest(request$, { ...options, method: 'DELETE', url });
  }

  // URL and Parameter Building
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = endpoint;
    
    // Add base URL if endpoint is relative
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const baseUrl = this._config.baseUrl.endsWith('/') 
        ? this._config.baseUrl.slice(0, -1) 
        : this._config.baseUrl;
      const path = url.startsWith('/') ? url : `/${url}`;
      url = `${baseUrl}${path}`;
    }
    
    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }

  protected buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            httpParams = httpParams.append(key, item.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });
    
    return httpParams;
  }

  protected buildHeaders(headers?: Record<string, string>): HttpHeaders {
    let httpHeaders = new HttpHeaders(this._config.defaultHeaders);
    
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        httpHeaders = httpHeaders.set(key, value);
      });
    }
    
    return httpHeaders;
  }

  protected buildHttpOptions(options: RequestOptions): any {
    const httpOptions: any = {};
    
    // Headers
    httpOptions.headers = this.buildHeaders(options.headers);
    
    // Parameters
    if (options.params) {
      httpOptions.params = this.buildParams(options.params);
    }
    
    // Other options
    if (options.responseType) {
      httpOptions.responseType = options.responseType;
    }
    
    if (options.withCredentials) {
      httpOptions.withCredentials = options.withCredentials;
    }
    
    return httpOptions;
  }

  // Request Processing
  protected processRequest<T>(request: Observable<T>, context: any): Observable<T> {
    const requestId = this.generateRequestId();
    const requestContext: RequestContext = {
      requestId,
      method: context.method,
      url: context.url,
      startTime: new Date(),
      retries: 0
    };
    
    this._requestContexts.set(requestId, requestContext);
    this.setLoading(true);
    
    if (this._config.enableLogging) {
      this.logRequest(context.method, context.url, context.data);
    }
    
    let processedRequest = request;
    
    // Apply timeout
    if (context.timeout || this._config.timeout) {
      processedRequest = processedRequest.pipe(
        timeout(context.timeout || this._config.timeout)
      );
    }
    
    // Apply retry logic
    if (context.retries || this._config.retries) {
      processedRequest = processedRequest.pipe(
        retry(context.retries || this._config.retries)
      );
    }
    
    // Apply response transformation and error handling
    return processedRequest.pipe(
      map(response => {
        const transformedResponse = this.shouldTransformResponse(context) 
          ? this.transformResponse<T>(response) 
          : response;
        
        if (this._config.enableLogging) {
          this.logResponse(transformedResponse);
        }
        
        return transformedResponse;
      }),
      tap(() => {
        requestContext.endTime = new Date();
        requestContext.duration = requestContext.endTime.getTime() - requestContext.startTime.getTime();
      }),
      catchError(error => {
        requestContext.error = this.createErrorResponse(error);
        return this.handleError(error, context);
      }),
      finalize(() => {
        this.setLoading(false);
        this._requestContexts.delete(requestId);
      })
    );
  }

  // Request/Response Transformation
  protected transformRequest(data: any): any {
    if (this._config.requestTransformer) {
      return this._config.requestTransformer(data);
    }
    
    // Default transformation logic
    if (data && typeof data === 'object') {
      // Remove null/undefined values
      const cleaned = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      return cleaned;
    }
    
    return data;
  }

  protected transformResponse<T>(response: any): T {
    if (this._config.responseTransformer) {
      return this._config.responseTransformer(response);
    }
    
    // Default transformation logic
    if (response && typeof response === 'object') {
      // Handle common API response formats
      if (response.data !== undefined) {
        return response.data;
      }
      
      if (response.result !== undefined) {
        return response.result;
      }
    }
    
    return response;
  }

  protected shouldTransformRequest(options: RequestOptions): boolean {
    return options.skipTransform !== true && this._config.enableTransform;
  }

  protected shouldTransformResponse(options: RequestOptions): boolean {
    return options.skipTransform !== true && this._config.enableTransform;
  }

  // Error Handling
  protected handleError(error: HttpErrorResponse, context?: any): Observable<never> {
    if (context?.skipErrorHandler) {
      return throwError(error);
    }
    
    const apiError = this.createErrorResponse(error);
    this._errorSubject.next(apiError);
    
    if (this._config.enableLogging) {
      console.error('API Error:', apiError);
    }
    
    return throwError(apiError);
  }

  protected createErrorResponse(error: HttpErrorResponse): ApiError {
    return {
      message: this._config.errorHandler ? this._config.errorHandler(error) : error.message,
      status: error.status,
      statusText: error.statusText,
      url: error.url || '',
      timestamp: new Date(),
      requestId: this.generateRequestId(),
      originalError: error,
      retryable: this.isRetryableError(error)
    };
  }

  protected isRetryableError(error: HttpErrorResponse): boolean {
    // Retry on network errors and 5xx server errors
    return error.status === 0 || (error.status >= 500 && error.status < 600);
  }

  // Configuration Methods
  public setBaseUrl(url: string): void {
    this._config.baseUrl = url;
  }

  public setDefaultHeaders(headers: Record<string, string>): void {
    this._config.defaultHeaders = { ...this._config.defaultHeaders, ...headers };
  }

  public getEndpointUrl(endpoint: string): string {
    return this.buildUrl(endpoint);
  }

  // Utility Methods
  protected isOnline(): boolean {
    return this._isBrowser ? navigator.onLine : true;
  }

  protected generateRequestId(): string {
    return `req_${++this._requestCounter}_${Date.now()}`;
  }

  protected logRequest(method: string, url: string, data?: any): void {
    console.group(`🚀 ${method} ${url}`);
    if (data) {
      console.log('Request Data:', data);
    }
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  protected logResponse(response: any): void {
    console.group('✅ Response');
    console.log('Response Data:', response);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  protected setLoading(loading: boolean): void {
    this._loadingSubject.next(loading);
  }

  // Abstract methods for subclasses
  protected abstract getApiVersion(): string;
  protected abstract getServiceName(): string;

  // Public getters
  get baseUrl(): string {
    return this._config.baseUrl;
  }

  get defaultHeaders(): HttpHeaders {
    return new HttpHeaders(this._config.defaultHeaders);
  }

  get config(): BaseApiConfig {
    return { ...this._config };
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      config: this._config,
      activeRequests: this._requestContexts.size,
      requestContexts: Array.from(this._requestContexts.values()),
      isLoading: this._loadingSubject.value,
      lastError: this._errorSubject.value
    };
  }

  // Cleanup
  ngOnDestroy(): void {
    this._loadingSubject.complete();
    this._errorSubject.complete();
    this._requestContexts.clear();
  }
}
```

## Cách sử dụng

### Creating a Specific API Service

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@cci-web/core';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService extends BaseApiService {
  constructor(http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    super(http, platformId, {
      baseUrl: '/api/v1',
      enableLogging: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Service': 'user-service'
      }
    });
  }

  protected getApiVersion(): string {
    return 'v1';
  }

  protected getServiceName(): string {
    return 'UserApiService';
  }

  // User CRUD operations
  getUsers(page: number = 1, pageSize: number = 20): Observable<UserListResponse> {
    return this.get<UserListResponse>('/users', {
      params: { page, pageSize }
    });
  }

  getUserById(id: number): Observable<User> {
    return this.get<User>(`/users/${id}`);
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.post<User>('/users', userData);
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.patch<User>(`/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.delete<void>(`/users/${id}`);
  }

  // Custom transformation for this service
  protected transformRequest(data: any): any {
    const transformed = super.transformRequest(data);
    
    // Add service-specific transformations
    if (transformed && transformed.email) {
      transformed.email = transformed.email.toLowerCase();
    }
    
    return transformed;
  }

  protected transformResponse<T>(response: any): T {
    const transformed = super.transformResponse<T>(response);
    
    // Transform dates from strings to Date objects
    if (transformed && typeof transformed === 'object') {
      const obj = transformed as any;
      if (obj.createdAt && typeof obj.createdAt === 'string') {
        obj.createdAt = new Date(obj.createdAt);
      }
      if (obj.updatedAt && typeof obj.updatedAt === 'string') {
        obj.updatedAt = new Date(obj.updatedAt);
      }
    }
    
    return transformed;
  }
}
```

### Using the API Service in Components

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserApiService } from './user-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <div class="loading" *ngIf="userApiService.isLoading$ | async">
        Loading users...
      </div>
      
      <div class="error" *ngIf="userApiService.lastError$ | async as error">
        Error: {{ error.message }}
        <button (click)="retryLoad()">Retry</button>
      </div>
      
      <div class="users" *ngIf="users.length > 0">
        <div *ngFor="let user of users" class="user-card">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <p>Created: {{ user.createdAt | date }}</p>
          <button (click)="editUser(user)">Edit</button>
          <button (click)="deleteUser(user.id)">Delete</button>
        </div>
      </div>
      
      <div class="pagination">
        <button 
          [disabled]="currentPage <= 1" 
          (click)="loadPage(currentPage - 1)"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          [disabled]="currentPage >= totalPages" 
          (click)="loadPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
      
      <div class="actions">
        <button (click)="createUser()">Create New User</button>
      </div>
    </div>
  `,
  styles: [`
    .user-list { padding: 20px; }
    .loading, .error { padding: 15px; margin: 10px 0; border-radius: 4px; }
    .loading { background: #e3f2fd; color: #1976d2; }
    .error { background: #ffebee; color: #d32f2f; }
    .user-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .pagination { text-align: center; margin: 20px 0; }
    .pagination button { margin: 0 10px; padding: 8px 16px; }
    .actions { text-align: center; margin-top: 20px; }
  `]
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  currentPage = 1;
  totalPages = 1;
  pageSize = 20;
  
  private destroy$ = new Subject<void>();

  constructor(public userApiService: UserApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.userApiService.getUsers(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.totalPages = Math.ceil(response.total / this.pageSize);
        },
        error: (error) => {
          console.error('Failed to load users:', error);
        }
      });
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  retryLoad() {
    this.loadUsers();
  }

  editUser(user: User) {
    // Navigate to edit form or open modal
    console.log('Edit user:', user);
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userApiService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== userId);
          },
          error: (error) => {
            alert(`Failed to delete user: ${error.message}`);
          }
        });
    }
  }

  createUser() {
    // Navigate to create form or open modal
    console.log('Create new user');
  }
}
```

### Advanced Configuration Example

```typescript
import { Injectable } from '@angular/core';
import { BaseApiService } from '@cci-web/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecureApiService extends BaseApiService {
  constructor(
    http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
    private authService: AuthService
  ) {
    super(http, platformId, {
      baseUrl: environment.apiUrl,
      timeout: 60000, // 60 seconds for file uploads
      retries: 2,
      enableLogging: !environment.production,
      enableTransform: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': environment.version
      },
      errorHandler: (error) => this.customErrorHandler(error),
      requestTransformer: (data) => this.customRequestTransformer(data),
      responseTransformer: (data) => this.customResponseTransformer(data)
    });
  }

  protected getApiVersion(): string {
    return 'v2';
  }

  protected getServiceName(): string {
    return 'SecureApiService';
  }

  // Override to add authentication headers
  protected buildHeaders(headers?: Record<string, string>): HttpHeaders {
    let httpHeaders = super.buildHeaders(headers);
    
    // Add authentication token
    const token = this.authService.getAccessToken();
    if (token) {
      httpHeaders = httpHeaders.set('Authorization', `Bearer ${token}`);
    }
    
    // Add request ID for tracing
    httpHeaders = httpHeaders.set('X-Request-ID', this.generateRequestId());
    
    return httpHeaders;
  }

  private customErrorHandler(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        this.authService.logout();
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.error?.message || 'An unexpected error occurred.';
    }
  }

  private customRequestTransformer(data: any): any {
    if (!data) return data;
    
    // Add timestamp to all requests
    const transformed = {
      ...data,
      _timestamp: new Date().toISOString()
    };
    
    // Convert Date objects to ISO strings
    Object.keys(transformed).forEach(key => {
      if (transformed[key] instanceof Date) {
        transformed[key] = transformed[key].toISOString();
      }
    });
    
    return transformed;
  }

  private customResponseTransformer(data: any): any {
    if (!data) return data;
    
    // Convert ISO date strings back to Date objects
    const dateFields = ['createdAt', 'updatedAt', 'deletedAt', 'lastLoginAt'];
    
    if (typeof data === 'object') {
      dateFields.forEach(field => {
        if (data[field] && typeof data[field] === 'string') {
          data[field] = new Date(data[field]);
        }
      });
      
      // Handle arrays
      if (Array.isArray(data)) {
        return data.map(item => this.customResponseTransformer(item));
      }
    }
    
    return data;
  }
}
```

## Best Practices

### 1. Service Inheritance

```typescript
// ✅ Good: Extend BaseApiService for specific domains
class ProductApiService extends BaseApiService {
  protected getApiVersion(): string { return 'v1'; }
  protected getServiceName(): string { return 'ProductApiService'; }
  
  // Domain-specific methods
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.get(`/products/category/${categoryId}`);
  }
}
```

### 2. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
protected handleError(error: HttpErrorResponse): Observable<never> {
  // Log error for debugging
  console.error('API Error:', {
    status: error.status,
    message: error.message,
    url: error.url,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error cases
  if (error.status === 401) {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  return super.handleError(error);
}
```

### 3. Request/Response Transformation

```typescript
// ✅ Good: Consistent data transformation
protected transformRequest(data: any): any {
  const transformed = super.transformRequest(data);
  
  // Standardize date formats
  if (transformed && typeof transformed === 'object') {
    Object.keys(transformed).forEach(key => {
      if (transformed[key] instanceof Date) {
        transformed[key] = transformed[key].toISOString();
      }
    });
  }
  
  return transformed;
}
```

### 4. Configuration Management

```typescript
// ✅ Good: Environment-based configuration
const apiConfig: Partial<BaseApiConfig> = {
  baseUrl: environment.apiUrl,
  timeout: environment.production ? 30000 : 60000,
  enableLogging: !environment.production,
  retries: environment.production ? 3 : 1
};
```

## Performance Considerations

### 1. Request Optimization
- Use appropriate HTTP methods
- Implement request deduplication
- Add request timeouts

### 2. Memory Management
- Clean up subscriptions
- Limit request context storage
- Use takeUntil for component subscriptions

### 3. Error Recovery
- Implement exponential backoff
- Use circuit breaker pattern
- Provide fallback mechanisms

## Troubleshooting

### Common Issues

**1. Base URL not set correctly**
```typescript
// Check base URL configuration
console.log('Base URL:', this.baseUrl);
```

**2. Headers not being applied**
```typescript
// Debug headers
console.log('Default Headers:', this.defaultHeaders);
```

**3. Transformations not working**
```typescript
// Check transformation settings
console.log('Transform enabled:', this._config.enableTransform);
```

## Dependencies

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection
- `@angular/common/http`: HTTP client
- `rxjs`: Observable patterns

## Related Services

- **ApiService**: Full-featured HTTP service
- **AuthService**: Authentication integration
- **ConfigMergeService**: Configuration management
- **WindowService**: Browser environment detection