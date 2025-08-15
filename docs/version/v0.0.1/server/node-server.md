# NodeServer

Lớp chính để khởi tạo và cấu hình Express server cho server-side rendering (SSR).

## API Reference

### NodeServer Class

#### Constructor

```typescript
constructor(ssrPort?: number, backendPort?: number)
```

#### Methods

- `loadBootstrap(bootstrap: any): void` - Load Angular bootstrap function
- `setupSSR(): void` - Cấu hình SSR routing
- `setupErrorHandling(): void` - Cấu hình error handling
- `start(): void` - Khởi động server
- `getApp(): express.Application` - Lấy Express app instance
- `getConfig(): ServerConfig` - Lấy cấu hình server

### Tokens

#### SERVER_CONTEXT

```typescript
export const SERVER_CONTEXT: InjectionToken<string>;
```

Injection token để inject server context vào Angular components.

## Sử dụng

```typescript
import { NodeServer } from "@cci-web/server/src/lib/node-server";
import { bootstrap } from "./src/main.server";

// Khởi tạo server
const server = new NodeServer(4000, 3000);

// Load Angular bootstrap function
server.loadBootstrap(bootstrap);

// Cấu hình SSR
server.setupSSR();

// Cấu hình error handling
server.setupErrorHandling();

// Khởi động server
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

## Dependencies

- `express`: ^4.18.0
- `http-proxy-middleware`: ^2.0.0
- `@angular/ssr`: Angular SSR package
- `@angular/common`: ^19.2.0
- `@angular/core`: ^19.2.0
