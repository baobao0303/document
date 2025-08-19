# Responsive Service - Quản lý responsive design

## Giới thiệu

Responsive Service cung cấp hệ thống quản lý responsive design cho ứng dụng Angular. Service này tự động xác định loại view hiện tại (mobile, tablet, desktop) dựa trên breakpoint và cung cấp observable streams để components có thể phản ứng với thay đổi kích thước màn hình.

## Tính năng chính

- **Auto View Detection**: Tự động xác định loại view dựa trên breakpoint
- **Observable Streams**: Cung cấp observable cho view type và breakpoint changes
- **ViewType Integration**: Tích hợp với ViewType enum từ constants
- **Breakpoint Service Integration**: Sử dụng BreakpointService để monitor screen changes
- **Memory Management**: Extends UnsubscribeOnDestroyAdapter
- **Type Safety**: Full TypeScript support

## Types và Interfaces

### ViewType Enum

```typescript
export enum ViewType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}
```

### Breakpoint Mapping

| ViewType | Breakpoint Range | Mô tả |
|----------|------------------|-------|
| `MOBILE` | < 768px | Điện thoại di động |
| `TABLET` | 768px - 1024px | Máy tính bảng |
| `DESKTOP` | > 1024px | Máy tính để bàn |

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `viewType$` | `Observable<ViewType>` | Observable stream của view type hiện tại |
| `isMobile$` | `Observable<boolean>` | Observable cho mobile view |
| `isTablet$` | `Observable<boolean>` | Observable cho tablet view |
| `isDesktop$` | `Observable<boolean>` | Observable cho desktop view |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getCurrentViewType()` | `getCurrentViewType(): ViewType` | Lấy view type hiện tại (sync) |
| `isMobile()` | `isMobile(): boolean` | Kiểm tra có phải mobile view |
| `isTablet()` | `isTablet(): boolean` | Kiểm tra có phải tablet view |
| `isDesktop()` | `isDesktop(): boolean` | Kiểm tra có phải desktop view |

## Implementation Details

### Service Implementation

```typescript
import { Injectable } from '@angular/core';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { BreakpointService } from './breakpoint.service';
import { ViewType } from '../constants/view-type.enum';
import { UnsubscribeOnDestroyAdapter } from '../utils/unsubscribe-on-destroy.adapter';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService extends UnsubscribeOnDestroyAdapter {
  private _viewType = new BehaviorSubject<ViewType>(ViewType.DESKTOP);
  
  public readonly viewType$: Observable<ViewType> = this._viewType.asObservable();
  
  public readonly isMobile$: Observable<boolean> = this.viewType$.pipe(
    map(viewType => viewType === ViewType.MOBILE),
    distinctUntilChanged()
  );
  
  public readonly isTablet$: Observable<boolean> = this.viewType$.pipe(
    map(viewType => viewType === ViewType.TABLET),
    distinctUntilChanged()
  );
  
  public readonly isDesktop$: Observable<boolean> = this.viewType$.pipe(
    map(viewType => viewType === ViewType.DESKTOP),
    distinctUntilChanged()
  );

  constructor(private breakpointService: BreakpointService) {
    super();
    this.initializeViewTypeDetection();
  }

  private initializeViewTypeDetection(): void {
    this.subs.add(
      this.breakpointService.currentBreakpoint$.subscribe(breakpoint => {
        const viewType = this.determineViewType(breakpoint.width);
        this._viewType.next(viewType);
      })
    );
  }

  private determineViewType(width: number): ViewType {
    if (width < 768) {
      return ViewType.MOBILE;
    } else if (width < 1024) {
      return ViewType.TABLET;
    } else {
      return ViewType.DESKTOP;
    }
  }

  getCurrentViewType(): ViewType {
    return this._viewType.value;
  }

  isMobile(): boolean {
    return this.getCurrentViewType() === ViewType.MOBILE;
  }

  isTablet(): boolean {
    return this.getCurrentViewType() === ViewType.TABLET;
  }

  isDesktop(): boolean {
    return this.getCurrentViewType() === ViewType.DESKTOP;
  }
}
```

## Cách sử dụng

### Basic Usage trong Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResponsiveService } from '@cci-web/core';
import { ViewType } from '@cci-web/core/constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-responsive-layout',
  template: `
    <div class="container" [ngClass]="getLayoutClass()">
      <header class="header">
        <h1>Responsive Layout</h1>
        <p>Current view: {{ currentViewType }}</p>
      </header>
      
      <nav class="navigation" *ngIf="!isMobile">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
      
      <main class="content">
        <div class="grid" [ngClass]="getGridClass()">
          <div class="card" *ngFor="let item of items">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </main>
      
      <!-- Mobile menu button -->
      <button class="mobile-menu-btn" *ngIf="isMobile" (click)="toggleMobileMenu()">
        ☰
      </button>
    </div>
  `,
  styles: [`
    .container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .container.mobile {
      padding: 1rem;
    }
    
    .container.tablet {
      padding: 1.5rem;
    }
    
    .container.desktop {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .grid.mobile {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .grid.tablet {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    .grid.desktop {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    
    .mobile-menu-btn {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
  `]
})
export class ResponsiveLayoutComponent implements OnInit, OnDestroy {
  currentViewType: ViewType = ViewType.DESKTOP;
  isMobile = false;
  isTablet = false;
  isDesktop = true;
  
  items = [
    { title: 'Item 1', description: 'Description 1' },
    { title: 'Item 2', description: 'Description 2' },
    { title: 'Item 3', description: 'Description 3' },
    { title: 'Item 4', description: 'Description 4' },
    { title: 'Item 5', description: 'Description 5' },
    { title: 'Item 6', description: 'Description 6' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(private responsiveService: ResponsiveService) {}

  ngOnInit() {
    // Subscribe to view type changes
    this.responsiveService.viewType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(viewType => {
        this.currentViewType = viewType;
      });
    
    // Subscribe to individual view type observables
    this.responsiveService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
      });
    
    this.responsiveService.isTablet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTablet => {
        this.isTablet = isTablet;
      });
    
    this.responsiveService.isDesktop$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDesktop => {
        this.isDesktop = isDesktop;
      });
  }

  getLayoutClass(): string {
    return this.currentViewType.toLowerCase();
  }
  
  getGridClass(): string {
    return this.currentViewType.toLowerCase();
  }
  
  toggleMobileMenu() {
    // Toggle mobile menu logic
    console.log('Toggle mobile menu');
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
  selector: 'app-async-responsive',
  template: `
    <div class="responsive-container">
      <!-- Conditional rendering based on view type -->
      <div *ngIf="responsiveService.isMobile$ | async" class="mobile-layout">
        <h2>Mobile Layout</h2>
        <app-mobile-navigation></app-mobile-navigation>
        <app-mobile-content></app-mobile-content>
      </div>
      
      <div *ngIf="responsiveService.isTablet$ | async" class="tablet-layout">
        <h2>Tablet Layout</h2>
        <div class="tablet-grid">
          <app-sidebar></app-sidebar>
          <app-main-content></app-main-content>
        </div>
      </div>
      
      <div *ngIf="responsiveService.isDesktop$ | async" class="desktop-layout">
        <h2>Desktop Layout</h2>
        <div class="desktop-grid">
          <app-sidebar></app-sidebar>
          <app-main-content></app-main-content>
          <app-right-panel></app-right-panel>
        </div>
      </div>
      
      <!-- View type indicator -->
      <div class="view-indicator">
        Current view: {{ responsiveService.viewType$ | async }}
      </div>
    </div>
  `,
  styles: [`
    .mobile-layout {
      padding: 1rem;
    }
    
    .tablet-grid {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 1rem;
      padding: 1.5rem;
    }
    
    .desktop-grid {
      display: grid;
      grid-template-columns: 250px 1fr 300px;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .view-indicator {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 12px;
    }
  `]
})
export class AsyncResponsiveComponent {
  constructor(public responsiveService: ResponsiveService) {}
}
```

### Responsive Navigation Component

```typescript
@Component({
  selector: 'app-responsive-nav',
  template: `
    <nav class="navigation" [ngClass]="getNavClass()">
      <!-- Desktop/Tablet Navigation -->
      <ul *ngIf="!isMobile" class="nav-list">
        <li *ngFor="let item of navItems" class="nav-item">
          <a [routerLink]="item.route" class="nav-link">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
      
      <!-- Mobile Navigation -->
      <div *ngIf="isMobile" class="mobile-nav">
        <button class="mobile-toggle" (click)="toggleMobileNav()">
          <mat-icon>{{ mobileNavOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
        
        <div class="mobile-menu" [class.open]="mobileNavOpen">
          <ul class="mobile-nav-list">
            <li *ngFor="let item of navItems" class="mobile-nav-item">
              <a [routerLink]="item.route" 
                 class="mobile-nav-link"
                 (click)="closeMobileNav()">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navigation.desktop {
      display: flex;
      justify-content: center;
      padding: 1rem 2rem;
      background: #f5f5f5;
    }
    
    .navigation.tablet {
      padding: 1rem;
      background: #f5f5f5;
    }
    
    .navigation.mobile {
      position: relative;
    }
    
    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 2rem;
    }
    
    .mobile-toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1001;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    .mobile-menu {
      position: fixed;
      top: 0;
      left: -100%;
      width: 80%;
      height: 100vh;
      background: white;
      z-index: 1000;
      transition: left 0.3s ease;
      box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    }
    
    .mobile-menu.open {
      left: 0;
    }
    
    .mobile-nav-list {
      list-style: none;
      margin: 0;
      padding: 4rem 0 0 0;
    }
    
    .mobile-nav-item {
      border-bottom: 1px solid #eee;
    }
    
    .mobile-nav-link {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: #333;
      gap: 1rem;
    }
  `]
})
export class ResponsiveNavComponent implements OnInit, OnDestroy {
  isMobile = false;
  mobileNavOpen = false;
  
  navItems = [
    { route: '/home', icon: 'home', label: 'Home' },
    { route: '/products', icon: 'shopping_cart', label: 'Products' },
    { route: '/about', icon: 'info', label: 'About' },
    { route: '/contact', icon: 'contact_mail', label: 'Contact' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(private responsiveService: ResponsiveService) {}

  ngOnInit() {
    this.responsiveService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
        if (!isMobile) {
          this.mobileNavOpen = false;
        }
      });
  }

  getNavClass(): string {
    return this.responsiveService.getCurrentViewType().toLowerCase();
  }
  
  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
  }
  
  closeMobileNav() {
    this.mobileNavOpen = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Responsive Data Table

```typescript
@Component({
  selector: 'app-responsive-table',
  template: `
    <div class="table-container">
      <!-- Desktop/Tablet Table -->
      <table *ngIf="!isMobile" class="data-table" mat-table [dataSource]="dataSource">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let element">{{ element.id }}</td>
        </ng-container>
        
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>
        
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let element">{{ element.email }}</td>
        </ng-container>
        
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="editItem(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteItem(element)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      
      <!-- Mobile Card Layout -->
      <div *ngIf="isMobile" class="mobile-cards">
        <mat-card *ngFor="let item of dataSource" class="mobile-card">
          <mat-card-header>
            <mat-card-title>{{ item.name }}</mat-card-title>
            <mat-card-subtitle>ID: {{ item.id }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p><strong>Email:</strong> {{ item.email }}</p>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button (click)="editItem(item)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteItem(item)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      padding: 1rem;
    }
    
    .data-table {
      width: 100%;
    }
    
    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .mobile-card {
      width: 100%;
    }
  `]
})
export class ResponsiveTableComponent implements OnInit, OnDestroy {
  isMobile = false;
  displayedColumns = ['id', 'name', 'email', 'actions'];
  
  dataSource = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(private responsiveService: ResponsiveService) {}

  ngOnInit() {
    this.responsiveService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
      });
  }

  editItem(item: any) {
    console.log('Edit item:', item);
  }
  
  deleteItem(item: any) {
    console.log('Delete item:', item);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Advanced Usage Patterns

### Responsive Image Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class ResponsiveImageService {
  constructor(private responsiveService: ResponsiveService) {}

  getImageSrc(basePath: string, filename: string): Observable<string> {
    return this.responsiveService.viewType$.pipe(
      map(viewType => {
        const suffix = this.getImageSuffix(viewType);
        return `${basePath}/${filename}${suffix}`;
      })
    );
  }

  private getImageSuffix(viewType: ViewType): string {
    switch (viewType) {
      case ViewType.MOBILE:
        return '_mobile.jpg';
      case ViewType.TABLET:
        return '_tablet.jpg';
      case ViewType.DESKTOP:
        return '_desktop.jpg';
      default:
        return '_desktop.jpg';
    }
  }
}
```

### Responsive Layout Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class ResponsiveLayoutService {
  constructor(private responsiveService: ResponsiveService) {}

  getGridColumns(): Observable<number> {
    return this.responsiveService.viewType$.pipe(
      map(viewType => {
        switch (viewType) {
          case ViewType.MOBILE:
            return 1;
          case ViewType.TABLET:
            return 2;
          case ViewType.DESKTOP:
            return 3;
          default:
            return 3;
        }
      })
    );
  }

  getContainerPadding(): Observable<string> {
    return this.responsiveService.viewType$.pipe(
      map(viewType => {
        switch (viewType) {
          case ViewType.MOBILE:
            return '1rem';
          case ViewType.TABLET:
            return '1.5rem';
          case ViewType.DESKTOP:
            return '2rem';
          default:
            return '2rem';
        }
      })
    );
  }
}
```

## Best Practices

### 1. Use Async Pipe When Possible

```typescript
// ✅ Good - Async pipe handles subscription automatically
@Component({
  template: `
    <div *ngIf="responsiveService.isMobile$ | async" class="mobile-layout">
      Mobile Content
    </div>
  `
})
export class MyComponent {
  constructor(public responsiveService: ResponsiveService) {}
}
```

### 2. Combine Multiple Observables

```typescript
// ✅ Good - Combine observables for complex logic
export class MyComponent implements OnInit {
  layoutConfig$ = combineLatest([
    this.responsiveService.viewType$,
    this.userPreferences$
  ]).pipe(
    map(([viewType, preferences]) => ({
      columns: this.getColumns(viewType),
      theme: preferences.theme,
      showSidebar: viewType !== ViewType.MOBILE
    }))
  );

  private getColumns(viewType: ViewType): number {
    switch (viewType) {
      case ViewType.MOBILE: return 1;
      case ViewType.TABLET: return 2;
      case ViewType.DESKTOP: return 3;
      default: return 3;
    }
  }
}
```

### 3. Proper Unsubscription

```typescript
// ✅ Good - Proper cleanup
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.responsiveService.viewType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(viewType => {
        // Handle view type change
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Integration với CSS và SCSS

### CSS Classes Based on ViewType

```scss
.responsive-container {
  &.mobile {
    padding: 1rem;
    
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
  
  &.tablet {
    padding: 1.5rem;
    
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }
  
  &.desktop {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
  }
}
```

### Dynamic CSS Custom Properties

```typescript
@Component({
  selector: 'app-dynamic-styles',
  template: `
    <div class="dynamic-container" [style]="containerStyles$ | async">
      <h2>Dynamic Responsive Styles</h2>
      <div class="content">
        Content adapts to screen size
      </div>
    </div>
  `,
  styles: [`
    .dynamic-container {
      transition: all 0.3s ease;
    }
    
    .content {
      background: var(--content-bg, #f5f5f5);
      padding: var(--content-padding, 1rem);
      border-radius: var(--content-radius, 4px);
    }
  `]
})
export class DynamicStylesComponent {
  containerStyles$ = this.responsiveService.viewType$.pipe(
    map(viewType => {
      const styles: any = {};
      
      switch (viewType) {
        case ViewType.MOBILE:
          styles['--content-bg'] = '#e3f2fd';
          styles['--content-padding'] = '0.5rem';
          styles['--content-radius'] = '2px';
          break;
        case ViewType.TABLET:
          styles['--content-bg'] = '#f3e5f5';
          styles['--content-padding'] = '1rem';
          styles['--content-radius'] = '4px';
          break;
        case ViewType.DESKTOP:
          styles['--content-bg'] = '#e8f5e8';
          styles['--content-padding'] = '1.5rem';
          styles['--content-radius'] = '8px';
          break;
      }
      
      return styles;
    })
  );

  constructor(private responsiveService: ResponsiveService) {}
}
```

## Performance Considerations

- **Efficient Change Detection**: Sử dụng distinctUntilChanged() để tránh unnecessary updates
- **Memory Management**: Service tự động cleanup subscriptions
- **Breakpoint Integration**: Tận dụng BreakpointService để tránh duplicate listeners
- **Observable Caching**: BehaviorSubject cung cấp current value ngay lập tức

## Troubleshooting

### Common Issues

1. **ViewType không cập nhật**
   - Kiểm tra BreakpointService có hoạt động đúng
   - Verify breakpoint thresholds

2. **Memory leaks**
   - Service tự động cleanup nhờ UnsubscribeOnDestroyAdapter
   - Đảm bảo proper unsubscription trong components

3. **Performance issues**
   - Sử dụng OnPush change detection strategy
   - Implement trackBy functions cho *ngFor

## Dependencies

- `BreakpointService` - Monitor screen size changes
- `ViewType` enum - View type constants
- `UnsubscribeOnDestroyAdapter` - Memory management
- `rxjs` - Observable streams và operators

## Tóm tắt

Responsive Service cung cấp giải pháp toàn diện để quản lý responsive design trong ứng dụng Angular. Với tích hợp chặt chẽ với BreakpointService và cung cấp các observable streams tiện lợi, service này giúp developers dễ dàng tạo ra các ứng dụng responsive với user experience tối ưu trên mọi thiết bị.