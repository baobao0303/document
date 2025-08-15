# Installation & Requirements

## Cài đặt

```bash
npm install @cci-web/server
```

## Requirements

- Node.js >= 16.0.0
- Angular >= 19.2.0
- Express >= 4.18.0

## Sử dụng cơ bản

### 1. Khởi tạo Server

```typescript
import { NodeServer } from "@cci-web/server/src/lib/node-server";
import { bootstrap } from "./src/main.server";

// Khởi tạo server với cấu hình port
const server = new NodeServer(
  4000, // SSR port
  3000 // Backend port
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

### 2. Sử dụng Server Context Token

```typescript
import { SERVER_CONTEXT } from "@cci-web/server";
import { inject } from "@angular/core";

@Component({
  selector: "app-example",
  template: `<div>Server Context: {{ serverContext }}</div>`,
})
export class ExampleComponent {
  serverContext = inject(SERVER_CONTEXT, { optional: true });
}
```

## Cấu hình

### Biến môi trường

Server hỗ trợ các biến môi trường sau:

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

### Cấu hình Server

```typescript
interface ServerConfig {
  port: number; // Port cho SSR server
  backendUrl: string; // URL của backend API
  distFolder: string; // Thư mục chứa build output
  browserFolder: string; // Thư mục chứa client files
  indexHtmlPath: string; // Đường dẫn đến index.html
}
```

## Ví dụ nâng cao

### Custom Express Middleware

```typescript
const server = new NodeServer(4000, 3000);
const app = server.getApp();

// Thêm custom middleware
app.use("/custom", (req, res, next) => {
  // Custom logic
  next();
});

server.setupSSR();
server.start();
```

### Production Deployment

```typescript
// server.js
import { NodeServer } from "@cci-web/server/src/lib/node-server";
import { bootstrap } from "./dist/main.server.js";

const server = new NodeServer(process.env.PORT || 4000, process.env.BACKEND_PORT || 3000);

server.loadBootstrap(bootstrap);
server.setupSSR();
server.setupErrorHandling();
server.start();
```

## Troubleshooting

### Lỗi thường gặp

1. **Port already in use**

   ```
   ❌ Port 4000 is already in use.
   ```

   Giải pháp: Thay đổi port hoặc kill process đang sử dụng port

2. **Bootstrap function not loaded**

   ```
   Bootstrap function not loaded. Call loadBootstrap() first.
   ```

   Giải pháp: Gọi `server.loadBootstrap()` trước khi setup SSR

3. **Index.html not found**
   ```
   [SSR] index.html not found
   ```
   Giải pháp: Đảm bảo đã build ứng dụng Angular trước khi chạy SSR