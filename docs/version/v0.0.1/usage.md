# Các chức năng chính và cách sử dụng

## Core Module

### Configuration Management

```typescript
// Inject configuration
import { APP_CONFIG } from "@core/providers";

@Injectable()
export class MyService {
  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {
    console.log("Cache TTL:", this.config.cache.defaultTtl);
    console.log("API Endpoint:", this.config.gatewayApi.ecomApi);
  }
}
```

### HTTP Interceptors

```typescript
// Tự động được áp dụng khi sử dụng provideCciWebCore
// Bao gồm: Authentication, Error Handling, Loading, Caching

@Injectable()
export class DataService {
  constructor(private http: HttpClient) {}

  getData() {
    // Interceptors sẽ tự động xử lý authentication, caching, error
    return this.http.get("/api/data");
  }
}
```

### Services

```typescript
// Base Service
import { BaseService } from '@core/services';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(http: HttpClient) {
    super(http, '/api/products');
  }

  // Kế thừa các method: get, post, put, delete, getAll
}

// Loading Service
import { LoadingSpinnerService } from '@core/services';

@Component({...})
export class MyComponent {
  constructor(private loading: LoadingSpinnerService) {}

  async loadData() {
    this.loading.show();
    try {
      const data = await this.dataService.getData().toPromise();
      // Process data
    } finally {
      this.loading.hide();
    }
  }
}
```

## Shared Module

### UI Components

```typescript
// Import shared components
import { SharedModule } from "@shared/shared.module";

@NgModule({
  imports: [SharedModule],
  // ...
})
export class FeatureModule {}
```

```html
<!-- Sử dụng shared components -->
<shared-button [type]="'primary'" [loading]="isLoading" (click)="handleClick()">
  Xác nhận
</shared-button>

<shared-modal [visible]="showModal" [title]="'Xác nhận'" (close)="closeModal()">
  <p>Nội dung modal</p>
</shared-modal>
```

### Directives

```html
<!-- Loading directive -->
<div *sharedLoading="isLoading">Nội dung sẽ hiển thị khi không loading</div>

<!-- Permission directive -->
<button *sharedPermission="'admin'">Chỉ admin mới thấy</button>
```

### Pipes

```html
<!-- Format currency -->
<span>{{ price | sharedCurrency:'VND' }}</span>

<!-- Format date -->
<span>{{ date | sharedDate:'dd/MM/yyyy' }}</span>

<!-- Truncate text -->
<p>{{ longText | sharedTruncate:100 }}</p>
```

## Server Module (SSR)

```typescript
// app.config.server.ts
import { mergeApplicationConfig } from "@angular/core";
import { provideServerRendering } from "@angular/platform-server";
import { appConfig } from "./app.config";
import { serverConfig } from "@server/config";

export const config = mergeApplicationConfig(appConfig, {
  providers: [provideServerRendering(), ...serverConfig.providers],
});
```

## Performance Considerations

### Lazy Loading Modules

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: "products",
    loadChildren: () => import("./features/product/product.module").then((m) => m.ProductModule),
  },
  {
    path: "orders",
    loadChildren: () => import("./features/order/order.module").then((m) => m.OrderModule),
  },
];
```

### Bundle Optimization

```typescript
// angular.json
{
  "build": {
    "options": {
      "optimization": true,
      "buildOptimizer": true,
      "vendorChunk": true,
      "commonChunk": true
    }
  }
}
```

## Security Best Practices

### XSRF Protection

```typescript
// app.config.ts
import { provideHttpClient, withXsrfConfiguration } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: "XSRF-TOKEN",
        headerName: "X-XSRF-TOKEN",
      })
    ),
  ],
};
```

### Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
/>
```