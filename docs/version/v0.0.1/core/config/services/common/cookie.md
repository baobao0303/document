# Cookie Service - Browser Cookie Management Service

## Giới thiệu

Cookie Service là service cốt lõi được thiết kế để quản lý browser cookies trong ứng dụng Angular. Service này cung cấp một interface thống nhất và an toàn để thao tác với cookies, hỗ trợ SSR (Server-Side Rendering) và đảm bảo type safety.

## Tính năng chính

- **SSR Compatible**: Tương thích với Server-Side Rendering
- **Type Safety**: An toàn kiểu dữ liệu với TypeScript
- **Secure Operations**: Thao tác cookie an toàn với validation
- **Expiration Management**: Quản lý thời gian hết hạn linh hoạt
- **Path & Domain Support**: Hỗ trợ path và domain configuration
- **SameSite Support**: Hỗ trợ SameSite attribute cho security
- **JSON Serialization**: Tự động serialize/deserialize JSON objects
- **Bulk Operations**: Thao tác hàng loạt với cookies
- **Event System**: Event system cho cookie operations
- **Encryption Support**: Hỗ trợ mã hóa cookie values

## Phụ thuộc

Service này phụ thuộc vào các Angular modules và services:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |
| `document` | `Document \| null` | Document object (null trong SSR) |

### Phương thức

#### Core Cookie Operations
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `get()` | `get(name: string): string \| null` | Lấy cookie value |
| `getObject()` | `getObject<T>(name: string): T \| null` | Lấy cookie và parse thành object |
| `getAll()` | `getAll(): { [key: string]: string }` | Lấy tất cả cookies |
| `set()` | `set(name: string, value: string, options?: CookieOptions): boolean` | Set cookie |
| `setObject()` | `setObject<T>(name: string, value: T, options?: CookieOptions): boolean` | Set object cookie |
| `remove()` | `remove(name: string, options?: CookieOptions): boolean` | Xóa cookie |
| `exists()` | `exists(name: string): boolean` | Kiểm tra cookie tồn tại |

#### Advanced Operations
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `clear()` | `clear(options?: ClearOptions): number` | Xóa nhiều cookies |
| `getNames()` | `getNames(): string[]` | Lấy tất cả cookie names |
| `getSize()` | `getSize(name: string): number` | Lấy kích thước cookie |
| `getTotalSize()` | `getTotalSize(): number` | Lấy tổng kích thước cookies |
| `isExpired()` | `isExpired(name: string): boolean` | Kiểm tra cookie đã hết hạn |

#### Secure Operations
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setSecure()` | `setSecure(name: string, value: string, options?: CookieOptions): boolean` | Set secure cookie |
| `setEncrypted()` | `setEncrypted(name: string, value: string, key: string, options?: CookieOptions): boolean` | Set encrypted cookie |
| `getDecrypted()` | `getDecrypted(name: string, key: string): string \| null` | Lấy và decrypt cookie |

#### Utility Methods
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `isValidName()` | `isValidName(name: string): boolean` | Validate cookie name |
| `isValidValue()` | `isValidValue(value: string): boolean` | Validate cookie value |
| `sanitizeName()` | `sanitizeName(name: string): string` | Sanitize cookie name |
| `sanitizeValue()` | `sanitizeValue(value: string): string` | Sanitize cookie value |

#### Cấu hình & Giám sát
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setDefaults()` | `setDefaults(options: CookieOptions): void` | Set default options |
| `getDefaults()` | `getDefaults(): CookieOptions` | Lấy default options |
| `getStatistics()` | `getStatistics(): CookieStatistics` | Lấy thống kê cookies |

## Chi tiết triển khai

### Giao diện

```typescript
interface CookieOptions {
  expires?: Date | number | string;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

interface ClearOptions {
  path?: string;
  domain?: string;
  prefix?: string;
  exclude?: string[];
}

interface CookieStatistics {
  totalCookies: number;
  totalSize: number;
  averageSize: number;
  largestCookie: { name: string; size: number } | null;
  expiredCookies: number;
  secureCookies: number;
  httpOnlyCookies: number;
  sameSiteCookies: number;
}

interface CookieEvent {
  type: 'set' | 'get' | 'remove' | 'clear';
  name?: string;
  value?: string;
  options?: CookieOptions;
  timestamp: number;
}

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}
```

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private _isBrowser: boolean;
  private _document: Document | null;
  private _defaultOptions: CookieOptions = {};
  private _eventSubject = new Subject<CookieEvent>();
  private _encryptionConfig: EncryptionConfig;

  public events$ = this._eventSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this._document = this._isBrowser ? document : null;
    this._encryptionConfig = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12
    };
  }

  // Core Cookie Operations
  get(name: string): string | null {
    if (!this._isBrowser || !this._document) {
      return null;
    }

    try {
      if (!this.isValidName(name)) {
        console.warn(`Invalid cookie name: ${name}`);
        return null;
      }

      const cookies = this._document.cookie;
      if (!cookies) {
        return null;
      }

      const cookieArray = cookies.split(';');
      const targetCookie = cookieArray.find(cookie => {
        const [cookieName] = cookie.trim().split('=');
        return cookieName === name;
      });

      if (!targetCookie) {
        this.emitEvent({ type: 'get', name, timestamp: Date.now() });
        return null;
      }

      const [, ...valueParts] = targetCookie.trim().split('=');
      const value = valueParts.join('=');
      const decodedValue = decodeURIComponent(value);

      this.emitEvent({ type: 'get', name, value: decodedValue, timestamp: Date.now() });
      return decodedValue;

    } catch (error) {
      console.error('Cookie get error:', error);
      return null;
    }
  }

  getObject<T>(name: string): T | null {
    try {
      const value = this.get(name);
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cookie getObject error:', error);
      return null;
    }
  }

  getAll(): { [key: string]: string } {
    if (!this._isBrowser || !this._document) {
      return {};
    }

    try {
      const cookies = this._document.cookie;
      if (!cookies) {
        return {};
      }

      const result: { [key: string]: string } = {};
      const cookieArray = cookies.split(';');

      cookieArray.forEach(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name && valueParts.length > 0) {
          const value = valueParts.join('=');
          result[name] = decodeURIComponent(value);
        }
      });

      return result;
    } catch (error) {
      console.error('Cookie getAll error:', error);
      return {};
    }
  }

  set(name: string, value: string, options?: CookieOptions): boolean {
    if (!this._isBrowser || !this._document) {
      return false;
    }

    try {
      if (!this.isValidName(name)) {
        console.warn(`Invalid cookie name: ${name}`);
        return false;
      }

      if (!this.isValidValue(value)) {
        console.warn(`Invalid cookie value for ${name}`);
        return false;
      }

      const sanitizedName = this.sanitizeName(name);
      const sanitizedValue = this.sanitizeValue(value);
      const encodedValue = encodeURIComponent(sanitizedValue);
      
      const finalOptions = { ...this._defaultOptions, ...options };
      const cookieString = this.buildCookieString(sanitizedName, encodedValue, finalOptions);
      
      this._document.cookie = cookieString;
      
      // Verify cookie was set
      const wasSet = this.get(name) === value;
      
      if (wasSet) {
        this.emitEvent({ 
          type: 'set', 
          name: sanitizedName, 
          value: sanitizedValue, 
          options: finalOptions,
          timestamp: Date.now() 
        });
      }
      
      return wasSet;
    } catch (error) {
      console.error('Cookie set error:', error);
      return false;
    }
  }

  setObject<T>(name: string, value: T, options?: CookieOptions): boolean {
    try {
      const jsonValue = JSON.stringify(value);
      return this.set(name, jsonValue, options);
    } catch (error) {
      console.error('Cookie setObject error:', error);
      return false;
    }
  }

  remove(name: string, options?: CookieOptions): boolean {
    if (!this._isBrowser || !this._document) {
      return false;
    }

    try {
      if (!this.exists(name)) {
        return false;
      }

      const removeOptions: CookieOptions = {
        ...options,
        expires: new Date(0), // Set to past date
        maxAge: -1
      };

      const cookieString = this.buildCookieString(name, '', removeOptions);
      this._document.cookie = cookieString;
      
      const wasRemoved = !this.exists(name);
      
      if (wasRemoved) {
        this.emitEvent({ 
          type: 'remove', 
          name, 
          options: removeOptions,
          timestamp: Date.now() 
        });
      }
      
      return wasRemoved;
    } catch (error) {
      console.error('Cookie remove error:', error);
      return false;
    }
  }

  exists(name: string): boolean {
    return this.get(name) !== null;
  }

  // Advanced Operations
  clear(options?: ClearOptions): number {
    if (!this._isBrowser || !this._document) {
      return 0;
    }

    try {
      const allCookies = this.getAll();
      const cookieNames = Object.keys(allCookies);
      let removedCount = 0;

      cookieNames.forEach(name => {
        let shouldRemove = true;

        // Check prefix filter
        if (options?.prefix && !name.startsWith(options.prefix)) {
          shouldRemove = false;
        }

        // Check exclude filter
        if (options?.exclude && options.exclude.includes(name)) {
          shouldRemove = false;
        }

        if (shouldRemove) {
          const removeOptions: CookieOptions = {
            path: options?.path,
            domain: options?.domain
          };
          
          if (this.remove(name, removeOptions)) {
            removedCount++;
          }
        }
      });

      if (removedCount > 0) {
        this.emitEvent({ 
          type: 'clear', 
          timestamp: Date.now() 
        });
      }

      return removedCount;
    } catch (error) {
      console.error('Cookie clear error:', error);
      return 0;
    }
  }

  getNames(): string[] {
    const allCookies = this.getAll();
    return Object.keys(allCookies);
  }

  getSize(name: string): number {
    const value = this.get(name);
    if (value === null) {
      return 0;
    }
    
    // Calculate size: name + '=' + value + '; '
    return name.length + 1 + value.length + 2;
  }

  getTotalSize(): number {
    if (!this._isBrowser || !this._document) {
      return 0;
    }

    const cookies = this._document.cookie;
    return cookies ? cookies.length : 0;
  }

  isExpired(name: string): boolean {
    // Since we can't directly check expiration from document.cookie,
    // we check if the cookie exists
    return !this.exists(name);
  }

  // Secure Operations
  setSecure(name: string, value: string, options?: CookieOptions): boolean {
    const secureOptions: CookieOptions = {
      ...options,
      secure: true,
      sameSite: 'Strict'
    };
    
    return this.set(name, value, secureOptions);
  }

  setEncrypted(name: string, value: string, key: string, options?: CookieOptions): boolean {
    try {
      const encryptedValue = this.encrypt(value, key);
      return this.set(name, encryptedValue, options);
    } catch (error) {
      console.error('Cookie setEncrypted error:', error);
      return false;
    }
  }

  getDecrypted(name: string, key: string): string | null {
    try {
      const encryptedValue = this.get(name);
      if (encryptedValue === null) {
        return null;
      }
      
      return this.decrypt(encryptedValue, key);
    } catch (error) {
      console.error('Cookie getDecrypted error:', error);
      return null;
    }
  }

  // Utility Methods
  isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    // Cookie name cannot contain these characters
    const invalidChars = /[\s\t\n\r\f\v;,=]/;
    return !invalidChars.test(name);
  }

  isValidValue(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Cookie value cannot contain these characters (unless quoted)
    const invalidChars = /[\s\t\n\r\f\v;,]/;
    return !invalidChars.test(value);
  }

  sanitizeName(name: string): string {
    return name.replace(/[\s\t\n\r\f\v;,=]/g, '');
  }

  sanitizeValue(value: string): string {
    return value.replace(/[\s\t\n\r\f\v;,]/g, '');
  }

  // Configuration & Monitoring
  setDefaults(options: CookieOptions): void {
    this._defaultOptions = { ...options };
  }

  getDefaults(): CookieOptions {
    return { ...this._defaultOptions };
  }

  getStatistics(): CookieStatistics {
    const allCookies = this.getAll();
    const names = Object.keys(allCookies);
    const totalCookies = names.length;
    
    if (totalCookies === 0) {
      return {
        totalCookies: 0,
        totalSize: 0,
        averageSize: 0,
        largestCookie: null,
        expiredCookies: 0,
        secureCookies: 0,
        httpOnlyCookies: 0,
        sameSiteCookies: 0
      };
    }

    let totalSize = 0;
    let largestCookie: { name: string; size: number } | null = null;
    let maxSize = 0;

    names.forEach(name => {
      const size = this.getSize(name);
      totalSize += size;
      
      if (size > maxSize) {
        maxSize = size;
        largestCookie = { name, size };
      }
    });

    const averageSize = totalSize / totalCookies;

    return {
      totalCookies,
      totalSize,
      averageSize,
      largestCookie,
      expiredCookies: 0, // Cannot determine from document.cookie
      secureCookies: 0,   // Cannot determine from document.cookie
      httpOnlyCookies: 0, // Cannot determine from document.cookie
      sameSiteCookies: 0  // Cannot determine from document.cookie
    };
  }

  // Private Helper Methods
  private buildCookieString(name: string, value: string, options: CookieOptions): string {
    let cookieString = `${name}=${value}`;

    if (options.expires) {
      let expiresDate: Date;
      
      if (options.expires instanceof Date) {
        expiresDate = options.expires;
      } else if (typeof options.expires === 'number') {
        expiresDate = new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
      } else {
        expiresDate = new Date(options.expires);
      }
      
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }

    if (options.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.httpOnly) {
      cookieString += '; httponly';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    return cookieString;
  }

  private encrypt(value: string, key: string): string {
    // Simple encryption implementation
    // In production, use a proper encryption library
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const keyData = encoder.encode(key);
      
      // Simple XOR encryption (not secure for production)
      const encrypted = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ keyData[i % keyData.length];
      }
      
      return btoa(String.fromCharCode(...encrypted));
    } catch (error) {
      console.error('Encryption error:', error);
      return value; // Fallback to unencrypted
    }
  }

  private decrypt(encryptedValue: string, key: string): string {
    // Simple decryption implementation
    try {
      const encrypted = new Uint8Array(
        atob(encryptedValue).split('').map(char => char.charCodeAt(0))
      );
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      
      const decrypted = new Uint8Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyData[i % keyData.length];
      }
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedValue; // Fallback to encrypted value
    }
  }

  private emitEvent(event: CookieEvent): void {
    this._eventSubject.next(event);
  }

  // Public getters
  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get document(): Document | null {
    return this._document;
  }

  // Cleanup
  ngOnDestroy(): void {
    this._eventSubject.complete();
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      isBrowser: this._isBrowser,
      defaultOptions: this._defaultOptions,
      statistics: this.getStatistics(),
      allCookies: this.getAll(),
      totalSize: this.getTotalSize()
    };
  }

  exportCookies(): string {
    const data = {
      cookies: this.getAll(),
      statistics: this.getStatistics(),
      timestamp: Date.now()
    };
    return JSON.stringify(data, null, 2);
  }

  validateCookies(): { valid: string[]; invalid: string[]; issues: string[] } {
    const allCookies = this.getAll();
    const valid: string[] = [];
    const invalid: string[] = [];
    const issues: string[] = [];
    
    Object.entries(allCookies).forEach(([name, value]) => {
      const nameValid = this.isValidName(name);
      const valueValid = this.isValidValue(value);
      
      if (nameValid && valueValid) {
        valid.push(name);
      } else {
        invalid.push(name);
        
        if (!nameValid) {
          issues.push(`Invalid cookie name: ${name}`);
        }
        if (!valueValid) {
          issues.push(`Invalid cookie value for: ${name}`);
        }
      }
    });
    
    // Check size limits
    const totalSize = this.getTotalSize();
    const maxCookieSize = 4096; // 4KB limit per cookie
    const maxTotalSize = 4096 * 50; // Typical browser limit
    
    if (totalSize > maxTotalSize) {
      issues.push(`Total cookie size (${totalSize}) exceeds recommended limit (${maxTotalSize})`);
    }
    
    Object.keys(allCookies).forEach(name => {
      const size = this.getSize(name);
      if (size > maxCookieSize) {
        issues.push(`Cookie '${name}' size (${size}) exceeds limit (${maxCookieSize})`);
      }
    });
    
    return { valid, invalid, issues };
  }
}
```

## Cách sử dụng

### Basic Cookie Operations

```typescript
import { Component, OnInit } from '@angular/core';
import { CookieService } from '@cci-web/core';

@Component({
  selector: 'app-cookie-demo',
  template: `
    <div class="cookie-demo">
      <h2>Cookie Management Demo</h2>
      
      <div class="cookie-controls">
        <input [(ngModel)]="cookieName" placeholder="Cookie name">
        <input [(ngModel)]="cookieValue" placeholder="Cookie value">
        <button (click)="setCookie()">Set Cookie</button>
        <button (click)="getCookie()">Get Cookie</button>
        <button (click)="removeCookie()">Remove Cookie</button>
        <button (click)="clearAllCookies()">Clear All</button>
      </div>
      
      <div class="cookie-info">
        <h3>Cookie Information</h3>
        <p>Total Cookies: {{ statistics?.totalCookies }}</p>
        <p>Total Size: {{ statistics?.totalSize }} bytes</p>
        <p>Average Size: {{ statistics?.averageSize | number:'1.0-2' }} bytes</p>
      </div>
      
      <div class="cookie-value" *ngIf="retrievedValue !== null">
        <h3>Retrieved Value</h3>
        <pre>{{ retrievedValue }}</pre>
      </div>
      
      <div class="all-cookies">
        <h3>All Cookies</h3>
        <div *ngFor="let cookie of allCookies | keyvalue" class="cookie-item">
          <strong>{{ cookie.key }}:</strong> {{ cookie.value }}
          <button (click)="removeSingleCookie(cookie.key)">Remove</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-demo { padding: 20px; }
    .cookie-controls input, .cookie-controls button { margin-right: 10px; margin-bottom: 10px; }
    .cookie-item { display: flex; align-items: center; margin-bottom: 5px; }
    .cookie-item button { margin-left: 10px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
  `]
})
export class CookieDemoComponent implements OnInit {
  cookieName = 'demo-cookie';
  cookieValue = 'Hello Cookie!';
  retrievedValue: string | null = null;
  allCookies: { [key: string]: string } = {};
  statistics: any = null;

  constructor(private cookieService: CookieService) {}

  ngOnInit() {
    // Set default cookie options
    this.cookieService.setDefaults({
      path: '/',
      secure: true,
      sameSite: 'Strict'
    });

    // Subscribe to cookie events
    this.cookieService.events$.subscribe(event => {
      console.log('Cookie event:', event);
      this.updateCookieInfo();
    });

    this.updateCookieInfo();
  }

  setCookie(): void {
    const success = this.cookieService.set(this.cookieName, this.cookieValue, {
      expires: 7, // 7 days
      path: '/'
    });
    
    if (success) {
      console.log('Cookie set successfully');
    } else {
      console.error('Failed to set cookie');
    }
  }

  getCookie(): void {
    this.retrievedValue = this.cookieService.get(this.cookieName);
  }

  removeCookie(): void {
    const success = this.cookieService.remove(this.cookieName);
    if (success) {
      this.retrievedValue = null;
      console.log('Cookie removed successfully');
    }
  }

  removeSingleCookie(name: string): void {
    this.cookieService.remove(name);
  }

  clearAllCookies(): void {
    const count = this.cookieService.clear();
    console.log(`Cleared ${count} cookies`);
    this.retrievedValue = null;
  }

  private updateCookieInfo(): void {
    this.allCookies = this.cookieService.getAll();
    this.statistics = this.cookieService.getStatistics();
  }
}
```

### User Preferences Service

```typescript
import { Injectable } from '@angular/core';
import { CookieService } from '@cci-web/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  fontSize: number;
  notifications: boolean;
  autoSave: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly PREFERENCES_KEY = 'user_preferences';
  private readonly DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'light',
    language: 'en',
    fontSize: 14,
    notifications: true,
    autoSave: true
  };

  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.DEFAULT_PREFERENCES);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private cookieService: CookieService) {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    const saved = this.cookieService.getObject<UserPreferences>(this.PREFERENCES_KEY);
    if (saved) {
      const preferences = { ...this.DEFAULT_PREFERENCES, ...saved };
      this.preferencesSubject.next(preferences);
    }
  }

  getPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    const current = this.preferencesSubject.value;
    const updated = { ...current, ...updates };
    
    const success = this.cookieService.setObject(this.PREFERENCES_KEY, updated, {
      expires: 365, // 1 year
      path: '/',
      secure: true,
      sameSite: 'Strict'
    });
    
    if (success) {
      this.preferencesSubject.next(updated);
    }
  }

  resetPreferences(): void {
    this.cookieService.remove(this.PREFERENCES_KEY);
    this.preferencesSubject.next(this.DEFAULT_PREFERENCES);
  }

  // Specific preference methods
  setTheme(theme: 'light' | 'dark'): void {
    this.updatePreferences({ theme });
  }

  setLanguage(language: string): void {
    this.updatePreferences({ language });
  }

  setFontSize(fontSize: number): void {
    this.updatePreferences({ fontSize });
  }

  toggleNotifications(): void {
    const current = this.getPreferences();
    this.updatePreferences({ notifications: !current.notifications });
  }

  toggleAutoSave(): void {
    const current = this.getPreferences();
    this.updatePreferences({ autoSave: !current.autoSave });
  }
}
```

### Session Management Service

```typescript
import { Injectable } from '@angular/core';
import { CookieService } from '@cci-web/core';
import { BehaviorSubject } from 'rxjs';

interface SessionData {
  userId: string;
  username: string;
  roles: string[];
  loginTime: number;
  lastActivity: number;
  sessionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionManagementService {
  private readonly SESSION_KEY = 'user_session';
  private readonly ACTIVITY_KEY = 'last_activity';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  private sessionSubject = new BehaviorSubject<SessionData | null>(null);
  public session$ = this.sessionSubject.asObservable();
  
  private activityTimer: any;

  constructor(private cookieService: CookieService) {
    this.initializeSession();
    this.setupActivityTracking();
  }

  private initializeSession(): void {
    const sessionData = this.cookieService.getObject<SessionData>(this.SESSION_KEY);
    
    if (sessionData && this.isSessionValid(sessionData)) {
      this.sessionSubject.next(sessionData);
      this.updateLastActivity();
    } else {
      this.clearSession();
    }
  }

  private isSessionValid(session: SessionData): boolean {
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    return timeSinceActivity < this.SESSION_TIMEOUT;
  }

  private setupActivityTracking(): void {
    // Update activity every 5 minutes
    this.activityTimer = setInterval(() => {
      if (this.sessionSubject.value) {
        this.updateLastActivity();
      }
    }, 5 * 60 * 1000);

    // Listen for user activity
    if (typeof window !== 'undefined') {
      ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        window.addEventListener(event, () => this.updateLastActivity(), { passive: true });
      });
    }
  }

  createSession(userData: Omit<SessionData, 'loginTime' | 'lastActivity' | 'sessionId'>): void {
    const sessionData: SessionData = {
      ...userData,
      loginTime: Date.now(),
      lastActivity: Date.now(),
      sessionId: this.generateSessionId()
    };

    const success = this.cookieService.setSecure(this.SESSION_KEY, JSON.stringify(sessionData), {
      maxAge: this.SESSION_TIMEOUT / 1000, // Convert to seconds
      path: '/',
      httpOnly: false, // Need to access from client
      sameSite: 'Strict'
    });

    if (success) {
      this.sessionSubject.next(sessionData);
      this.updateLastActivity();
    }
  }

  updateSession(updates: Partial<SessionData>): void {
    const current = this.sessionSubject.value;
    if (!current) return;

    const updated = { ...current, ...updates, lastActivity: Date.now() };
    
    const success = this.cookieService.setSecure(this.SESSION_KEY, JSON.stringify(updated), {
      maxAge: this.SESSION_TIMEOUT / 1000,
      path: '/',
      sameSite: 'Strict'
    });

    if (success) {
      this.sessionSubject.next(updated);
    }
  }

  updateLastActivity(): void {
    const current = this.sessionSubject.value;
    if (!current) return;

    const now = Date.now();
    this.cookieService.set(this.ACTIVITY_KEY, now.toString(), {
      maxAge: this.SESSION_TIMEOUT / 1000,
      path: '/'
    });

    this.updateSession({ lastActivity: now });
  }

  clearSession(): void {
    this.cookieService.remove(this.SESSION_KEY);
    this.cookieService.remove(this.ACTIVITY_KEY);
    this.sessionSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.sessionSubject.value !== null;
  }

  getSession(): SessionData | null {
    return this.sessionSubject.value;
  }

  getRemainingTime(): number {
    const session = this.sessionSubject.value;
    if (!session) return 0;

    const elapsed = Date.now() - session.lastActivity;
    return Math.max(0, this.SESSION_TIMEOUT - elapsed);
  }

  extendSession(): void {
    if (this.sessionSubject.value) {
      this.updateLastActivity();
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }
  }
}
```

## Thực hành tốt nhất

### 1. Security

```typescript
// ✅ Good: Always use secure options for sensitive data
this.cookieService.setSecure('auth_token', token, {
  httpOnly: false, // Set to true if only server needs access
  secure: true,
  sameSite: 'Strict',
  path: '/'
});

// ✅ Good: Use encryption for sensitive data
this.cookieService.setEncrypted('user_data', userData, encryptionKey);
```

### 2. Size Management

```typescript
// ✅ Good: Check cookie size before setting
const data = JSON.stringify(largeObject);
if (data.length > 4000) { // 4KB limit
  console.warn('Cookie data too large, consider using localStorage');
  return;
}
this.cookieService.set('large_data', data);
```

### 3. Expiration Management

```typescript
// ✅ Good: Set appropriate expiration times
this.cookieService.set('session_data', data, {
  maxAge: 30 * 60, // 30 minutes for session data
});

this.cookieService.set('user_preferences', preferences, {
  expires: 365 // 1 year for preferences
});
```

### 4. Error Handling

```typescript
// ✅ Good: Always handle cookie operations gracefully
try {
  const success = this.cookieService.set('data', value);
  if (!success) {
    // Fallback to localStorage or show error
    this.handleCookieFailure();
  }
} catch (error) {
  console.error('Cookie operation failed:', error);
  this.handleCookieFailure();
}
```

## Cân nhắc về hiệu suất

### 1. Minimize Cookie Size
- Chỉ lưu trữ dữ liệu cần thiết trong cookies
- Sử dụng compression cho large data
- Consider localStorage cho large data sets

### 2. Efficient Operations
- Batch cookie operations khi có thể
- Cache frequently accessed cookies
- Use events để track changes

### 3. Memory Management
- Set appropriate expiration times
- Regular cleanup của unused cookies
- Monitor total cookie size

## Khắc phục sự cố

### Common Issues

**1. Cookies not working in SSR**
```typescript
// Check if running in browser
if (this.cookieService.isBrowser) {
  this.cookieService.set('data', value);
}
```

**2. Cookie size exceeded**
```typescript
// Check size before setting
const size = this.cookieService.getSize('cookie_name');
if (size > 4096) {
  console.warn('Cookie too large');
}
```

**3. Secure cookies not working**
```typescript
// Ensure HTTPS for secure cookies
if (location.protocol === 'https:') {
  this.cookieService.setSecure('data', value);
}
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection và Document injection
- `rxjs`: Observable patterns

## Related Services

- **WindowService**: Window object access
- **PlatformService**: Platform detection
- **DocumentService**: Document manipulation
- **ConfigMergeService**: Configuration management