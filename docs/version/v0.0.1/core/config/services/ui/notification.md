# Notification Service - Hệ thống thông báo toàn cục

## Giới thiệu

Notification Service cung cấp hệ thống thông báo toàn cục cho ứng dụng Angular. Service này cho phép hiển thị các loại thông báo khác nhau (success, error, warning, info) từ bất kỳ đâu trong ứng dụng, với khả năng tùy chỉnh thời gian hiển thị, vị trí và styling.

## Tính năng chính

- **Multiple Notification Types**: Hỗ trợ success, error, warning, info
- **Global Notification System**: Quản lý thông báo toàn cục
- **Auto Dismiss**: Tự động ẩn thông báo sau thời gian định trước
- **Queue Management**: Quản lý hàng đợi thông báo
- **Customizable**: Tùy chỉnh styling, position, duration
- **Observable Streams**: Cung cấp observable để components subscribe
- **Memory Management**: Tự động cleanup để tránh memory leaks

## Types và Interfaces

### NotificationType Enum

```typescript
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}
```

### NotificationPosition Enum

```typescript
export enum NotificationPosition {
  TOP_RIGHT = 'top-right',
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center'
}
```

### Giao diện Notification

```typescript
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  actions?: NotificationAction[];
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationConfig {
  duration?: number;
  position?: NotificationPosition;
  maxNotifications?: number;
  dismissible?: boolean;
  showProgress?: boolean;
  pauseOnHover?: boolean;
}
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `notifications$` | `Observable<Notification[]>` | Observable stream của danh sách thông báo |
| `config$` | `Observable<NotificationConfig>` | Observable của cấu hình hiện tại |

### Phương thức

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `success()` | `success(message: string, title?: string, config?: Partial<NotificationConfig>): string` | Hiển thị thông báo success |
| `error()` | `error(message: string, title?: string, config?: Partial<NotificationConfig>): string` | Hiển thị thông báo error |
| `warning()` | `warning(message: string, title?: string, config?: Partial<NotificationConfig>): string` | Hiển thị thông báo warning |
| `info()` | `info(message: string, title?: string, config?: Partial<NotificationConfig>): string` | Hiển thị thông báo info |
| `show()` | `show(notification: Partial<Notification>): string` | Hiển thị thông báo tùy chỉnh |
| `dismiss()` | `dismiss(id: string): void` | Ẩn thông báo theo ID |
| `dismissAll()` | `dismissAll(): void` | Ẩn tất cả thông báo |
| `updateConfig()` | `updateConfig(config: Partial<NotificationConfig>): void` | Cập nhật cấu hình |

## Chi tiết triển khai

### Triển khai Service

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { UnsubscribeOnDestroyAdapter } from '../utils/unsubscribe-on-destroy.adapter';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends UnsubscribeOnDestroyAdapter {
  private _notifications = new BehaviorSubject<Notification[]>([]);
  private _config = new BehaviorSubject<NotificationConfig>({
    duration: 5000,
    position: NotificationPosition.TOP_RIGHT,
    maxNotifications: 5,
    dismissible: true,
    showProgress: true,
    pauseOnHover: false
  });

  public readonly notifications$ = this._notifications.asObservable();
  public readonly config$ = this._config.asObservable();

  constructor() {
    super();
  }

  success(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      type: NotificationType.SUCCESS,
      message,
      title,
      ...config
    });
  }

  error(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      type: NotificationType.ERROR,
      message,
      title,
      duration: 0, // Error notifications don't auto-dismiss by default
      ...config
    });
  }

  warning(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      type: NotificationType.WARNING,
      message,
      title,
      ...config
    });
  }

  info(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      type: NotificationType.INFO,
      message,
      title,
      ...config
    });
  }

  show(notification: Partial<Notification>): string {
    const config = this._config.value;
    const id = this.generateId();
    
    const newNotification: Notification = {
      id,
      type: NotificationType.INFO,
      message: '',
      duration: config.duration,
      dismissible: config.dismissible,
      timestamp: new Date(),
      ...notification
    };

    const currentNotifications = this._notifications.value;
    let updatedNotifications = [...currentNotifications, newNotification];

    // Limit max notifications
    if (updatedNotifications.length > config.maxNotifications!) {
      updatedNotifications = updatedNotifications.slice(-config.maxNotifications!);
    }

    this._notifications.next(updatedNotifications);

    // Auto dismiss if duration > 0
    if (newNotification.duration && newNotification.duration > 0) {
      timer(newNotification.duration)
        .pipe(take(1))
        .subscribe(() => {
          this.dismiss(id);
        });
    }

    return id;
  }

  dismiss(id: string): void {
    const currentNotifications = this._notifications.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this._notifications.next(updatedNotifications);
  }

  dismissAll(): void {
    this._notifications.next([]);
  }

  updateConfig(config: Partial<NotificationConfig>): void {
    const currentConfig = this._config.value;
    const updatedConfig = { ...currentConfig, ...config };
    this._config.next(updatedConfig);
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Cách sử dụng

### Sử dụng cơ bản trong Component

```typescript
import { Component } from '@angular/core';
import { NotificationService } from '@cci-web/core';

@Component({
  selector: 'app-notification-demo',
  template: `
    <div class="demo-container">
      <h2>Notification Demo</h2>
      
      <div class="button-group">
        <button mat-raised-button color="primary" (click)="showSuccess()">
          Show Success
        </button>
        
        <button mat-raised-button color="accent" (click)="showInfo()">
          Show Info
        </button>
        
        <button mat-raised-button color="warn" (click)="showWarning()">
          Show Warning
        </button>
        
        <button mat-raised-button color="warn" (click)="showError()">
          Show Error
        </button>
        
        <button mat-raised-button (click)="showCustom()">
          Show Custom
        </button>
        
        <button mat-stroked-button (click)="dismissAll()">
          Dismiss All
        </button>
      </div>
      
      <div class="config-section">
        <h3>Configuration</h3>
        <mat-form-field>
          <mat-label>Position</mat-label>
          <mat-select [(value)]="selectedPosition" (selectionChange)="updatePosition()">
            <mat-option value="top-right">Top Right</mat-option>
            <mat-option value="top-left">Top Left</mat-option>
            <mat-option value="top-center">Top Center</mat-option>
            <mat-option value="bottom-right">Bottom Right</mat-option>
            <mat-option value="bottom-left">Bottom Left</mat-option>
            <mat-option value="bottom-center">Bottom Center</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Duration (ms)</mat-label>
          <input matInput type="number" [(ngModel)]="duration" (change)="updateDuration()">
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin: 2rem 0;
    }
    
    .config-section {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .config-section mat-form-field {
      margin-right: 1rem;
    }
  `]
})
export class NotificationDemoComponent {
  selectedPosition = 'top-right';
  duration = 5000;

  constructor(private notificationService: NotificationService) {}

  showSuccess() {
    this.notificationService.success(
      'Operation completed successfully!',
      'Success'
    );
  }

  showInfo() {
    this.notificationService.info(
      'Here is some useful information for you.',
      'Information'
    );
  }

  showWarning() {
    this.notificationService.warning(
      'Please check your input before proceeding.',
      'Warning'
    );
  }

  showError() {
    this.notificationService.error(
      'An error occurred while processing your request.',
      'Error'
    );
  }

  showCustom() {
    this.notificationService.show({
      type: NotificationType.INFO,
      title: 'Custom Notification',
      message: 'This is a custom notification with actions.',
      duration: 10000,
      actions: [
        {
          label: 'View Details',
          action: () => console.log('View details clicked'),
          style: 'primary'
        },
        {
          label: 'Dismiss',
          action: () => console.log('Dismiss clicked'),
          style: 'secondary'
        }
      ]
    });
  }

  dismissAll() {
    this.notificationService.dismissAll();
  }

  updatePosition() {
    this.notificationService.updateConfig({
      position: this.selectedPosition as NotificationPosition
    });
  }

  updateDuration() {
    this.notificationService.updateConfig({
      duration: this.duration
    });
  }
}
```

### Notification Container Component

```typescript
@Component({
  selector: 'app-notification-container',
  template: `
    <div class="notification-container" [ngClass]="getPositionClass()">
      <div *ngFor="let notification of notifications$ | async; trackBy: trackByFn"
           class="notification"
           [ngClass]="getNotificationClass(notification)"
           [@slideInOut]
           (mouseenter)="onMouseEnter(notification)"
           (mouseleave)="onMouseLeave(notification)">
        
        <!-- Notification Icon -->
        <div class="notification-icon">
          <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
        </div>
        
        <!-- Notification Content -->
        <div class="notification-content">
          <div *ngIf="notification.title" class="notification-title">
            {{ notification.title }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          
          <!-- Actions -->
          <div *ngIf="notification.actions?.length" class="notification-actions">
            <button *ngFor="let action of notification.actions"
                    mat-button
                    [color]="action.style === 'primary' ? 'primary' : action.style === 'danger' ? 'warn' : ''"
                    (click)="executeAction(action, notification.id)">
              {{ action.label }}
            </button>
          </div>
        </div>
        
        <!-- Dismiss Button -->
        <button *ngIf="notification.dismissible"
                class="notification-dismiss"
                mat-icon-button
                (click)="dismiss(notification.id)">
          <mat-icon>close</mat-icon>
        </button>
        
        <!-- Progress Bar -->
        <div *ngIf="showProgress && notification.duration && notification.duration > 0"
             class="notification-progress"
             [style.animation-duration.ms]="notification.duration">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      z-index: 10000;
      pointer-events: none;
      max-width: 400px;
      width: 100%;
    }
    
    .notification-container.top-right {
      top: 1rem;
      right: 1rem;
    }
    
    .notification-container.top-left {
      top: 1rem;
      left: 1rem;
    }
    
    .notification-container.top-center {
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .notification-container.bottom-right {
      bottom: 1rem;
      right: 1rem;
    }
    
    .notification-container.bottom-left {
      bottom: 1rem;
      left: 1rem;
    }
    
    .notification-container.bottom-center {
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .notification {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      margin-bottom: 0.5rem;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      position: relative;
      overflow: hidden;
      min-height: 60px;
    }
    
    .notification.success {
      border-left: 4px solid #4caf50;
    }
    
    .notification.error {
      border-left: 4px solid #f44336;
    }
    
    .notification.warning {
      border-left: 4px solid #ff9800;
    }
    
    .notification.info {
      border-left: 4px solid #2196f3;
    }
    
    .notification-icon {
      margin-right: 0.75rem;
      flex-shrink: 0;
    }
    
    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .notification.success .notification-icon mat-icon {
      color: #4caf50;
    }
    
    .notification.error .notification-icon mat-icon {
      color: #f44336;
    }
    
    .notification.warning .notification-icon mat-icon {
      color: #ff9800;
    }
    
    .notification.info .notification-icon mat-icon {
      color: #2196f3;
    }
    
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    
    .notification-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 0.25rem;
      color: #333;
    }
    
    .notification-message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }
    
    .notification-actions {
      margin-top: 0.75rem;
      display: flex;
      gap: 0.5rem;
    }
    
    .notification-dismiss {
      margin-left: 0.5rem;
      flex-shrink: 0;
    }
    
    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #2196f3, #21cbf3);
      animation: progress-countdown linear;
      transform-origin: left;
    }
    
    @keyframes progress-countdown {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
    
    @media (max-width: 768px) {
      .notification-container {
        left: 1rem !important;
        right: 1rem !important;
        max-width: none;
        transform: none !important;
      }
      
      .notification {
        margin-bottom: 0.75rem;
      }
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications$ = this.notificationService.notifications$;
  config$ = this.notificationService.config$;
  showProgress = true;
  
  private pausedNotifications = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.showProgress = config.showProgress || false;
      });
  }

  getPositionClass(): string {
    // This would be determined by the config
    return 'top-right'; // Default
  }

  getNotificationClass(notification: Notification): string {
    return notification.type;
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'check_circle';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.INFO:
        return 'info';
      default:
        return 'info';
    }
  }

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  executeAction(action: NotificationAction, notificationId: string) {
    action.action();
    // Optionally dismiss notification after action
    this.dismiss(notificationId);
  }

  onMouseEnter(notification: Notification) {
    // Pause auto-dismiss on hover if configured
    this.pausedNotifications.add(notification.id);
  }

  onMouseLeave(notification: Notification) {
    // Resume auto-dismiss
    this.pausedNotifications.delete(notification.id);
  }

  trackByFn(index: number, notification: Notification): string {
    return notification.id;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Ví dụ tích hợp Service

```typescript
// API Service với notification integration
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  saveData(data: any): Observable<any> {
    return this.http.post('/api/data', data).pipe(
      tap(() => {
        this.notificationService.success(
          'Data saved successfully!',
          'Success'
        );
      }),
      catchError(error => {
        this.notificationService.error(
          'Failed to save data. Please try again.',
          'Error'
        );
        return throwError(error);
      })
    );
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`/api/items/${id}`).pipe(
      tap(() => {
        this.notificationService.success(
          'Item deleted successfully!'
        );
      }),
      catchError(error => {
        this.notificationService.error(
          'Failed to delete item.',
          'Error'
        );
        return throwError(error);
      })
    );
  }
}

// Form validation với notifications
@Component({
  selector: 'app-form-with-notifications',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="form.get('name')?.hasError('required')">
          Name is required
        </mat-error>
      </mat-form-field>
      
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email">
        <mat-error *ngIf="form.get('email')?.hasError('email')">
          Please enter a valid email
        </mat-error>
      </mat-form-field>
      
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        Submit
      </button>
    </form>
  `
})
export class FormWithNotificationsComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    if (this.form.valid) {
      // Simulate API call
      setTimeout(() => {
        this.notificationService.success(
          'Form submitted successfully!',
          'Success'
        );
        this.form.reset();
      }, 1000);
    } else {
      this.notificationService.warning(
        'Please fill in all required fields.',
        'Form Validation'
      );
    }
  }
}
```

## Mẫu sử dụng nâng cao

### Notification Queue Management

```typescript
@Injectable({
  providedIn: 'root'
})
export class NotificationQueueService {
  private queue: Partial<Notification>[] = [];
  private isProcessing = false;

  constructor(private notificationService: NotificationService) {}

  enqueue(notification: Partial<Notification>) {
    this.queue.push(notification);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const notification = this.queue.shift()!;
      const id = this.notificationService.show(notification);
      
      // Wait for notification to be dismissed or timeout
      await this.waitForDismissal(id, notification.duration || 5000);
      
      // Small delay between notifications
      await this.delay(500);
    }

    this.isProcessing = false;
  }

  private waitForDismissal(id: string, timeout: number): Promise<void> {
    return new Promise(resolve => {
      const subscription = this.notificationService.notifications$.subscribe(notifications => {
        if (!notifications.find(n => n.id === id)) {
          subscription.unsubscribe();
          resolve();
        }
      });

      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe();
        resolve();
      }, timeout);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Persistent Notifications

```typescript
@Injectable({
  providedIn: 'root'
})
export class PersistentNotificationService {
  private readonly STORAGE_KEY = 'persistent_notifications';

  constructor(
    private notificationService: NotificationService,
    private storageService: LocalStorageService
  ) {
    this.loadPersistentNotifications();
  }

  showPersistent(notification: Partial<Notification>): string {
    const id = this.notificationService.show({
      ...notification,
      duration: 0, // Never auto-dismiss
      dismissible: true
    });

    this.savePersistentNotification(id, notification);
    return id;
  }

  dismissPersistent(id: string) {
    this.notificationService.dismiss(id);
    this.removePersistentNotification(id);
  }

  private loadPersistentNotifications() {
    const stored = this.storageService.getItem(this.STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      notifications.forEach((notification: any) => {
        this.notificationService.show(notification);
      });
    }
  }

  private savePersistentNotification(id: string, notification: Partial<Notification>) {
    const stored = this.storageService.getItem(this.STORAGE_KEY) || '[]';
    const notifications = JSON.parse(stored);
    notifications.push({ id, ...notification });
    this.storageService.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
  }

  private removePersistentNotification(id: string) {
    const stored = this.storageService.getItem(this.STORAGE_KEY) || '[]';
    const notifications = JSON.parse(stored);
    const filtered = notifications.filter((n: any) => n.id !== id);
    this.storageService.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}
```

## Thực hành tốt nhất

### 1. Appropriate Notification Types

```typescript
// ✅ Good - Use appropriate types
this.notificationService.success('Data saved successfully!');
this.notificationService.error('Failed to connect to server');
this.notificationService.warning('Your session will expire in 5 minutes');
this.notificationService.info('New features are available');

// ❌ Bad - Wrong type usage
this.notificationService.error('Data saved successfully!'); // Should be success
```

### 2. Clear and Actionable Messages

```typescript
// ✅ Good - Clear and actionable
this.notificationService.error(
  'Failed to save changes. Please check your internet connection and try again.',
  'Save Failed'
);

// ❌ Bad - Vague message
this.notificationService.error('Something went wrong');
```

### 3. Proper Duration Settings

```typescript
// ✅ Good - Appropriate durations
this.notificationService.success('Saved!', undefined, { duration: 3000 }); // Short for success
this.notificationService.error('Error occurred', undefined, { duration: 0 }); // Persistent for errors
this.notificationService.info('Long message...', undefined, { duration: 8000 }); // Longer for complex info
```

### 4. Avoid Notification Spam

```typescript
// ✅ Good - Debounce notifications
private lastNotificationTime = 0;
private readonly NOTIFICATION_DEBOUNCE = 1000;

showDebouncedNotification(message: string) {
  const now = Date.now();
  if (now - this.lastNotificationTime > this.NOTIFICATION_DEBOUNCE) {
    this.notificationService.info(message);
    this.lastNotificationTime = now;
  }
}
```

## Cân nhắc về hiệu suất

- **Queue Management**: Limit số lượng notifications hiển thị đồng thời
- **Memory Management**: Service tự động cleanup subscriptions
- **Animation Performance**: Sử dụng CSS transforms cho smooth animations
- **Mobile Optimization**: Responsive design cho mobile devices

## Khắc phục sự cố

### Common Issues

1. **Notifications không hiển thị**
   - Kiểm tra NotificationContainerComponent đã được add vào app
   - Verify z-index conflicts

2. **Notifications không tự động ẩn**
   - Kiểm tra duration setting
   - Verify timer subscriptions

3. **Performance issues với nhiều notifications**
   - Implement virtual scrolling cho large lists
   - Limit maxNotifications

## Phụ thuộc

- `rxjs` - Observable streams và operators
- `UnsubscribeOnDestroyAdapter` - Memory management
- `@angular/animations` - Slide animations
- `@angular/material` - UI components (optional)

## Tóm tắt

Notification Service cung cấp hệ thống thông báo toàn cục mạnh mẽ và linh hoạt cho ứng dụng Angular. Với hỗ trợ đa dạng loại thông báo, tùy chỉnh styling và vị trí, cùng với khả năng quản lý queue và auto-dismiss, service này giúp cải thiện user experience bằng cách cung cấp feedback kịp thời và rõ ràng cho người dùng.