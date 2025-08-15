# Installation & Requirements

## Cài đặt

```bash
npm install @cci-web/shared
```

## Requirements

- Node.js >= 16.0.0
- Angular >= 19.2.0
- TypeScript >= 5.0.0

## Setup

### 1. Import SharedModule

```typescript
import { NgModule } from "@angular/core";
import { SharedModule } from "@cci-web/shared";

@NgModule({
  imports: [
    SharedModule,
    // other modules
  ],
  // ...
})
export class AppModule {}
```

### 2. Standalone Components

Nếu sử dụng standalone components:

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent, CardComponent } from "@cci-web/shared";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <cci-card>
      <cci-button>Click me</cci-button>
    </cci-card>
  `,
})
export class ExampleComponent {}
```

### 3. Import Individual Modules

Để tối ưu bundle size, bạn có thể import từng module riêng lẻ:

```typescript
import { NgModule } from "@angular/core";
import { ComponentsModule } from "@cci-web/shared/components";
import { DirectivesModule } from "@cci-web/shared/directives";
import { PipesModule } from "@cci-web/shared/pipes";

@NgModule({
  imports: [ComponentsModule, DirectivesModule, PipesModule],
  // ...
})
export class FeatureModule {}
```

## Cấu hình

### Theme Configuration

```typescript
import { NgModule } from "@angular/core";
import { SHARED_CONFIG, SharedConfig } from "@cci-web/shared";

const sharedConfig: SharedConfig = {
  theme: {
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontFamily: "Inter, sans-serif",
  },
  components: {
    button: {
      defaultSize: "medium",
      defaultVariant: "primary",
    },
  },
};

@NgModule({
  providers: [{ provide: SHARED_CONFIG, useValue: sharedConfig }],
  // ...
})
export class AppModule {}
```

### CSS Styles

Thêm CSS styles vào `angular.json`:

```json
{
  "styles": ["node_modules/@cci-web/shared/styles/index.css", "src/styles.css"]
}
```

Hoặc import trong `styles.css`:

```css
@import "@cci-web/shared/styles/index.css";
```

## Sử dụng cơ bản

### Components

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-example",
  template: `
    <cci-button variant="primary" size="large" (click)="handleClick()"> Primary Button </cci-button>

    <cci-card title="Card Title">
      <p>Card content goes here</p>
    </cci-card>

    <cci-modal [isOpen]="showModal" (close)="showModal = false">
      <h3>Modal Title</h3>
      <p>Modal content</p>
    </cci-modal>
  `,
})
export class ExampleComponent {
  showModal = false;

  handleClick() {
    this.showModal = true;
  }
}
```

### Directives

```html
<!-- Loading directive -->
<div cciLoading="isLoading">Content to show when not loading</div>

<!-- Tooltip directive -->
<button cciTooltip="This is a tooltip">Hover me</button>

<!-- Click outside directive -->
<div (cciClickOutside)="closeDropdown()">Dropdown content</div>
```

### Pipes

```html
<!-- Date formatting -->
<p>{{ date | cciDate:'dd/MM/yyyy' }}</p>

<!-- Currency formatting -->
<p>{{ price | cciCurrency:'VND' }}</p>

<!-- Text truncation -->
<p>{{ longText | cciTruncate:50 }}</p>

<!-- Safe HTML -->
<div [innerHTML]="htmlContent | cciSafeHtml"></div>
```

### Services

```typescript
import { Injectable } from "@angular/core";
import { NotificationService, LoadingService } from "@cci-web/shared";

@Injectable()
export class ExampleService {
  constructor(private notification: NotificationService, private loading: LoadingService) {}

  async saveData() {
    this.loading.show();

    try {
      // API call
      await this.apiCall();
      this.notification.success("Data saved successfully!");
    } catch (error) {
      this.notification.error("Failed to save data");
    } finally {
      this.loading.hide();
    }
  }
}
```

## Tree Shaking

Để tối ưu bundle size, chỉ import những gì bạn cần:

```typescript
// ✅ Good - chỉ import component cần thiết
import { ButtonComponent } from "@cci-web/shared/components/button";

// ❌ Avoid - import toàn bộ library
import { ButtonComponent } from "@cci-web/shared";
```

## Troubleshooting

### Lỗi thường gặp

1. **Module not found**

   ```
   Cannot resolve '@cci-web/shared'
   ```

   Giải pháp: Đảm bảo đã cài đặt package và restart dev server

2. **Styles not applied**

   ```
   Components render but styles are missing
   ```

   Giải pháp: Import CSS styles trong angular.json hoặc styles.css

3. **Type errors**
   ```
   Property 'xxx' does not exist on type
   ```
   Giải pháp: Cập nhật TypeScript và Angular lên phiên bản tương thích

### Performance Tips

- Sử dụng OnPush change detection strategy
- Import individual modules thay vì SharedModule
- Lazy load components khi có thể
- Sử dụng trackBy functions trong \*ngFor

## Migration Guide

### Từ v1.x lên v2.x

```typescript
// v1.x
import { CciButton } from "@cci-web/shared";

// v2.x
import { ButtonComponent } from "@cci-web/shared/components";
```

Xem [MIGRATION.md](./MIGRATION.md) để biết chi tiết về breaking changes.
