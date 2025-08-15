# Ví dụ minh họa cụ thể

## Tạo một Feature Module hoàn chỉnh

### Product Module

```typescript
// product.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@shared/shared.module";
import { ProductComponent } from "./product.component";
import { ProductService } from "./product.service";

@NgModule({
  declarations: [ProductComponent],
  imports: [CommonModule, SharedModule],
  providers: [ProductService],
})
export class ProductModule {}
```

### Product Service

```typescript
// product.service.ts
import { Injectable } from "@angular/core";
import { BaseService } from "@core/services";
import { Product } from "./product.model";

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(http: HttpClient) {
    super(http, "/api/products");
  }

  searchProducts(query: string) {
    return this.http.get<Product[]>(`${this.baseUrl}/search`, {
      params: { q: query },
    });
  }
}
```

### Product Component

```typescript
// product.component.ts
import { Component, OnInit } from "@angular/core";
import { LoadingSpinnerService } from "@core/services";
import { ProductService } from "./product.service";

@Component({
  selector: "app-product",
  template: `
    <div class="product-container">
      <shared-search-box [placeholder]="'Tìm kiếm sản phẩm...'" (search)="onSearch($event)"> </shared-search-box>

      <div *sharedLoading="isLoading" class="product-grid">
        <shared-card
          *ngFor="let product of products"
          [title]="product.name"
          [image]="product.image"
          [price]="product.price | sharedCurrency : 'VND'"
        >
          <shared-button [type]="'primary'" (click)="addToCart(product)"> Thêm vào giỏ </shared-button>
        </shared-card>
      </div>
    </div>
  `,
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;

  constructor(private productService: ProductService, private loading: LoadingSpinnerService) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.isLoading = true;
    try {
      this.products = await this.productService.getAll().toPromise();
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSearch(query: string) {
    if (!query.trim()) {
      this.loadProducts();
      return;
    }

    this.isLoading = true;
    try {
      this.products = await this.productService.searchProducts(query).toPromise();
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      this.isLoading = false;
    }
  }

  addToCart(product: Product) {
    // Logic thêm vào giỏ hàng
    console.log("Added to cart:", product);
  }
}
```

## Tích hợp với State Management

### NgRx Configuration

```typescript
// app.config.ts với NgRx
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideCciWebCore } from "@core/providers";

export const appConfig: ApplicationConfig = {
  providers: [
    provideCciWebCore({
      appName: "ecommerce-app",
      cache: { defaultTtl: 300000, maxItems: 100 },
      gatewayApi: {
        ecomApi: environment.apiUrl,
        ecomV4Api: environment.apiV4Url,
      },
    }),

    // NgRx Store
    provideStore({
      products: productReducer,
      cart: cartReducer,
    }),
    provideEffects([ProductEffects, CartEffects]),
  ],
};
```

### Product Effects

```typescript
// product.effects.ts
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ProductService } from "@core/services";
import { ProductActions } from "./product.actions";

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        this.productService.getAll().pipe(
          map((products) => ProductActions.loadProductsSuccess({ products })),
          catchError((error) => of(ProductActions.loadProductsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private productService: ProductService) {}
}
```

## Testing Strategy

### Unit Testing

```typescript
// product.service.spec.ts
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ProductService } from "./product.service";

describe("ProductService", () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should fetch products", () => {
    const mockProducts = [{ id: 1, name: "Product 1" }];

    service.getAll().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne("/api/products");
    expect(req.request.method).toBe("GET");
    req.flush(mockProducts);
  });
});
```

### Integration Testing

```typescript
// app.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { provideCciWebCore } from "@core/providers";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        provideCciWebCore({
          appName: "test-app",
          cache: { defaultTtl: 60000, maxItems: 10 },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

## Debug và Monitoring

### Logging Configuration

```typescript
// app.config.ts
import { provideLogger } from "@core/services";

export const appConfig: ApplicationConfig = {
  providers: [
    provideLogger({
      level: environment.production ? "error" : "debug",
      enableConsole: !environment.production,
    }),
  ],
};
```

### Error Tracking

```typescript
// global-error-handler.ts
import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error("Global error:", error);

    // Send to monitoring service
    // this.monitoringService.logError(error);
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
};
```

## Memory Leak Prevention

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({...})
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```
