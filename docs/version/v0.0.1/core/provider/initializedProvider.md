# Initialized Provider

## Tổng quan

`Initialized Provider` là một provider pattern giúp khởi tạo ứng dụng Angular trước khi nó chạy, đảm bảo các service và configuration được setup đúng cách trước khi user tương tác với app.

## Cách sử dụng

### Trong app.config.ts (Cách 1):

```typescript
import { ApplicationConfig } from "@angular/core";
import { initializeAppConfig } from "./core/providers/initialized.provider";

export const appConfig: ApplicationConfig = {
  ...initializeAppConfig,
  providers: [
    ...initializeAppConfig.providers,
    // other providers
  ],
};
```

`initializeAppConfig` là một **object configuration** đã được setup sẵn với app initializer provider.

```typescript
// Đây là những gì initializeAppConfig chứa
export const initializeAppConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const initializerFn = initializeApplication(inject(ContextAwareAppInitializeService));
      return initializerFn();
    }),
  ],
};
```

**Giải thích đơn giản**: `initializeAppConfig` giống như một "gói setup hoàn chỉnh" đã được đóng gói sẵn. Bạn chỉ cần dùng `...initializeAppConfig` là có ngay app initializer.

### Trong app.config.ts (Cách 2):

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideAppInitialization } from "./core/providers/initialized.provider";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitialization(),
    // other providers
  ],
};
```

`provideAppInitialization()` là một **function** trả về provider cho app initialization.

### Bên trong provideAppInitialization() có gì?

```typescript
// Đây là những gì provideAppInitialization() trả về
export function provideAppInitialization() {
  return provideAppInitializer(() => {
    const initializerFn = initializeApplication(inject(ContextAwareAppInitializeService));
    return initializerFn();
  });
}
```

**Giải thích đơn giản**: `provideAppInitialization()` giống như một "công cụ tạo provider" cho app initialization. Khi bạn gọi function này, nó trả về một provider đã được setup sẵn.

**Lưu ý**: Khác với `initializeAppConfig`, `provideAppInitialization` là function nên cần gọi với `()`.

### Trong Service để check initialization:

```typescript
import { Injectable } from "@angular/core";
import { ContextAwareAppInitializeService } from "./context-aware-app-initialize.service";

@Injectable({ providedIn: "root" })
export class SomeService {
  constructor(private appInit: ContextAwareAppInitializeService) {}

  doSomething() {
    if (this.appInit.isInitialized()) {
      // App đã sẵn sàng, có thể thực hiện logic
      this.performAction();
    }
  }
}
```
