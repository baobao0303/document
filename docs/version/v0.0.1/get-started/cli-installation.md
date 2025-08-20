# Cài đặt bằng CLI

Trang này hướng dẫn cài đặt các package CCI Web Framework bao gồm Core, Shared và Server.

## Yêu cầu hệ thống

- Node.js >= 18.x
- NPM >= 9.x hoặc Yarn >= 1.22.x
- Angular >= 19.2.0
- TypeScript >= 5.0.0

## 1. Cài đặt Core Package

Core package chứa các services và utilities cơ bản:

```bash
npm install @cci-web/core
```

### Import Core Module

```typescript
import { NgModule } from '@angular/core';
import { CoreModule } from '@cci-web/core';

@NgModule({
  imports: [
    CoreModule,
    // other modules
  ],
  // ...
})
export class AppModule {}
```

### Sử dụng Services

```typescript
import { ApiService, AuthService } from '@cci-web/core';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `<div>Core services ready!</div>`
})
export class ExampleComponent {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
}
```

## 2. Cài đặt Shared Package

Shared package chứa các components, directives và pipes tái sử dụng:

```bash
npm install @cci-web/shared
```

### Import Shared Module

```typescript
import { NgModule } from '@angular/core';
import { SharedModule } from '@cci-web/shared';

@NgModule({
  imports: [
    SharedModule,
    // other modules
  ],
  // ...
})
export class AppModule {}
```

### Sử dụng Components

```typescript
@Component({
  selector: 'app-example',
  template: `
    <cci-button variant="primary" size="large">
      Primary Button
    </cci-button>
    
    <cci-card title="Card Title">
      <p>Card content goes here</p>
    </cci-card>
  `
})
export class ExampleComponent {}
```

## 3. Cài đặt Server Package

Server package cho SSR và backend integration:

```bash
npm install @cci-web/server
```

### Khởi tạo Server

```typescript
import { NodeServer } from '@cci-web/server/src/lib/node-server';
import { bootstrap } from './src/main.server';

// Khởi tạo server với cấu hình port
const server = new NodeServer(
  4000, // SSR port
  3000  // Backend port
);

// Load Angular bootstrap function
server.loadBootstrap(bootstrap);

// Cấu hình SSR
server.setupSSR();

// Cấu hình error handling
server.setupErrorHandling();

// Khởi động server
server.start();
```

## 4. Cài đặt tất cả packages

Cài đặt tất cả packages cùng lúc:

```bash
npm install @cci-web/core @cci-web/shared @cci-web/server
```

## 5. Cấu hình CSS Styles

Thêm CSS styles vào `angular.json`:

```json
{
  "styles": [
    "node_modules/@cci-web/shared/styles/index.css",
    "src/styles.css"
  ]
}
```

Hoặc import trong `styles.css`:

```css
@import '@cci-web/shared/styles/index.css';
```

## 6. Biến môi trường

Cấu hình các biến môi trường cần thiết:

```bash
# Port cho SSR server
SSR_PORT=4000
PORT=4000

# Port cho backend API
BACKEND_PORT=3000

# URL của backend (tùy chọn)
BACKEND_URL=https://api.example.com

# Môi trường
NODE_ENV=production
```

## Troubleshooting

### Lỗi thường gặp

1. **Module not found**
   ```
   Cannot resolve '@cci-web/core'
   ```
   Giải pháp: Đảm bảo đã cài đặt package và restart dev server

2. **Styles not applied**
   ```
   Components render but styles are missing
   ```
   Giải pháp: Import CSS styles trong angular.json hoặc styles.css

3. **Port already in use**
   ```
   ❌ Port 4000 is already in use.
   ```
   Giải pháp: Thay đổi port hoặc kill process đang sử dụng port

## Hoàn tất!

Bạn đã cài đặt thành công CCI Web Framework. Bây giờ có thể sử dụng các services, components và server utilities trong dự án Angular của mình!
