# Constants Module

Module này chứa các hằng số và enum được sử dụng trong toàn bộ thư viện CCI-Web Core.

## Tổng quan

Constants module cung cấp:
- Breakpoint constants cho responsive design
- Configuration enums cho các thiết lập hệ thống
- View type enums cho phân loại giao diện

## Danh sách Constants

### 1. BREAKPOINTS_VALUE

**File**: `breakpoint.constants.ts`

**Mục đích**: Định nghĩa các breakpoint cho responsive design theo Material Design guidelines.

**Cấu trúc**:
```typescript
export const BREAKPOINTS_VALUE = {
  FOR_PHONE_ONLY: "(max-width: 599px)",
  FOR_TABLET_PORTRAIT_UP: "(min-width: 600px) and (max-width: 899px)",
  FOR_TABLET_LANDSCAPE_UP: "(min-width: 900px) and (max-width: 1199px)",
  FOR_DESKTOP_UP: "(min-width: 1200px) and (max-width: 1799px)",
  FOR_BIG_DESKTOP_UP: "(min-width: 1800px)"
};
```

**Mô tả chi tiết**:

| Breakpoint | Kích thước | Mô tả | Thiết bị mục tiêu |
|------------|------------|-------|-------------------|
| `FOR_PHONE_ONLY` | ≤ 599px | Chỉ dành cho điện thoại | Mobile phones |
| `FOR_TABLET_PORTRAIT_UP` | 600px - 899px | Tablet dọc trở lên | Tablets (portrait) |
| `FOR_TABLET_LANDSCAPE_UP` | 900px - 1199px | Tablet ngang trở lên | Tablets (landscape), Small laptops |
| `FOR_DESKTOP_UP` | 1200px - 1799px | Desktop thông thường | Desktop, Large laptops |
| `FOR_BIG_DESKTOP_UP` | ≥ 1800px | Desktop lớn | Large monitors, 4K displays |

**Cách sử dụng**:

```typescript
import { BREAKPOINTS_VALUE } from '@cci-web/core';

// Trong CSS-in-JS
const styles = {
  container: {
    width: '100%',
    [`@media ${BREAKPOINTS_VALUE.FOR_PHONE_ONLY}`]: {
      padding: '8px'
    },
    [`@media ${BREAKPOINTS_VALUE.FOR_DESKTOP_UP}`]: {
      padding: '24px'
    }
  }
};

// Trong Angular BreakpointObserver
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({...})
export class ResponsiveComponent {
  constructor(private breakpointObserver: BreakpointObserver) {
    this.isMobile = this.breakpointObserver.isMatched(
      BREAKPOINTS_VALUE.FOR_PHONE_ONLY
    );
  }
}

// Trong SCSS
@media #{map-get($breakpoints, 'FOR_PHONE_ONLY')} {
  .mobile-only {
    display: block;
  }
}
```

**Best Practices**:
- Sử dụng mobile-first approach khi thiết kế responsive
- Kết hợp với Angular CDK Layout để detect breakpoints
- Tránh hardcode các giá trị breakpoint trong code

### 2. ConfigValues

**File**: `config.enum.ts`

**Mục đích**: Chứa các giá trị cấu hình hệ thống, đặc biệt cho Module Federation.

**Cấu trúc**:
```typescript
export enum ConfigValues {
  REMOTE_FEDERATION_CONFIG_URL = "https://gist.githubusercontent.com/assets/federation.manifest.json"
}
```

**Mô tả chi tiết**:

| Enum Value | Giá trị | Mô tả | Sử dụng |
|------------|---------|-------|----------|
| `REMOTE_FEDERATION_CONFIG_URL` | URL string | URL để tải cấu hình Module Federation từ xa | Micro Frontend architecture |

**Cách sử dụng**:

```typescript
import { ConfigValues } from '@cci-web/core';

// Trong Module Federation setup
const loadRemoteConfig = async () => {
  try {
    const response = await fetch(ConfigValues.REMOTE_FEDERATION_CONFIG_URL);
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to load remote federation config:', error);
    return null;
  }
};

// Trong webpack configuration
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // Sử dụng config URL để load remote modules
        mfe1: `mfe1@${ConfigValues.REMOTE_FEDERATION_CONFIG_URL}/mfe1/remoteEntry.js`
      }
    })
  ]
};

// Trong service để load dynamic modules
@Injectable()
export class FederationService {
  async loadRemoteModule(moduleName: string) {
    const configUrl = ConfigValues.REMOTE_FEDERATION_CONFIG_URL;
    // Logic to load remote module
  }
}
```

**Best Practices**:
- Sử dụng environment variables để override URL trong các môi trường khác nhau
- Implement fallback mechanism khi không thể load remote config
- Cache config để tránh multiple requests

### 3. ViewType

**File**: `view-type.enum.ts`

**Mục đích**: Phân loại các loại giao diện để xử lý logic khác nhau giữa mobile và desktop.

**Cấu trúc**:
```typescript
export enum ViewType {
  MOBILE = "mobile",
  DESKTOP = "desktop"
}
```

**Mô tả chi tiết**:

| Enum Value | Giá trị | Mô tả | Khi nào sử dụng |
|------------|---------|-------|------------------|
| `MOBILE` | "mobile" | Giao diện mobile | Khi screen width ≤ 599px |
| `DESKTOP` | "desktop" | Giao diện desktop | Khi screen width > 599px |

**Cách sử dụng**:

```typescript
import { ViewType } from '@cci-web/core';
import { BreakpointObserver } from '@angular/cdk/layout';

// Trong component để detect view type
@Component({
  selector: 'app-responsive',
  template: `
    <div [ngClass]="viewType">
      <ng-container [ngSwitch]="viewType">
        <mobile-layout *ngSwitchCase="ViewType.MOBILE"></mobile-layout>
        <desktop-layout *ngSwitchCase="ViewType.DESKTOP"></desktop-layout>
      </ng-container>
    </div>
  `
})
export class ResponsiveComponent implements OnInit {
  ViewType = ViewType; // Expose enum to template
  viewType: ViewType = ViewType.DESKTOP;
  
  constructor(private breakpointObserver: BreakpointObserver) {}
  
  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 599px)'])
      .subscribe(result => {
        this.viewType = result.matches ? ViewType.MOBILE : ViewType.DESKTOP;
      });
  }
}

// Trong service để xử lý logic khác nhau
@Injectable()
export class UIService {
  getLayoutConfig(viewType: ViewType) {
    switch (viewType) {
      case ViewType.MOBILE:
        return {
          columns: 1,
          itemsPerPage: 5,
          showSidebar: false
        };
      case ViewType.DESKTOP:
        return {
          columns: 3,
          itemsPerPage: 12,
          showSidebar: true
        };
      default:
        return this.getLayoutConfig(ViewType.DESKTOP);
    }
  }
}

// Trong directive để apply styles
@Directive({
  selector: '[appViewType]'
})
export class ViewTypeDirective implements OnInit {
  @Input() appViewType: ViewType = ViewType.DESKTOP;
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit() {
    this.renderer.addClass(this.el.nativeElement, `view-${this.appViewType}`);
  }
}
```

**Best Practices**:
- Kết hợp với BREAKPOINTS_VALUE để consistency
- Sử dụng trong routing để load different components
- Implement trong state management để track current view type

## Import và Export

**Cách import**:
```typescript
// Import tất cả
import { BREAKPOINTS_VALUE, ConfigValues, ViewType } from '@cci-web/core';

// Import riêng lẻ
import { BREAKPOINTS_VALUE } from '@cci-web/core/constants';
import { ViewType } from '@cci-web/core/constants';
```

**File index.ts**:
```typescript
export * from "./breakpoint.constants";
export * from "./config.enum";
export * from "./view-type.enum";
```

## Validation Rules

### BREAKPOINTS_VALUE
- Tất cả giá trị phải là valid CSS media query strings
- Breakpoints phải không overlap và cover toàn bộ range
- Sử dụng px units để consistency

### ConfigValues
- URLs phải là valid HTTP/HTTPS URLs
- Implement validation khi sử dụng trong production

### ViewType
- Chỉ chấp nhận 2 giá trị: "mobile" và "desktop"
- String values để dễ dàng serialize/deserialize

## Lỗi thường gặp và cách khắc phục

### 1. Breakpoint không hoạt động
**Lỗi**: Media queries không trigger đúng
**Nguyên nhân**: Sử dụng sai syntax hoặc conflict với CSS khác
**Giải pháp**:
```typescript
// ❌ Sai
const mediaQuery = BREAKPOINTS_VALUE.FOR_PHONE_ONLY.replace('(', '').replace(')', '');

// ✅ Đúng
const mediaQuery = BREAKPOINTS_VALUE.FOR_PHONE_ONLY;
this.breakpointObserver.observe([mediaQuery]);
```

### 2. Enum không được recognize
**Lỗi**: TypeScript không nhận diện enum values
**Nguyên nhân**: Import sai hoặc chưa build
**Giải pháp**:
```typescript
// ❌ Sai
import ViewType from '@cci-web/core';

// ✅ Đúng
import { ViewType } from '@cci-web/core';
```

### 3. Config URL không accessible
**Lỗi**: Cannot fetch remote federation config
**Nguyên nhân**: Network issues hoặc CORS
**Giải pháp**:
```typescript
const loadConfigWithFallback = async () => {
  try {
    const response = await fetch(ConfigValues.REMOTE_FEDERATION_CONFIG_URL);
    if (!response.ok) throw new Error('Config not available');
    return await response.json();
  } catch (error) {
    console.warn('Using fallback config:', error);
    return DEFAULT_FEDERATION_CONFIG;
  }
};
```

## Performance Considerations

- **BREAKPOINTS_VALUE**: Lightweight object, no performance impact
- **ConfigValues**: Cache remote config để tránh multiple network calls
- **ViewType**: Sử dụng với debounce khi listen resize events

```typescript
// Optimize breakpoint detection
@Injectable()
export class BreakpointService {
  private viewType$ = this.breakpointObserver
    .observe([BREAKPOINTS_VALUE.FOR_PHONE_ONLY])
    .pipe(
      debounceTime(100), // Debounce resize events
      map(result => result.matches ? ViewType.MOBILE : ViewType.DESKTOP),
      distinctUntilChanged(), // Only emit when value changes
      shareReplay(1) // Cache latest value
    );
    
  getViewType() {
    return this.viewType$;
  }
}
```