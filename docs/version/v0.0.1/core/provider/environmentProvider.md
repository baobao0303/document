# Environment Provider

## Tổng quan

`Environment Provider` là một provider pattern cung cấp cấu hình môi trường cho ứng dụng Angular, cho phép bạn quản lý các setting khác nhau giữa development, staging và production environments.

## Cách sử dụng

### Bước 1: Tạo Environment Files

```typescript
// environment.ts (development)
export const environment: IEnvironment = {
  production: false,
  author: "Development Team",
  siteUrl: "http://localhost:4200",
  imageUrl: "http://localhost:4200/assets/images",
  cdnUrl: "http://localhost:4200/assets",
};

// environment.prod.ts (production)
export const environment: IEnvironment = {
  production: true,
  author: "Production Team",
  siteUrl: "https://example.com",
  imageUrl: "https://cdn.example.com/images",
  cdnUrl: "https://cdn.example.com",
};
```

### Bước 2: Cung cấp Environment trong App Config

```typescript
import { ApplicationConfig } from "@angular/core";
import { ENVIRONMENT } from "./core/providers/environment.provider";
import { environment } from "./environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ENVIRONMENT,
      useValue: environment,
    },
    // other providers
  ],
};
```

### Bước 3: Trong Service:

```typescript
import { Injectable, Inject } from "@angular/core";
import { ENVIRONMENT, IEnvironment } from "./core/providers/environment.provider";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(@Inject(ENVIRONMENT) private env: IEnvironment) {}

  getApiUrl(): string {
    if (this.env.production) {
      return `${this.env.siteUrl}/api/v1`;
    }
    return `${this.env.siteUrl}/api/dev`;
  }

  getImageUrl(path: string): string {
    return `${this.env.imageUrl}/${path}`;
  }
}
```

### Bước 4: Trong Component:

```typescript
import { Component, Inject } from "@angular/core";
import { ENVIRONMENT, IEnvironment } from "./core/providers/environment.provider";

@Component({
  selector: "app-footer",
  template: `
    <footer>
      <p>&copy; 2024 {{ env.author }}. All rights reserved.</p>
      <p *ngIf="!env.production">Running in development mode</p>
    </footer>
  `,
})
export class FooterComponent {
  constructor(@Inject(ENVIRONMENT) public env: IEnvironment) {}
}
```

### Bước 4: Trong Guard hoặc Interceptor:

```typescript
import { Injectable, Inject } from "@angular/core";
import { ENVIRONMENT, IEnvironment } from "./core/providers/environment.provider";

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(@Inject(ENVIRONMENT) private env: IEnvironment) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.env.production) {
      console.log(`HTTP Request: ${req.method} ${req.url}`);
    }
    return next.handle(req);
  }
}
```
