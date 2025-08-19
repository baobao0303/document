# Breakpoint Service - Quản lý responsive breakpoints

## Giới thiệu

Breakpoint Service cung cấp hệ thống quản lý responsive breakpoints cho ứng dụng Angular, sử dụng Angular CDK Layout để theo dõi và phản ứng với các thay đổi kích thước màn hình. Service này giúp xác định thiết bị hiện tại và cung cấp observable stream để components có thể phản ứng với thay đổi breakpoint.

## Tính năng chính

- **Reactive Breakpoint Detection**: Theo dõi thay đổi breakpoint theo thời gian thực
- **Multiple Device Support**: Hỗ trợ phone, tablet portrait, tablet landscape, desktop và big desktop
- **Observable Stream**: Cung cấp observable để components subscribe
- **Type Safety**: Interface rõ ràng cho tất cả breakpoint states
- **CDK Integration**: Sử dụng Angular CDK BreakpointObserver

## Giao diện và Kiểu

### Breakpoints Interface

```typescript
export interface Breakpoints {
  /** Chỉ dành cho điện thoại (mobile only) */
  isPhoneOnly: boolean;
  /** Tablet portrait trở lên */
  isTabletPortraitUp: boolean;
  /** Tablet landscape trở lên */
  isTabletLandscapeUp: boolean;
  /** Desktop trở lên */
  isDesktopUp: boolean;
  /** Big desktop trở lên */
  isBigDesktopUp: boolean;
}
```

### Breakpoint Constants

```typescript
// Từ BREAKPOINTS_VALUE constants
export const BREAKPOINTS_VALUE = {
  FOR_PHONE_ONLY: '(max-width: 767px)',
  FOR_TABLET_PORTRAIT_UP: '(min-width: 768px)',
  FOR_TABLET_LANDSCAPE_UP: '(min-width: 1024px)',
  FOR_DESKTOP_UP: '(min-width: 1200px)',
  FOR_BIG_DESKTOP_UP: '(min-width: 1440px)'
};
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `breakpointsResult$` | `Observable<Breakpoints>` | Observable stream của breakpoint states |

### Phương thức

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setBreakpoints()` | `setBreakpoints(breakpoints: Breakpoints): void` | Cập nhật breakpoint states (internal use) |
| `getBreakpoints()` | `getBreakpoints(): Breakpoints` | Lấy breakpoint states hiện tại |

## Chi tiết triển khai

### Service Implementation

```typescript
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { BREAKPOINTS_VALUE } from "../constants/breakpoint.constants";

@Injectable({
  providedIn: "root"
})
export class BreakpointService {
  private BreakpointsSubject: BehaviorSubject<Breakpoints> =
    new BehaviorSubject<Breakpoints>({
      isBigDesktopUp: false,
      isDesktopUp: false,
      isPhoneOnly: false,
      isTabletLandscapeUp: false,
      isTabletPortraitUp: false
    });

  breakpointsResult$ = this.BreakpointsSubject.asObservable();

  private readonly breakpoint$ = this.breakpointObserver
    .observe([
      BREAKPOINTS_VALUE.FOR_BIG_DESKTOP_UP,
      BREAKPOINTS_VALUE.FOR_DESKTOP_UP,
      BREAKPOINTS_VALUE.FOR_TABLET_LANDSCAPE_UP,
      BREAKPOINTS_VALUE.FOR_TABLET_PORTRAIT_UP,
      BREAKPOINTS_VALUE.FOR_PHONE_ONLY
    ])
    .pipe(distinctUntilChanged());

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpoint$.subscribe(state => {
      const newBreakpoints: Breakpoints = {
        isPhoneOnly: state.breakpoints[BREAKPOINTS_VALUE.FOR_PHONE_ONLY],
        isTabletPortraitUp:
          state.breakpoints[BREAKPOINTS_VALUE.FOR_TABLET_PORTRAIT_UP],
        isTabletLandscapeUp:
          state.breakpoints[BREAKPOINTS_VALUE.FOR_TABLET_LANDSCAPE_UP],
        isDesktopUp: state.breakpoints[BREAKPOINTS_VALUE.FOR_DESKTOP_UP],
        isBigDesktopUp: state.breakpoints[BREAKPOINTS_VALUE.FOR_BIG_DESKTOP_UP]
      };

      this.setBreakpoints(newBreakpoints);
    });
  }

  public setBreakpoints(breakpoints: Breakpoints) {
    this.BreakpointsSubject.next(breakpoints);
  }

  public getBreakpoints(): Breakpoints {
    return this.BreakpointsSubject.getValue()
      ? this.BreakpointsSubject.getValue()
      : {
          isPhoneOnly: false,
          isTabletPortraitUp: false,
          isTabletLandscapeUp: true,
          isDesktopUp: false,
          isBigDesktopUp: false
        };
  }
}
```

## Cách sử dụng

### Basic Usage trong Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointService, Breakpoints } from '@cci-web/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-responsive-component',
  template: `
    <div class="container">
      <div *ngIf="breakpoints.isPhoneOnly" class="mobile-layout">
        Mobile Layout
      </div>
      <div *ngIf="breakpoints.isTabletPortraitUp && !breakpoints.isDesktopUp" class="tablet-layout">
        Tablet Layout
      </div>
      <div *ngIf="breakpoints.isDesktopUp" class="desktop-layout">
        Desktop Layout
      </div>
    </div>
  `
})
export class ResponsiveComponent implements OnInit, OnDestroy {
  breakpoints: Breakpoints = {
    isPhoneOnly: false,
    isTabletPortraitUp: false,
    isTabletLandscapeUp: false,
    isDesktopUp: false,
    isBigDesktopUp: false
  };

  private destroy$ = new Subject<void>();

  constructor(private breakpointService: BreakpointService) {}

  ngOnInit() {
    // Subscribe to breakpoint changes
    this.breakpointService.breakpointsResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakpoints => {
        this.breakpoints = breakpoints;
        this.handleBreakpointChange(breakpoints);
      });

    // Get current breakpoints
    this.breakpoints = this.breakpointService.getBreakpoints();
  }

  private handleBreakpointChange(breakpoints: Breakpoints) {
    if (breakpoints.isPhoneOnly) {
      console.log('Switched to mobile view');
    } else if (breakpoints.isDesktopUp) {
      console.log('Switched to desktop view');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Sử dụng trong Service

```typescript
import { Injectable } from '@angular/core';
import { BreakpointService } from '@cci-web/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  constructor(private breakpointService: BreakpointService) {}

  // Get device type as string
  getDeviceType() {
    return this.breakpointService.breakpointsResult$.pipe(
      map(breakpoints => {
        if (breakpoints.isPhoneOnly) return 'mobile';
        if (breakpoints.isTabletPortraitUp && !breakpoints.isDesktopUp) return 'tablet';
        if (breakpoints.isDesktopUp) return 'desktop';
        return 'unknown';
      })
    );
  }

  // Check if mobile
  isMobile() {
    return this.breakpointService.breakpointsResult$.pipe(
      map(breakpoints => breakpoints.isPhoneOnly)
    );
  }

  // Get columns count based on breakpoint
  getColumnsCount() {
    return this.breakpointService.breakpointsResult$.pipe(
      map(breakpoints => {
        if (breakpoints.isPhoneOnly) return 1;
        if (breakpoints.isTabletPortraitUp && !breakpoints.isDesktopUp) return 2;
        if (breakpoints.isDesktopUp && !breakpoints.isBigDesktopUp) return 3;
        if (breakpoints.isBigDesktopUp) return 4;
        return 2;
      })
    );
  }
}
```

### Sử dụng với Async Pipe

```typescript
@Component({
  selector: 'app-grid',
  template: `
    <div class="grid" 
         [class.grid-mobile]="(breakpointService.breakpointsResult$ | async)?.isPhoneOnly"
         [class.grid-tablet]="(breakpointService.breakpointsResult$ | async)?.isTabletPortraitUp && !(breakpointService.breakpointsResult$ | async)?.isDesktopUp"
         [class.grid-desktop]="(breakpointService.breakpointsResult$ | async)?.isDesktopUp">
      
      <div class="grid-item" *ngFor="let item of items">
        {{ item.title }}
      </div>
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      gap: 16px;
    }
    .grid-mobile {
      grid-template-columns: 1fr;
    }
    .grid-tablet {
      grid-template-columns: repeat(2, 1fr);
    }
    .grid-desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  `]
})
export class GridComponent {
  items = [
    { title: 'Item 1' },
    { title: 'Item 2' },
    { title: 'Item 3' }
  ];

  constructor(public breakpointService: BreakpointService) {}
}
```

## Integration với Responsive Service

Breakpoint Service thường được sử dụng cùng với Responsive Service:

```typescript
import { Injectable } from "@angular/core";
import { BreakpointService } from "./breakpoint.service";
import { BehaviorSubject } from "rxjs";
import { ViewType } from "../constants/view-type.enum";

@Injectable({
  providedIn: "root",
})
export class ResponsiveService {
  private currentView = new BehaviorSubject<ViewType>(ViewType.DESKTOP);
  currentView$ = this.currentView.asObservable();

  constructor(private breakpointService: BreakpointService) {
    this.breakpointService.breakpointsResult$.subscribe((breakpoints) => {
      if (breakpoints.isDesktopUp) {
        this.currentView.next(ViewType.DESKTOP);
      } else if (breakpoints.isPhoneOnly) {
        this.currentView.next(ViewType.MOBILE);
      } else {
        this.currentView.next(ViewType.DESKTOP); // Default to desktop
      }
    });
  }
}
```

## Breakpoint Ranges

| Breakpoint | Range | Device Type | Typical Use Case |
|------------|-------|-------------|------------------|
| `isPhoneOnly` | 0px - 767px | Mobile phones | Single column layout, touch-optimized UI |
| `isTabletPortraitUp` | 768px+ | Tablet portrait+ | Two column layout, larger touch targets |
| `isTabletLandscapeUp` | 1024px+ | Tablet landscape+ | Multi-column layout, more content density |
| `isDesktopUp` | 1200px+ | Desktop | Full desktop layout, hover interactions |
| `isBigDesktopUp` | 1440px+ | Large desktop | Wide layouts, maximum content density |

## Thực hành tốt nhất

### 1. Unsubscribe Pattern

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.breakpointService.breakpointsResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakpoints => {
        // Handle breakpoint changes
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. Combine với OnPush Strategy

```typescript
@Component({
  selector: 'app-optimized',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="getLayoutClass() | async">
      Content
    </div>
  `
})
export class OptimizedComponent {
  constructor(
    private breakpointService: BreakpointService,
    private cdr: ChangeDetectorRef
  ) {}

  getLayoutClass() {
    return this.breakpointService.breakpointsResult$.pipe(
      map(breakpoints => ({
        'mobile-layout': breakpoints.isPhoneOnly,
        'tablet-layout': breakpoints.isTabletPortraitUp && !breakpoints.isDesktopUp,
        'desktop-layout': breakpoints.isDesktopUp
      }))
    );
  }
}
```

### 3. Caching Current State

```typescript
export class CachedBreakpointComponent implements OnInit {
  currentBreakpoints: Breakpoints;

  constructor(private breakpointService: BreakpointService) {}

  ngOnInit() {
    // Get initial state
    this.currentBreakpoints = this.breakpointService.getBreakpoints();
    
    // Subscribe to changes
    this.breakpointService.breakpointsResult$.subscribe(breakpoints => {
      this.currentBreakpoints = breakpoints;
    });
  }

  isMobileView(): boolean {
    return this.currentBreakpoints?.isPhoneOnly || false;
  }
}
```

## Cân nhắc về hiệu suất

- **Efficient Observables**: Service sử dụng `distinctUntilChanged()` để tránh emit duplicate values
- **Single Instance**: Service được provide ở root level, đảm bảo singleton pattern
- **Memory Management**: Luôn unsubscribe để tránh memory leaks
- **CDK Integration**: Tận dụng Angular CDK's optimized breakpoint detection

## Khắc phục sự cố

### Common Issues

1. **Breakpoints không update**
   - Đảm bảo đã import LayoutModule từ @angular/cdk/layout
   - Kiểm tra CSS media queries có đúng không

2. **Memory leaks**
   - Luôn unsubscribe trong ngOnDestroy
   - Sử dụng takeUntil pattern

3. **Initial state không đúng**
   - Sử dụng getBreakpoints() để lấy state hiện tại
   - Đợi first emission từ observable

## Phụ thuộc

- `@angular/cdk/layout` - BreakpointObserver
- `rxjs` - BehaviorSubject, distinctUntilChanged
- `BREAKPOINTS_VALUE` constants

## Tóm tắt

Breakpoint Service là component cốt lõi cho responsive design trong ứng dụng Angular, cung cấp reactive breakpoint detection với performance cao và API dễ sử dụng. Service tích hợp chặt chẽ với Angular CDK và cung cấp type-safe interface cho tất cả breakpoint states.