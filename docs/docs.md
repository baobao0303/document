## @cci-web/core — Tài liệu sử dụng

> Thư viện core cho các ứng dụng Angular trong hệ sinh thái CCI.

### Cài đặt

<!-- TODO: Viết hướng dẫn cài đặt gói đã publish trên npm (ví dụ: `npm i @cci-web/core`). Chủ repo sẽ bổ sung phần này. -->

### Yêu cầu

- Angular 19.x (peer deps: `@angular/common`, `@angular/core` ^19.2.0)

### Nội dung chính

| Loại            | Thành phần                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Providers       | `providePlatformConfig`, `provideBaseAppProviders`, `provideAppConfig`                                                                                               |
| Interceptors    | `duplicateRequestInterceptor`, `loadingBarInterceptor`                                                                                                               |
| Services        | `ApiService`, `BreakpointService`, `RequestCacheService`, `LocalStorageService`, `SessionStorageService`, `CookieService`, `OverlayService`, `LoaderService`, `v.v.` |
| Tokens cấu hình | `APP_NAME_TOKEN`, `URL_CONSTANTS_TOKEN`, `GATEWAY_API_TOKEN`, `SVG_TOKEN`, `APP_CONSTANTS_TOKEN`, `ENVIRONMENT_TOKEN`                                                |
| Tokens enum     | `ICON_ENUM_TOKEN`, `PAGE_ENUM_TOKEN`, `BLOCK_HOME_ENUM_TOKEN`, `BLOCK_LAYOUT_ENUM_TOKEN`, `BLOCK_TYPE_ENUM_TOKEN` _(tùy chọn)_                                       |

## Khởi tạo nhanh (Standalone bootstrap)

Ví dụ tích hợp vào `main.ts`/`bootstrap.ts` của app standalone:

```ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import {
  providePlatformConfig,
  provideBaseAppProviders,
  duplicateRequestInterceptor,
  loadingBarInterceptor,
} from "@cci-web/core";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([duplicateRequestInterceptor, loadingBarInterceptor])),

    // Base providers: APP_BASE_HREF, CONFIG_APP (đọc từ window.__CONFIG_APP__)
    provideBaseAppProviders(),

    // Cấu hình nền tảng (app config + optional extra providers)
    providePlatformConfig({
      app: {
        appName: "cci-shell",
        urls: { api: "/api", cdn: "https://cdn.example.com" },
        gateways: { core: "/gateway/core", search: "/gateway/search" },
        svg: { logo: "/assets/icons/logo.svg" },
        constants: {
          PAGE_SIZE: 20,
          MESSAGE: {
            GET_VALIDATE_FORM: "Vui lòng kiểm tra dữ liệu",
            NO_DATA: "Không có dữ liệu",
            ADD_TO_CART_ERROR: "Thêm vào giỏ hàng thất bại",
          },
          INVALID_MESSAGE: {
            EMAIL: "Email không hợp lệ",
            NUMBER: "Chỉ cho phép số",
            POSITIVE_NUMBER: "Chỉ cho phép số dương",
            POSITIVE_INTERGER: "Chỉ cho phép số nguyên dương",
          },
          OTP_TIMER: 120,
          PHONE_REGEX: /^0\d{9,10}$/,
          DEFAULT_PLACEHOlDER_INPUT_SEARCH: "Tìm kiếm...",
          SPECIAL_CHAR_PATTERN_SEARCH: /[^a-zA-Z0-9\s]/g,
          VIEWED_ALL_CONTENT: "Bạn đã xem hết nội dung",
        },
        environment: { production: false },
        enums: {
          page: { Home: 1, Product: 2 },
          icon: { Cart: "cart", User: "user" },
        },
      },

      // Nếu cần thêm providers ứng dụng (i18n, router ...)
      extraProviders: [],
    }),
  ],
});
```

Bạn có thể truyền `window.__CONFIG_APP__` để `provideBaseAppProviders` expose qua token `CONFIG_APP` cho các nơi cần đọc trực tiếp.

---

## Cấu hình ứng dụng (AppAggregateConfig)

`providePlatformConfig({ app })` chấp nhận một object cấu hình hợp lệ theo shape dưới đây (các trường `enums.*` là tùy chọn):

```ts
type AppAggregateConfig = {
  appName: string;
  urls: Record<string, string>;
  gateways: Record<string, string>;
  svg: Record<string, string>;
  constants: {
    PAGE_SIZE: number;
    MESSAGE: { GET_VALIDATE_FORM: string; NO_DATA: string; ADD_TO_CART_ERROR: string };
    INVALID_MESSAGE: { EMAIL: string; NUMBER: string; POSITIVE_NUMBER: string; POSITIVE_INTERGER: string };
    OTP_TIMER: number;
    PHONE_REGEX: RegExp;
    DEFAULT_PLACEHOlDER_INPUT_SEARCH: string;
    SPECIAL_CHAR_PATTERN_SEARCH: RegExp;
    VIEWED_ALL_CONTENT: string;
  };
  environment?: { production: boolean; [k: string]: unknown };
  enums?: {
    icon?: Record<string, string | number>;
    page?: Record<string, string | number>;
    blockHome?: Record<string, string | number>;
    blockLayout?: Record<string, string | number>;
    blockType?: Record<string, string | number>;
  };
  [extraKey: string]: unknown;
};
```

Các token alias sẽ được tự động cung cấp từ config trên: `APP_NAME_TOKEN`, `URL_CONSTANTS_TOKEN`, `GATEWAY_API_TOKEN`, `SVG_TOKEN`, `APP_CONSTANTS_TOKEN`, `ENVIRONMENT_TOKEN`. Các token enum tương ứng cũng được cung cấp nếu bạn truyền trong `enums`.

### Truy cập nhanh cấu hình tại runtime

```ts
import { CoreService } from '@cci-web/core';

constructor(private core: CoreService) {}

ngOnInit() {
  const snapshot = this.core.getConfigSnapshot();
  // snapshot.appName, snapshot.urls, snapshot.gateways, snapshot.enums...
}
```

---

## HTTP Interceptors

- `duplicateRequestInterceptor`: Ngăn gửi trùng GET theo key method+url+params (dùng Map pendingRequests)
- `loadingBarInterceptor`: Theo dõi số request đang chạy theo key method+url+params và log start/complete

Đăng ký thông qua `provideHttpClient`:

```ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { duplicateRequestInterceptor, loadingBarInterceptor } from "@cci-web/core";

providers: [provideHttpClient(withInterceptors([duplicateRequestInterceptor, loadingBarInterceptor]))];
```

---

## ApiService — REST helper có cache tuỳ chọn

```ts
import { ApiService } from '@cci-web/core';

constructor(private api: ApiService) {}

loadProducts() {
  // GET với cache key dựa trên url + params
  return this.api.get<Product[]>('/api/products', undefined, true);
}

createOrder(payload: any) {
  return this.api.post<Order>('/api/orders', payload);
}

uploadFile(file: File) {
  return this.api.postFile<UploadRes>('/api/files', file, { folder: 'docs' });
}
```

Headers mặc định gửi kèm: `app-name`, `gatewate-api` (nếu set), `ConcungContextID`, `returnUrl` (trên browser), `platform-id` (theo breakpoint). Kết quả API chuẩn: `{ status: number; message: string; data: any }` — service sẽ throw nếu `status !== 200`.

---

## RequestCacheService — cache theo TTL và chống trùng request

```ts
import { RequestCacheService } from '@cci-web/core';

constructor(private cache: RequestCacheService, private api: ApiService) {}

getCategory(id: string) {
  const key = this.cache.generateKey('/api/categories', id);
  return this.cache.get(key, () => this.api.get(`/api/categories/${id}`), 5 * 60_000);
}
```

Hỗ trợ: thống kê hit/miss, clear theo key hoặc toàn bộ, TTL từng entry, chống đua bằng `pendingRequests`.

---

## BreakpointService — phát hiện responsive theo CDK

```ts
import { BreakpointService } from '@cci-web/core';

constructor(private bp: BreakpointService) {
  this.bp.breakpointsResult$.subscribe(b => {
    // b.isPhoneOnly, b.isTabletPortraitUp, b.isDesktopUp, ...
  });
}
```

Các hằng số breakpoint nằm ở `BREAKPOINTS_VALUE` (re-export trong `constants`).

---

## Truy cập Storage tiện lợi

- `BROWSER_STORAGE` token (mặc định trỏ `LocalStorageService`) để inject nơi cần API style storage.

```ts
import { inject } from "@angular/core";
import { BROWSER_STORAGE } from "@cci-web/core";

const storage = inject(BROWSER_STORAGE);
storage.set("k", "v");
```

Ngoài ra có sẵn `LocalStorageService`, `SessionStorageService`, `CookieService`.

---

## Các services hữu ích khác

- `OverlayService`, `LoadingSpinnerService`, `LoaderService`, `OpenMenuService`
- `PlatformService` (phân biệt browser/server), `WindowService`, `DocumentService`
- `SEOService` (`SeoService`), `RemoteCssService`, `ResponsiveService`, `SearchEventBridgeService`
- `SubSinkService`, `UnsubscribeOnDestroyAdapterService`

Tất cả đều được re-export từ `@cci-web/core` qua `public-api.ts`.

---

## Providers tiện ích

- `provideBaseAppProviders()`: cung cấp `APP_BASE_HREF` từ thẻ `<base>` và `CONFIG_APP` từ `window.__CONFIG_APP__`.
- `providePlatformConfig({ app, extraProviders })`: gộp và cung cấp toàn bộ token cấu hình ở trên chỉ với một lần gọi.

Nếu cần tự cung cấp enums rời rạc, có thể dùng `provideEnumsFromConfig(appConfig)` (đã có sẵn trong nội bộ khi dùng `providePlatformConfig`).

---

## Utils

- `federation-utils`: tiện ích cho module federation (được re-export dưới `utils`).

---

## Gợi ý tổ chức mã nguồn

- Khai báo cấu hình tập trung trong một file `app-config.ts`, import vào `providePlatformConfig({ app })`.
- Đăng ký interceptors ở cấp bootstrap để áp dụng toàn app.
- Sử dụng `RequestCacheService` cho các GET có thể cache và tần suất cao.

---

## Góp ý / Phát triển thêm

- Vui lòng mở PR/Issue tại repo này khi cần thêm provider/service hoặc điều chỉnh token cấu hình.
