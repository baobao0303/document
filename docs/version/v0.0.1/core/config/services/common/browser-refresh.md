# Browser Refresh Service - Page Refresh Detection Service

## Giới thiệu

Browser Refresh Service là service cốt lõi được thiết kế để phát hiện liệu trang web có được làm mới (refresh) hay không. Service này hữu ích cho việc xử lý trạng thái ứng dụng, khôi phục dữ liệu, hoặc thực hiện các hành động đặc biệt khi người dùng refresh trang.

## Tính năng chính

- **Refresh Detection**: Phát hiện chính xác việc refresh trang
- **SSR Compatible**: Hoạt động tốt trong server-side rendering
- **Performance Entry API**: Sử dụng Navigation Timing API để phát hiện
- **Fallback Methods**: Nhiều phương pháp phát hiện backup
- **Type Safety**: Full TypeScript support
- **Singleton Pattern**: Single instance across application
- **Event Tracking**: Theo dõi các sự kiện navigation
- **State Persistence**: Lưu trữ trạng thái refresh

## Phụ thuộc

Service này phụ thuộc vào các Angular core modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isRefresh` | `boolean` | True nếu trang được refresh |
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |
| `refreshCount` | `number` | Số lần refresh trong session |
| `lastRefreshTime` | `Date \| null` | Thời gian refresh cuối cùng |

### Phương thức

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `checkIsRefresh()` | `checkIsRefresh(): boolean` | Kiểm tra có phải refresh không |
| `getNavigationType()` | `getNavigationType(): string` | Lấy loại navigation |
| `getRefreshCount()` | `getRefreshCount(): number` | Lấy số lần refresh |
| `resetRefreshCount()` | `resetRefreshCount(): void` | Reset số lần refresh |
| `getLastRefreshTime()` | `getLastRefreshTime(): Date \| null` | Lấy thời gian refresh cuối |
| `onRefresh()` | `onRefresh(callback: () => void): void` | Đăng ký callback khi refresh |
| `getNavigationEntries()` | `getNavigationEntries(): PerformanceNavigationTiming[]` | Lấy navigation entries |
| `getPageLoadTime()` | `getPageLoadTime(): number` | Lấy thời gian load trang |
| `isFirstVisit()` | `isFirstVisit(): boolean` | Kiểm tra có phải lần đầu visit |
| `getSessionInfo()` | `getSessionInfo(): SessionInfo` | Lấy thông tin session |

## Chi tiết triển khai

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface SessionInfo {
  isRefresh: boolean;
  refreshCount: number;
  lastRefreshTime: Date | null;
  navigationType: string;
  isFirstVisit: boolean;
  pageLoadTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class BrowserRefreshService {
  private _isRefresh: boolean = false;
  private _isBrowser: boolean;
  private _refreshCount: number = 0;
  private _lastRefreshTime: Date | null = null;
  private _navigationType: string = 'unknown';
  private _refreshCallbacks: (() => void)[] = [];
  private _sessionStorageKey = 'cci_browser_refresh_data';
  private _isFirstVisit: boolean = true;
  private _pageLoadTime: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    
    if (this._isBrowser) {
      this.initializeRefreshDetection();
    }
  }

  private initializeRefreshDetection(): void {
    try {
      // Load previous session data
      this.loadSessionData();
      
      // Detect refresh using multiple methods
      this._isRefresh = this.detectRefresh();
      
      // Update session data
      this.updateSessionData();
      
      // Execute callbacks if refresh detected
      if (this._isRefresh) {
        this.executeRefreshCallbacks();
      }
      
      // Setup beforeunload handler
      this.setupBeforeUnloadHandler();
      
    } catch (error) {
      console.warn('Failed to initialize refresh detection:', error);
    }
  }

  private detectRefresh(): boolean {
    // Method 1: Performance Navigation API
    if (this.detectRefreshByPerformanceAPI()) {
      this._navigationType = 'reload';
      return true;
    }
    
    // Method 2: Navigation Timing API (legacy)
    if (this.detectRefreshByNavigationTiming()) {
      this._navigationType = 'reload_legacy';
      return true;
    }
    
    // Method 3: Session storage flag
    if (this.detectRefreshBySessionFlag()) {
      this._navigationType = 'reload_session';
      return true;
    }
    
    // Method 4: Document referrer check
    if (this.detectRefreshByReferrer()) {
      this._navigationType = 'reload_referrer';
      return true;
    }
    
    this._navigationType = 'navigate';
    return false;
  }

  private detectRefreshByPerformanceAPI(): boolean {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const entry = navigationEntries[0];
          this._pageLoadTime = entry.loadEventEnd - entry.navigationStart;
          return entry.type === 'reload';
        }
      } catch (error) {
        console.warn('Performance API detection failed:', error);
      }
    }
    return false;
  }

  private detectRefreshByNavigationTiming(): boolean {
    if (typeof performance !== 'undefined' && (performance as any).navigation) {
      try {
        const navigation = (performance as any).navigation;
        this._pageLoadTime = performance.timing ? 
          performance.timing.loadEventEnd - performance.timing.navigationStart : 0;
        return navigation.type === 1; // TYPE_RELOAD
      } catch (error) {
        console.warn('Navigation timing detection failed:', error);
      }
    }
    return false;
  }

  private detectRefreshBySessionFlag(): boolean {
    try {
      const sessionData = this.getSessionStorageData();
      return sessionData && sessionData.wasRefreshed === true;
    } catch (error) {
      console.warn('Session flag detection failed:', error);
      return false;
    }
  }

  private detectRefreshByReferrer(): boolean {
    try {
      if (typeof document !== 'undefined' && document.referrer) {
        const currentUrl = window.location.href;
        const referrerUrl = document.referrer;
        
        // If referrer is the same as current URL, it might be a refresh
        return currentUrl === referrerUrl;
      }
    } catch (error) {
      console.warn('Referrer detection failed:', error);
    }
    return false;
  }

  private loadSessionData(): void {
    try {
      const sessionData = this.getSessionStorageData();
      if (sessionData) {
        this._refreshCount = sessionData.refreshCount || 0;
        this._lastRefreshTime = sessionData.lastRefreshTime ? 
          new Date(sessionData.lastRefreshTime) : null;
        this._isFirstVisit = false;
      } else {
        this._isFirstVisit = true;
      }
    } catch (error) {
      console.warn('Failed to load session data:', error);
    }
  }

  private updateSessionData(): void {
    try {
      const now = new Date();
      
      if (this._isRefresh) {
        this._refreshCount++;
        this._lastRefreshTime = now;
      }
      
      const sessionData = {
        refreshCount: this._refreshCount,
        lastRefreshTime: this._lastRefreshTime?.toISOString(),
        wasRefreshed: false, // Reset flag
        lastUpdateTime: now.toISOString(),
        navigationType: this._navigationType
      };
      
      this.setSessionStorageData(sessionData);
    } catch (error) {
      console.warn('Failed to update session data:', error);
    }
  }

  private setupBeforeUnloadHandler(): void {
    try {
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          try {
            // Set flag to detect refresh on next load
            const sessionData = this.getSessionStorageData() || {};
            sessionData.wasRefreshed = true;
            this.setSessionStorageData(sessionData);
          } catch (error) {
            console.warn('Failed to set refresh flag:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to setup beforeunload handler:', error);
    }
  }

  private getSessionStorageData(): any {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const data = sessionStorage.getItem(this._sessionStorageKey);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.warn('Failed to get session storage data:', error);
    }
    return null;
  }

  private setSessionStorageData(data: any): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this._sessionStorageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to set session storage data:', error);
    }
  }

  private executeRefreshCallbacks(): void {
    this._refreshCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Refresh callback error:', error);
      }
    });
  }

  // Public API
  get isRefresh(): boolean {
    return this._isRefresh;
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get refreshCount(): number {
    return this._refreshCount;
  }

  get lastRefreshTime(): Date | null {
    return this._lastRefreshTime;
  }

  checkIsRefresh(): boolean {
    return this._isRefresh;
  }

  getNavigationType(): string {
    return this._navigationType;
  }

  getRefreshCount(): number {
    return this._refreshCount;
  }

  resetRefreshCount(): void {
    this._refreshCount = 0;
    this._lastRefreshTime = null;
    this.updateSessionData();
  }

  getLastRefreshTime(): Date | null {
    return this._lastRefreshTime;
  }

  onRefresh(callback: () => void): void {
    this._refreshCallbacks.push(callback);
    
    // If already refreshed, execute callback immediately
    if (this._isRefresh) {
      try {
        callback();
      } catch (error) {
        console.error('Immediate refresh callback error:', error);
      }
    }
  }

  getNavigationEntries(): PerformanceNavigationTiming[] {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      try {
        return performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      } catch (error) {
        console.warn('Failed to get navigation entries:', error);
      }
    }
    return [];
  }

  getPageLoadTime(): number {
    return this._pageLoadTime;
  }

  isFirstVisit(): boolean {
    return this._isFirstVisit;
  }

  getSessionInfo(): SessionInfo {
    return {
      isRefresh: this._isRefresh,
      refreshCount: this._refreshCount,
      lastRefreshTime: this._lastRefreshTime,
      navigationType: this._navigationType,
      isFirstVisit: this._isFirstVisit,
      pageLoadTime: this._pageLoadTime
    };
  }

  // Utility methods
  getTimeSinceLastRefresh(): number | null {
    if (this._lastRefreshTime) {
      return Date.now() - this._lastRefreshTime.getTime();
    }
    return null;
  }

  isFrequentRefresher(threshold: number = 5, timeWindow: number = 300000): boolean {
    if (this._refreshCount >= threshold) {
      const timeSinceFirst = this.getTimeSinceLastRefresh();
      return timeSinceFirst !== null && timeSinceFirst <= timeWindow;
    }
    return false;
  }

  getRefreshRate(): number {
    if (this._refreshCount === 0 || !this._lastRefreshTime) {
      return 0;
    }
    
    const sessionData = this.getSessionStorageData();
    if (sessionData && sessionData.lastUpdateTime) {
      const sessionDuration = Date.now() - new Date(sessionData.lastUpdateTime).getTime();
      return this._refreshCount / (sessionDuration / 60000); // refreshes per minute
    }
    
    return 0;
  }

  clearSessionData(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this._sessionStorageKey);
      }
      this._refreshCount = 0;
      this._lastRefreshTime = null;
      this._isFirstVisit = true;
    } catch (error) {
      console.warn('Failed to clear session data:', error);
    }
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      isRefresh: this._isRefresh,
      isBrowser: this._isBrowser,
      refreshCount: this._refreshCount,
      lastRefreshTime: this._lastRefreshTime,
      navigationType: this._navigationType,
      isFirstVisit: this._isFirstVisit,
      pageLoadTime: this._pageLoadTime,
      sessionData: this.getSessionStorageData(),
      navigationEntries: this.getNavigationEntries(),
      timeSinceLastRefresh: this.getTimeSinceLastRefresh(),
      refreshRate: this.getRefreshRate()
    };
  }
}
```

## Cách sử dụng

### Basic Refresh Detection

```typescript
import { Component, OnInit } from '@angular/core';
import { BrowserRefreshService } from '@cci-web/core';

@Component({
  selector: 'app-refresh-demo',
  template: `
    <div class="refresh-info">
      <h2>Browser Refresh Information</h2>
      
      <div *ngIf="isBrowser; else serverMessage">
        <div class="info-section">
          <h3>Current Session</h3>
          <p>Is Refresh: <strong>{{ isRefresh ? 'Yes' : 'No' }}</strong></p>
          <p>Navigation Type: <strong>{{ navigationType }}</strong></p>
          <p>Is First Visit: <strong>{{ isFirstVisit ? 'Yes' : 'No' }}</strong></p>
          <p>Page Load Time: <strong>{{ pageLoadTime }}ms</strong></p>
        </div>
        
        <div class="info-section">
          <h3>Refresh Statistics</h3>
          <p>Refresh Count: <strong>{{ refreshCount }}</strong></p>
          <p>Last Refresh: <strong>{{ lastRefreshTime | date:'medium' }}</strong></p>
          <p>Time Since Last Refresh: <strong>{{ timeSinceLastRefresh }}ms</strong></p>
          <p>Refresh Rate: <strong>{{ refreshRate }} per minute</strong></p>
        </div>
        
        <div class="info-section">
          <h3>Actions</h3>
          <button (click)="resetRefreshCount()">Reset Refresh Count</button>
          <button (click)="clearSessionData()">Clear Session Data</button>
          <button (click)="showDebugInfo()">Show Debug Info</button>
        </div>
        
        <div class="info-section" *ngIf="debugInfo">
          <h3>Debug Information</h3>
          <pre>{{ debugInfo | json }}</pre>
        </div>
      </div>
      
      <ng-template #serverMessage>
        <p>This content is being rendered on the server.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .refresh-info { padding: 20px; }
    .info-section { margin-bottom: 20px; }
    .info-section button { margin-right: 10px; margin-bottom: 10px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
  `]
})
export class RefreshDemoComponent implements OnInit {
  debugInfo: any = null;

  constructor(private refreshService: BrowserRefreshService) {}

  ngOnInit() {
    // Register refresh callback
    this.refreshService.onRefresh(() => {
      console.log('Page was refreshed!');
      // Handle refresh-specific logic
    });
  }

  get isBrowser(): boolean {
    return this.refreshService.isBrowser;
  }

  get isRefresh(): boolean {
    return this.refreshService.isRefresh;
  }

  get navigationType(): string {
    return this.refreshService.getNavigationType();
  }

  get isFirstVisit(): boolean {
    return this.refreshService.isFirstVisit();
  }

  get pageLoadTime(): number {
    return this.refreshService.getPageLoadTime();
  }

  get refreshCount(): number {
    return this.refreshService.getRefreshCount();
  }

  get lastRefreshTime(): Date | null {
    return this.refreshService.getLastRefreshTime();
  }

  get timeSinceLastRefresh(): number | null {
    return this.refreshService.getTimeSinceLastRefresh();
  }

  get refreshRate(): number {
    return this.refreshService.getRefreshRate();
  }

  resetRefreshCount(): void {
    this.refreshService.resetRefreshCount();
  }

  clearSessionData(): void {
    this.refreshService.clearSessionData();
  }

  showDebugInfo(): void {
    this.debugInfo = this.refreshService.getDebugInfo();
  }
}
```

### State Recovery Service

```typescript
import { Injectable } from '@angular/core';
import { BrowserRefreshService } from '@cci-web/core';

interface AppState {
  currentRoute: string;
  formData: { [key: string]: any };
  userPreferences: any;
  temporaryData: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class StateRecoveryService {
  private readonly STATE_STORAGE_KEY = 'app_state_recovery';
  private currentState: AppState | null = null;

  constructor(private refreshService: BrowserRefreshService) {
    this.initializeStateRecovery();
  }

  private initializeStateRecovery(): void {
    if (this.refreshService.isBrowser) {
      // Register refresh callback
      this.refreshService.onRefresh(() => {
        console.log('Page refreshed - attempting state recovery');
        this.recoverState();
      });

      // Setup auto-save before page unload
      this.setupAutoSave();
    }
  }

  private setupAutoSave(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveCurrentState();
      });

      // Auto-save periodically
      setInterval(() => {
        this.saveCurrentState();
      }, 30000); // Save every 30 seconds
    }
  }

  // Save current application state
  saveState(state: Partial<AppState>): void {
    try {
      this.currentState = {
        ...this.currentState,
        ...state,
        timestamp: Date.now()
      } as AppState;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STATE_STORAGE_KEY, JSON.stringify(this.currentState));
      }
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  // Recover state after refresh
  recoverState(): AppState | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedState = localStorage.getItem(this.STATE_STORAGE_KEY);
        if (savedState) {
          const state = JSON.parse(savedState) as AppState;
          
          // Check if state is not too old (e.g., 1 hour)
          const maxAge = 60 * 60 * 1000; // 1 hour
          if (Date.now() - state.timestamp <= maxAge) {
            this.currentState = state;
            return state;
          } else {
            // Clean up old state
            this.clearSavedState();
          }
        }
      }
    } catch (error) {
      console.error('Failed to recover state:', error);
    }
    return null;
  }

  // Get current saved state
  getCurrentState(): AppState | null {
    return this.currentState;
  }

  // Clear saved state
  clearSavedState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STATE_STORAGE_KEY);
      }
      this.currentState = null;
    } catch (error) {
      console.error('Failed to clear saved state:', error);
    }
  }

  // Save current state (called before unload)
  private saveCurrentState(): void {
    if (this.currentState) {
      this.saveState({ timestamp: Date.now() });
    }
  }

  // Specific state management methods
  saveFormData(formId: string, data: any): void {
    const formData = this.currentState?.formData || {};
    formData[formId] = data;
    this.saveState({ formData });
  }

  getFormData(formId: string): any {
    return this.currentState?.formData?.[formId] || null;
  }

  saveCurrentRoute(route: string): void {
    this.saveState({ currentRoute: route });
  }

  getCurrentRoute(): string | null {
    return this.currentState?.currentRoute || null;
  }

  saveUserPreferences(preferences: any): void {
    this.saveState({ userPreferences: preferences });
  }

  getUserPreferences(): any {
    return this.currentState?.userPreferences || null;
  }

  saveTemporaryData(data: any): void {
    this.saveState({ temporaryData: data });
  }

  getTemporaryData(): any {
    return this.currentState?.temporaryData || null;
  }

  // Check if state recovery is available
  isStateRecoveryAvailable(): boolean {
    return this.refreshService.isRefresh && this.currentState !== null;
  }

  // Get state age
  getStateAge(): number | null {
    if (this.currentState) {
      return Date.now() - this.currentState.timestamp;
    }
    return null;
  }
}
```

### Form Auto-Save Service

```typescript
import { Injectable } from '@angular/core';
import { BrowserRefreshService } from '@cci-web/core';
import { StateRecoveryService } from './state-recovery.service';

interface FormAutoSaveConfig {
  formId: string;
  autoSaveInterval?: number; // milliseconds
  excludeFields?: string[];
  onRecover?: (data: any) => void;
  onSave?: (data: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class FormAutoSaveService {
  private activeForms = new Map<string, FormAutoSaveConfig>();
  private autoSaveIntervals = new Map<string, number>();

  constructor(
    private refreshService: BrowserRefreshService,
    private stateRecoveryService: StateRecoveryService
  ) {
    this.initializeFormRecovery();
  }

  private initializeFormRecovery(): void {
    if (this.refreshService.isBrowser) {
      this.refreshService.onRefresh(() => {
        this.recoverAllForms();
      });
    }
  }

  // Register form for auto-save
  registerForm(config: FormAutoSaveConfig): void {
    this.activeForms.set(config.formId, config);
    
    // Setup auto-save interval
    if (config.autoSaveInterval) {
      const intervalId = window.setInterval(() => {
        this.saveFormData(config.formId);
      }, config.autoSaveInterval);
      
      this.autoSaveIntervals.set(config.formId, intervalId);
    }

    // Try to recover data if page was refreshed
    if (this.refreshService.isRefresh) {
      this.recoverFormData(config.formId);
    }
  }

  // Unregister form
  unregisterForm(formId: string): void {
    this.activeForms.delete(formId);
    
    // Clear auto-save interval
    const intervalId = this.autoSaveIntervals.get(formId);
    if (intervalId) {
      window.clearInterval(intervalId);
      this.autoSaveIntervals.delete(formId);
    }
  }

  // Save form data
  saveFormData(formId: string): void {
    const config = this.activeForms.get(formId);
    if (!config) return;

    try {
      const formElement = document.getElementById(formId) as HTMLFormElement;
      if (formElement) {
        const formData = this.extractFormData(formElement, config.excludeFields);
        this.stateRecoveryService.saveFormData(formId, formData);
        
        if (config.onSave) {
          config.onSave(formData);
        }
      }
    } catch (error) {
      console.error(`Failed to save form data for ${formId}:`, error);
    }
  }

  // Recover form data
  recoverFormData(formId: string): void {
    const config = this.activeForms.get(formId);
    if (!config) return;

    try {
      const savedData = this.stateRecoveryService.getFormData(formId);
      if (savedData) {
        const formElement = document.getElementById(formId) as HTMLFormElement;
        if (formElement) {
          this.populateFormData(formElement, savedData);
          
          if (config.onRecover) {
            config.onRecover(savedData);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to recover form data for ${formId}:`, error);
    }
  }

  // Recover all registered forms
  private recoverAllForms(): void {
    this.activeForms.forEach((config, formId) => {
      this.recoverFormData(formId);
    });
  }

  // Extract form data
  private extractFormData(formElement: HTMLFormElement, excludeFields: string[] = []): any {
    const formData = new FormData(formElement);
    const data: any = {};

    formData.forEach((value, key) => {
      if (!excludeFields.includes(key)) {
        data[key] = value;
      }
    });

    // Also capture non-form elements like contenteditable
    const editableElements = formElement.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
      const id = element.id;
      if (id && !excludeFields.includes(id)) {
        data[id] = element.textContent || '';
      }
    });

    return data;
  }

  // Populate form data
  private populateFormData(formElement: HTMLFormElement, data: any): void {
    Object.keys(data).forEach(key => {
      const element = formElement.querySelector(`[name="${key}"], #${key}`) as HTMLInputElement;
      if (element) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = data[key] === element.value;
        } else if (element.tagName === 'SELECT') {
          (element as HTMLSelectElement).value = data[key];
        } else if (element.hasAttribute('contenteditable')) {
          element.textContent = data[key];
        } else {
          element.value = data[key];
        }
      }
    });
  }

  // Clear form data
  clearFormData(formId: string): void {
    this.stateRecoveryService.saveFormData(formId, null);
  }

  // Check if form has saved data
  hasFormData(formId: string): boolean {
    const data = this.stateRecoveryService.getFormData(formId);
    return data !== null && Object.keys(data).length > 0;
  }

  // Get form data age
  getFormDataAge(formId: string): number | null {
    if (this.hasFormData(formId)) {
      return this.stateRecoveryService.getStateAge();
    }
    return null;
  }

  // Manual save all forms
  saveAllForms(): void {
    this.activeForms.forEach((config, formId) => {
      this.saveFormData(formId);
    });
  }

  // Clear all form data
  clearAllFormData(): void {
    this.activeForms.forEach((config, formId) => {
      this.clearFormData(formId);
    });
  }
}
```

### Sử dụng trong Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormAutoSaveService } from './form-auto-save.service';

@Component({
  selector: 'app-contact-form',
  template: `
    <form id="contactForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" name="message" rows="5" required></textarea>
      </div>
      
      <div class="form-actions">
        <button type="submit">Send Message</button>
        <button type="button" (click)="clearSavedData()">Clear Saved Data</button>
      </div>
      
      <div class="auto-save-info" *ngIf="hasAutoSavedData">
        <p>Auto-saved data available ({{ autoSaveAge }}ms ago)</p>
      </div>
    </form>
  `
})
export class ContactFormComponent implements OnInit, OnDestroy {
  private readonly formId = 'contactForm';

  constructor(private formAutoSaveService: FormAutoSaveService) {}

  ngOnInit() {
    // Register form for auto-save
    this.formAutoSaveService.registerForm({
      formId: this.formId,
      autoSaveInterval: 10000, // Save every 10 seconds
      excludeFields: ['password'], // Don't save sensitive fields
      onRecover: (data) => {
        console.log('Form data recovered:', data);
        // Show notification to user
      },
      onSave: (data) => {
        console.log('Form data auto-saved:', data);
      }
    });
  }

  ngOnDestroy() {
    // Unregister form
    this.formAutoSaveService.unregisterForm(this.formId);
  }

  onSubmit() {
    // Clear auto-saved data after successful submission
    this.formAutoSaveService.clearFormData(this.formId);
    // Handle form submission
  }

  clearSavedData() {
    this.formAutoSaveService.clearFormData(this.formId);
  }

  get hasAutoSavedData(): boolean {
    return this.formAutoSaveService.hasFormData(this.formId);
  }

  get autoSaveAge(): number | null {
    return this.formAutoSaveService.getFormDataAge(this.formId);
  }
}
```

## Thực hành tốt nhất

### 1. Handle Refresh Detection Gracefully

```typescript
// ✅ Good: Handle refresh detection with fallbacks
class RefreshAwareService {
  constructor(private refreshService: BrowserRefreshService) {
    if (this.refreshService.isBrowser) {
      this.refreshService.onRefresh(() => {
        this.handlePageRefresh();
      });
    }
  }

  private handlePageRefresh(): void {
    try {
      // Restore application state
      this.restoreState();
      
      // Show user notification if needed
      this.notifyUserOfRefresh();
      
      // Track refresh analytics
      this.trackRefreshEvent();
    } catch (error) {
      console.error('Failed to handle page refresh:', error);
    }
  }
}
```

### 2. Implement State Recovery

```typescript
// ✅ Good: Implement comprehensive state recovery
class StateManager {
  constructor(private refreshService: BrowserRefreshService) {
    this.refreshService.onRefresh(() => {
      this.recoverApplicationState();
    });
  }

  private recoverApplicationState(): void {
    // Recover user session
    this.recoverUserSession();
    
    // Recover form data
    this.recoverFormData();
    
    // Recover UI state
    this.recoverUIState();
    
    // Recover temporary data
    this.recoverTemporaryData();
  }
}
```

### 3. Monitor Refresh Patterns

```typescript
// ✅ Good: Monitor and respond to refresh patterns
class RefreshMonitorService {
  constructor(private refreshService: BrowserRefreshService) {
    this.monitorRefreshBehavior();
  }

  private monitorRefreshBehavior(): void {
    if (this.refreshService.isFrequentRefresher(5, 300000)) {
      // User is refreshing frequently - might indicate issues
      this.handleFrequentRefresh();
    }
    
    const refreshRate = this.refreshService.getRefreshRate();
    if (refreshRate > 2) { // More than 2 refreshes per minute
      this.reportHighRefreshRate(refreshRate);
    }
  }
}
```

### 4. Cleanup Resources

```typescript
// ✅ Good: Proper resource cleanup
@Component({
  selector: 'app-refresh-aware'
})
export class RefreshAwareComponent implements OnDestroy {
  private refreshCallback = this.onRefresh.bind(this);

  constructor(private refreshService: BrowserRefreshService) {
    this.refreshService.onRefresh(this.refreshCallback);
  }

  ngOnDestroy() {
    // Note: BrowserRefreshService doesn't provide unsubscribe method
    // But callbacks are executed only once per page load
    // Consider implementing unsubscribe if needed
  }

  private onRefresh(): void {
    // Handle refresh
  }
}
```

## Cân nhắc về hiệu suất

### 1. Efficient Detection Methods
- Service sử dụng multiple detection methods với fallbacks
- Performance API được ưu tiên cho độ chính xác cao
- Session storage được sử dụng như backup method

### 2. Memory Management
- Callbacks được execute một lần per page load
- Session data được cleanup tự động khi hết hạn
- Minimal memory footprint với lazy initialization

### 3. Storage Optimization
- Sử dụng sessionStorage thay vì localStorage cho temporary data
- JSON serialization được optimize cho performance
- Error handling để tránh storage quota issues

## Khắc phục sự cố

### Common Issues

**1. False Positive Refresh Detection**
```typescript
// Check multiple indicators
if (this.refreshService.isRefresh && 
    this.refreshService.getNavigationType() === 'reload') {
  // High confidence refresh
} else {
  // Might be false positive
}
```

**2. Session Storage Not Available**
```typescript
// Service handles this gracefully with try-catch
// Check debug info for storage availability
const debugInfo = this.refreshService.getDebugInfo();
console.log('Storage available:', debugInfo.sessionData !== null);
```

**3. Performance API Not Supported**
```typescript
// Service automatically falls back to legacy methods
// Check navigation type to see which method was used
const navigationType = this.refreshService.getNavigationType();
if (navigationType.includes('legacy')) {
  // Using fallback detection method
}
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection utilities

## Related Services

- **WindowService**: Window object access
- **PlatformService**: Platform detection
- **StateRecoveryService**: Application state recovery
- **FormAutoSaveService**: Form data persistence