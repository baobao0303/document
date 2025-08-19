# Auth Service - Authentication & Authorization Service

## Giới thiệu

Auth Service là service cốt lõi được thiết kế để quản lý xác thực (authentication) và phân quyền (authorization) trong ứng dụng Angular. Service này cung cấp một hệ thống bảo mật toàn diện với hỗ trợ JWT tokens, role-based access control, và tích hợp với các authentication providers.

## Tính năng chính

- **JWT Token Management**: Quản lý JWT access và refresh tokens
- **Role-based Access Control**: Phân quyền dựa trên roles và permissions
- **Multi-provider Support**: Hỗ trợ nhiều authentication providers
- **Session Management**: Quản lý phiên đăng nhập
- **Auto Token Refresh**: Tự động refresh tokens
- **Route Guards**: Guards cho route protection
- **SSR Compatible**: Tương thích với Server-Side Rendering
- **Secure Storage**: Lưu trữ tokens an toàn
- **Event System**: Event system cho auth state changes
- **Password Policies**: Chính sách mật khẩu

## Phụ thuộc

Service này phụ thuộc vào các Angular modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isAuthenticated$` | `Observable<boolean>` | Observable cho authentication state |
| `currentUser$` | `Observable<User \| null>` | Observable cho current user |
| `userRoles$` | `Observable<string[]>` | Observable cho user roles |
| `isLoading$` | `Observable<boolean>` | Observable cho loading state |

### Phương thức

#### Phương thức xác thực

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `login()` | `login(credentials: LoginCredentials): Observable<AuthResponse>` | Đăng nhập user |
| `logout()` | `logout(): Observable<void>` | Đăng xuất user |
| `register()` | `register(userData: RegisterData): Observable<AuthResponse>` | Đăng ký user mới |
| `refreshToken()` | `refreshToken(): Observable<AuthResponse>` | Refresh access token |
| `forgotPassword()` | `forgotPassword(email: string): Observable<void>` | Quên mật khẩu |
| `resetPassword()` | `resetPassword(token: string, newPassword: string): Observable<void>` | Reset mật khẩu |
| `changePassword()` | `changePassword(oldPassword: string, newPassword: string): Observable<void>` | Đổi mật khẩu |

#### User Management
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getCurrentUser()` | `getCurrentUser(): User \| null` | Lấy current user |
| `updateProfile()` | `updateProfile(userData: Partial<User>): Observable<User>` | Cập nhật profile |
| `getUserRoles()` | `getUserRoles(): string[]` | Lấy user roles |
| `getUserPermissions()` | `getUserPermissions(): string[]` | Lấy user permissions |

#### Phương thức phân quyền

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `hasRole()` | `hasRole(role: string): boolean` | Kiểm tra user có role |
| `hasAnyRole()` | `hasAnyRole(roles: string[]): boolean` | Kiểm tra user có bất kỳ role nào |
| `hasAllRoles()` | `hasAllRoles(roles: string[]): boolean` | Kiểm tra user có tất cả roles |
| `hasPermission()` | `hasPermission(permission: string): boolean` | Kiểm tra user có permission |
| `canAccess()` | `canAccess(resource: string, action?: string): boolean` | Kiểm tra quyền truy cập resource |

#### Token Management
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getAccessToken()` | `getAccessToken(): string \| null` | Lấy access token |
| `getRefreshToken()` | `getRefreshToken(): string \| null` | Lấy refresh token |
| `isTokenExpired()` | `isTokenExpired(token?: string): boolean` | Kiểm tra token hết hạn |
| `getTokenExpiration()` | `getTokenExpiration(token?: string): Date \| null` | Lấy thời gian hết hạn token |
| `clearTokens()` | `clearTokens(): void` | Xóa tất cả tokens |

#### Session Management
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `isAuthenticated()` | `isAuthenticated(): boolean` | Kiểm tra authentication state |
| `getSessionInfo()` | `getSessionInfo(): SessionInfo \| null` | Lấy thông tin session |
| `extendSession()` | `extendSession(): Observable<void>` | Gia hạn session |
| `terminateSession()` | `terminateSession(): Observable<void>` | Kết thúc session |

#### Multi-factor Authentication
| Method | Signature | Mô tả |
|--------|-----------|-------|
| `enableMFA()` | `enableMFA(): Observable<MFASetupResponse>` | Bật MFA |
| `disableMFA()` | `disableMFA(code: string): Observable<void>` | Tắt MFA |
| `verifyMFA()` | `verifyMFA(code: string): Observable<AuthResponse>` | Xác thực MFA |
| `generateBackupCodes()` | `generateBackupCodes(): Observable<string[]>` | Tạo backup codes |

## Chi tiết triển khai

### Interfaces

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  preferences?: UserPreferences;
}

interface UserProfile {
  phone?: string;
  address?: Address;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username?: string;
  acceptTerms: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  requiresMFA?: boolean;
  mfaToken?: string;
}

interface SessionInfo {
  sessionId: string;
  userId: string;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

interface AuthConfig {
  apiBaseUrl: string;
  tokenStorageKey: string;
  refreshTokenKey: string;
  userStorageKey: string;
  sessionTimeout: number;
  refreshThreshold: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordPolicy: PasswordPolicy;
  enableMFA: boolean;
  enableRememberMe: boolean;
  enableAutoRefresh: boolean;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPasswords: string[];
  maxAge: number; // days
  historyCount: number;
}

interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'session_expired' | 'unauthorized' | 'mfa_required';
  user?: User;
  timestamp: Date;
  metadata?: any;
}

enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
  APPLE = 'apple'
}

interface OAuthConfig {
  provider: AuthProvider;
  clientId: string;
  redirectUri: string;
  scope: string[];
  responseType: string;
}
```

### Cấu trúc Service

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer, EMPTY } from 'rxjs';
import { map, catchError, tap, switchMap, filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _config: AuthConfig;
  private readonly _isBrowser: boolean;
  
  // State management
  private _currentUserSubject = new BehaviorSubject<User | null>(null);
  private _isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private _isLoadingSubject = new BehaviorSubject<boolean>(false);
  private _authEventSubject = new BehaviorSubject<AuthEvent | null>(null);
  
  // Public observables
  public currentUser$ = this._currentUserSubject.asObservable();
  public isAuthenticated$ = this._isAuthenticatedSubject.asObservable();
  public isLoading$ = this._isLoadingSubject.asObservable();
  public authEvents$ = this._authEventSubject.asObservable().pipe(filter(event => event !== null));
  public userRoles$ = this.currentUser$.pipe(map(user => user?.roles || []));
  
  // Token refresh timer
  private _refreshTimer: any;
  private _sessionTimer: any;
  
  // Login attempts tracking
  private _loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this._config = this.getDefaultConfig();
    
    this.initializeAuth();
  }

  private getDefaultConfig(): AuthConfig {
    return {
      apiBaseUrl: '/api/auth',
      tokenStorageKey: 'cci_access_token',
      refreshTokenKey: 'cci_refresh_token',
      userStorageKey: 'cci_current_user',
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbiddenPasswords: ['password', '123456', 'qwerty'],
        maxAge: 90, // days
        historyCount: 5
      },
      enableMFA: false,
      enableRememberMe: true,
      enableAutoRefresh: true
    };
  }

  private initializeAuth(): void {
    if (!this._isBrowser) {
      return;
    }

    // Load stored user and tokens
    this.loadStoredAuth();
    
    // Setup auto token refresh
    if (this._config.enableAutoRefresh) {
      this.setupTokenRefresh();
    }
    
    // Setup session monitoring
    this.setupSessionMonitoring();
  }

  private loadStoredAuth(): void {
    try {
      const accessToken = this.getStoredToken();
      const user = this.getStoredUser();
      
      if (accessToken && user && !this.isTokenExpired(accessToken)) {
        this._currentUserSubject.next(user);
        this._isAuthenticatedSubject.next(true);
        this.emitAuthEvent({ type: 'login', user, timestamp: new Date() });
      } else {
        this.clearStoredAuth();
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.clearStoredAuth();
    }
  }

  // Authentication Methods
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Check login attempts
    if (this.isAccountLocked(credentials.email)) {
      return throwError({ error: 'Account temporarily locked due to too many failed attempts' });
    }

    this._isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this._config.apiBaseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.requiresMFA) {
            // MFA required, don't complete login yet
            return;
          }
          
          this.handleSuccessfulAuth(response);
          this.clearLoginAttempts(credentials.email);
        }),
        catchError(error => {
          this.handleFailedLogin(credentials.email);
          this._isLoadingSubject.next(false);
          return this.handleAuthError(error);
        }),
        tap(() => this._isLoadingSubject.next(false))
      );
  }

  logout(): Observable<void> {
    this._isLoadingSubject.next(true);
    
    const refreshToken = this.getRefreshToken();
    
    // Call logout endpoint if refresh token exists
    const logoutRequest = refreshToken 
      ? this.http.post<void>(`${this._config.apiBaseUrl}/logout`, { refreshToken })
      : EMPTY;
    
    return logoutRequest.pipe(
      catchError(() => EMPTY), // Ignore logout errors
      tap(() => {
        this.handleLogout();
        this._isLoadingSubject.next(false);
      })
    );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    // Validate password policy
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return throwError({ error: passwordValidation.errors.join(', ') });
    }

    this._isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this._config.apiBaseUrl}/register`, userData)
      .pipe(
        tap(response => this.handleSuccessfulAuth(response)),
        catchError(error => {
          this._isLoadingSubject.next(false);
          return this.handleAuthError(error);
        }),
        tap(() => this._isLoadingSubject.next(false))
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError({ error: 'No refresh token available' });
    }

    return this.http.post<AuthResponse>(`${this._config.apiBaseUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.storeTokens(response.accessToken, response.refreshToken);
          this.emitAuthEvent({ type: 'token_refresh', user: response.user, timestamp: new Date() });
        }),
        catchError(error => {
          this.handleLogout();
          return this.handleAuthError(error);
        })
      );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this._config.apiBaseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return throwError({ error: passwordValidation.errors.join(', ') });
    }

    return this.http.post<void>(`${this._config.apiBaseUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return throwError({ error: passwordValidation.errors.join(', ') });
    }

    return this.http.post<void>(`${this._config.apiBaseUrl}/change-password`, {
      oldPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // User Management
  getCurrentUser(): User | null {
    return this._currentUserSubject.value;
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this._config.apiBaseUrl}/profile`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        this._currentUserSubject.next(user);
        this.storeUser(user);
      })
    );
  }

  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }

  getUserPermissions(): string[] {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }

  // Authorization Methods
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.every(role => userRoles.includes(role));
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  canAccess(resource: string, action: string = 'read'): boolean {
    const permission = `${resource}:${action}`;
    return this.hasPermission(permission) || this.hasPermission(`${resource}:*`) || this.hasPermission('*');
  }

  // Token Management
  getAccessToken(): string | null {
    if (!this._isBrowser) {
      return null;
    }
    
    return localStorage.getItem(this._config.tokenStorageKey);
  }

  getRefreshToken(): string | null {
    if (!this._isBrowser) {
      return null;
    }
    
    return localStorage.getItem(this._config.refreshTokenKey);
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    
    if (!tokenToCheck) {
      return true;
    }

    try {
      const payload = this.decodeJWT(tokenToCheck);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  getTokenExpiration(token?: string): Date | null {
    const tokenToCheck = token || this.getAccessToken();
    
    if (!tokenToCheck) {
      return null;
    }

    try {
      const payload = this.decodeJWT(tokenToCheck);
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  clearTokens(): void {
    if (!this._isBrowser) {
      return;
    }
    
    localStorage.removeItem(this._config.tokenStorageKey);
    localStorage.removeItem(this._config.refreshTokenKey);
  }

  // Session Management
  isAuthenticated(): boolean {
    return this._isAuthenticatedSubject.value;
  }

  getSessionInfo(): SessionInfo | null {
    const user = this.getCurrentUser();
    const token = this.getAccessToken();
    
    if (!user || !token) {
      return null;
    }

    try {
      const payload = this.decodeJWT(token);
      return {
        sessionId: payload.jti || 'unknown',
        userId: user.id,
        loginTime: new Date(payload.iat * 1000),
        lastActivity: new Date(),
        expiresAt: new Date(payload.exp * 1000),
        ipAddress: 'unknown',
        userAgent: navigator.userAgent,
        isActive: true
      };
    } catch {
      return null;
    }
  }

  extendSession(): Observable<void> {
    return this.refreshToken().pipe(
      map(() => void 0),
      catchError(() => {
        this.handleLogout();
        return throwError({ error: 'Session extension failed' });
      })
    );
  }

  terminateSession(): Observable<void> {
    return this.logout();
  }

  // Multi-factor Authentication
  enableMFA(): Observable<MFASetupResponse> {
    return this.http.post<MFASetupResponse>(`${this._config.apiBaseUrl}/mfa/enable`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  disableMFA(code: string): Observable<void> {
    return this.http.post<void>(`${this._config.apiBaseUrl}/mfa/disable`, { code }, {
      headers: this.getAuthHeaders()
    });
  }

  verifyMFA(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this._config.apiBaseUrl}/mfa/verify`, { code })
      .pipe(
        tap(response => this.handleSuccessfulAuth(response))
      );
  }

  generateBackupCodes(): Observable<string[]> {
    return this.http.post<string[]>(`${this._config.apiBaseUrl}/mfa/backup-codes`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // OAuth Methods
  loginWithProvider(provider: AuthProvider, config: OAuthConfig): Observable<AuthResponse> {
    // This would typically open a popup or redirect to OAuth provider
    const authUrl = this.buildOAuthUrl(provider, config);
    
    if (this._isBrowser) {
      window.location.href = authUrl;
    }
    
    return EMPTY; // The actual response would come from the OAuth callback
  }

  handleOAuthCallback(code: string, state: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this._config.apiBaseUrl}/oauth/callback`, {
      code,
      state
    }).pipe(
      tap(response => this.handleSuccessfulAuth(response))
    );
  }

  // Private Helper Methods
  private handleSuccessfulAuth(response: AuthResponse): void {
    this.storeTokens(response.accessToken, response.refreshToken);
    this.storeUser(response.user);
    
    this._currentUserSubject.next(response.user);
    this._isAuthenticatedSubject.next(true);
    
    this.emitAuthEvent({ type: 'login', user: response.user, timestamp: new Date() });
    
    if (this._config.enableAutoRefresh) {
      this.setupTokenRefresh();
    }
  }

  private handleLogout(): void {
    const user = this.getCurrentUser();
    
    this.clearStoredAuth();
    this.clearRefreshTimer();
    this.clearSessionTimer();
    
    this._currentUserSubject.next(null);
    this._isAuthenticatedSubject.next(false);
    
    this.emitAuthEvent({ type: 'logout', user: user || undefined, timestamp: new Date() });
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Authentication failed';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.status === 401) {
      this.emitAuthEvent({ type: 'unauthorized', timestamp: new Date() });
    }
    
    return throwError({ error: errorMessage });
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    if (!this._isBrowser) {
      return;
    }
    
    localStorage.setItem(this._config.tokenStorageKey, accessToken);
    localStorage.setItem(this._config.refreshTokenKey, refreshToken);
  }

  private storeUser(user: User): void {
    if (!this._isBrowser) {
      return;
    }
    
    localStorage.setItem(this._config.userStorageKey, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    if (!this._isBrowser) {
      return null;
    }
    
    return localStorage.getItem(this._config.tokenStorageKey);
  }

  private getStoredUser(): User | null {
    if (!this._isBrowser) {
      return null;
    }
    
    try {
      const stored = localStorage.getItem(this._config.userStorageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearStoredAuth(): void {
    if (!this._isBrowser) {
      return;
    }
    
    localStorage.removeItem(this._config.tokenStorageKey);
    localStorage.removeItem(this._config.refreshTokenKey);
    localStorage.removeItem(this._config.userStorageKey);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  private setupTokenRefresh(): void {
    this.clearRefreshTimer();
    
    const token = this.getAccessToken();
    if (!token) {
      return;
    }
    
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return;
    }
    
    const now = new Date();
    const timeUntilRefresh = expiration.getTime() - now.getTime() - this._config.refreshThreshold;
    
    if (timeUntilRefresh > 0) {
      this._refreshTimer = setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => this.setupTokenRefresh(),
          error: () => this.handleLogout()
        });
      }, timeUntilRefresh);
    }
  }

  private clearRefreshTimer(): void {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  private setupSessionMonitoring(): void {
    if (!this._isBrowser) {
      return;
    }
    
    // Monitor user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const activityHandler = () => this.updateLastActivity();
    
    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });
    
    // Check session timeout
    this._sessionTimer = setInterval(() => {
      this.checkSessionTimeout();
    }, 60000); // Check every minute
  }

  private updateLastActivity(): void {
    // This would typically update the last activity timestamp
    // For now, we'll just extend the session if needed
  }

  private checkSessionTimeout(): void {
    if (!this.isAuthenticated()) {
      return;
    }
    
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      this.emitAuthEvent({ type: 'session_expired', timestamp: new Date() });
      this.handleLogout();
    }
  }

  private clearSessionTimer(): void {
    if (this._sessionTimer) {
      clearInterval(this._sessionTimer);
      this._sessionTimer = null;
    }
  }

  private handleFailedLogin(email: string): void {
    const attempts = this._loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    this._loginAttempts.set(email, attempts);
  }

  private clearLoginAttempts(email: string): void {
    this._loginAttempts.delete(email);
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this._loginAttempts.get(email);
    if (!attempts || attempts.count < this._config.maxLoginAttempts) {
      return false;
    }
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    return timeSinceLastAttempt < this._config.lockoutDuration;
  }

  private validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this._config.passwordPolicy;
    
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (policy.forbiddenPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and not allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private buildOAuthUrl(provider: AuthProvider, config: OAuthConfig): string {
    const baseUrls = {
      [AuthProvider.GOOGLE]: 'https://accounts.google.com/oauth/authorize',
      [AuthProvider.FACEBOOK]: 'https://www.facebook.com/v12.0/dialog/oauth',
      [AuthProvider.GITHUB]: 'https://github.com/login/oauth/authorize',
      [AuthProvider.MICROSOFT]: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      [AuthProvider.APPLE]: 'https://appleid.apple.com/auth/authorize'
    };
    
    const baseUrl = baseUrls[provider];
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: config.responseType,
      scope: config.scope.join(' '),
      state: this.generateState()
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private emitAuthEvent(event: AuthEvent): void {
    this._authEventSubject.next(event);
  }

  // Public getters
  get config(): AuthConfig {
    return { ...this._config };
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  // Cleanup
  ngOnDestroy(): void {
    this.clearRefreshTimer();
    this.clearSessionTimer();
    this._authEventSubject.complete();
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.getCurrentUser(),
      tokenExpiration: this.getTokenExpiration(),
      sessionInfo: this.getSessionInfo(),
      config: this._config,
      loginAttempts: Object.fromEntries(this._loginAttempts.entries())
    };
  }
}
```

## Cách sử dụng

### Basic Authentication

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@cci-web/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <h2>Login</h2>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            type="email" 
            formControlName="email"
            [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
          >
          <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            Please enter a valid email
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            type="password" 
            formControlName="password"
            [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
          >
          <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            Password is required
          </div>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="rememberMe">
            Remember me
          </label>
        </div>
        
        <button 
          type="submit" 
          [disabled]="loginForm.invalid || isLoading"
          class="login-button"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
        
        <div class="links">
          <a routerLink="/forgot-password">Forgot Password?</a>
          <a routerLink="/register">Create Account</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container { max-width: 400px; margin: 50px auto; padding: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
    .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .form-group input.error { border-color: #e74c3c; }
    .error-message { color: #e74c3c; font-size: 14px; margin-top: 5px; }
    .login-button { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .login-button:disabled { background: #bdc3c7; cursor: not-allowed; }
    .links { text-align: center; margin-top: 20px; }
    .links a { margin: 0 10px; color: #3498db; text-decoration: none; }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Subscribe to loading state
    this.authService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.requiresMFA) {
            this.router.navigate(['/mfa-verify'], { 
              state: { mfaToken: response.mfaToken } 
            });
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.errorMessage = error.error || 'Login failed';
        }
      });
    }
  }
}
```

### Triển khai Route Guard

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '@cci-web/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state.url);
  }

  private checkAuth(route: ActivatedRouteSnapshot, url: string): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
          return false;
        }

        // Check role requirements
        const requiredRoles = route.data['roles'] as string[];
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);
          if (!hasRequiredRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        // Check permission requirements
        const requiredPermissions = route.data['permissions'] as string[];
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasRequiredPermission = requiredPermissions.some(permission => 
            this.authService.hasPermission(permission)
          );
          if (!hasRequiredPermission) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}

// Role-specific guard
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }

        if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}
```

### Service quản lý hồ sơ người dùng

```typescript
import { Injectable } from '@angular/core';
import { AuthService, User } from '@cci-web/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profileSubject = new BehaviorSubject<User | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private authService: AuthService) {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.profileSubject.next(user);
    });
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.authService.updateProfile(updates).pipe(
      tap(user => this.profileSubject.next(user))
    );
  }

  updateAvatar(file: File): Observable<User> {
    // This would typically upload the file first
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Mock implementation - in real app, upload file and get URL
    const avatarUrl = URL.createObjectURL(file);
    
    return this.updateProfile({ avatar: avatarUrl });
  }

  updatePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.authService.changePassword(oldPassword, newPassword);
  }

  updatePreferences(preferences: any): Observable<User> {
    return this.updateProfile({ preferences });
  }

  getProfile(): User | null {
    return this.profileSubject.value;
  }

  isProfileComplete(): boolean {
    const profile = this.getProfile();
    if (!profile) return false;

    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    return requiredFields.every(field => profile[field as keyof User]);
  }

  getCompletionPercentage(): number {
    const profile = this.getProfile();
    if (!profile) return 0;

    const fields = [
      'firstName', 'lastName', 'email', 'avatar', 
      'profile.phone', 'profile.dateOfBirth', 'profile.bio'
    ];
    
    const completedFields = fields.filter(field => {
      const value = this.getNestedValue(profile, field);
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
```

## Thực hành tốt nhất

### 1. Token Security

```typescript
// ✅ Good: Store tokens securely
class SecureTokenStorage {
  private readonly TOKEN_KEY = 'auth_token';
  
  storeToken(token: string): void {
    // Use httpOnly cookies for production
    if (this.isProduction()) {
      this.storeInHttpOnlyCookie(token);
    } else {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  
  private storeInHttpOnlyCookie(token: string): void {
    // This would be handled by the server
    document.cookie = `${this.TOKEN_KEY}=${token}; HttpOnly; Secure; SameSite=Strict`;
  }
}
```

### 2. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
class AuthErrorHandler {
  handleAuthError(error: any): string {
    switch (error.status) {
      case 401:
        return 'Invalid credentials';
      case 403:
        return 'Access denied';
      case 429:
        return 'Too many attempts. Please try again later';
      default:
        return 'Authentication failed. Please try again';
    }
  }
}
```

### 3. Role-based UI

```typescript
// ✅ Good: Conditional UI based on roles
@Component({
  template: `
    <div *ngIf="authService.hasRole('admin')">
      <admin-panel></admin-panel>
    </div>
    
    <div *ngIf="authService.hasPermission('users:read')">
      <user-list></user-list>
    </div>
    
    <button 
      *ngIf="authService.canAccess('posts', 'create')"
      (click)="createPost()"
    >
      Create Post
    </button>
  `
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
```

### 4. Session Management

```typescript
// ✅ Good: Proactive session management
class SessionManager {
  constructor(private authService: AuthService) {
    this.setupSessionWarning();
  }
  
  private setupSessionWarning(): void {
    // Warn user 5 minutes before session expires
    const warningTime = 5 * 60 * 1000;
    
    setInterval(() => {
      const sessionInfo = this.authService.getSessionInfo();
      if (sessionInfo) {
        const timeLeft = sessionInfo.expiresAt.getTime() - Date.now();
        if (timeLeft <= warningTime && timeLeft > 0) {
          this.showSessionWarning();
        }
      }
    }, 60000); // Check every minute
  }
  
  private showSessionWarning(): void {
    // Show warning dialog with option to extend session
  }
}
```

## Cân nhắc về hiệu suất

### 1. Token Refresh Strategy
- Refresh tokens trước khi hết hạn
- Implement retry logic cho failed refreshes
- Use background refresh để không interrupt user

### 2. State Management
- Use BehaviorSubject cho current state
- Minimize unnecessary API calls
- Cache user data appropriately

### 3. Memory Management
- Clear timers on component destroy
- Unsubscribe from observables
- Clean up event listeners

## Khắc phục sự cố

### Common Issues

**1. Token not persisting across browser sessions**
```typescript
// Check token storage configuration
if (!this.authService.getAccessToken()) {
  console.log('Token not found in storage');
}
```

**2. Infinite redirect loops**
```typescript
// Ensure proper guard logic
if (this.authService.isAuthenticated() && route.path === 'login') {
  this.router.navigate(['/dashboard']);
  return false;
}
```

**3. CORS issues with authentication**
```typescript
// Configure proper CORS headers
const headers = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'https://yourdomain.com'
};
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection
- `@angular/common/http`: HTTP client
- `@angular/router`: Router service
- `rxjs`: Observable patterns

## Related Services

- **CookieService**: Secure cookie management
- **WindowService**: Window object access
- **ApiService**: HTTP request handling
- **ConfigMergeService**: Configuration management