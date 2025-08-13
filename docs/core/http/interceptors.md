# HTTP Interceptors

HTTP Interceptors là các middleware hoạt động giữa client và server khi thực hiện request/response, cho phép chỉnh sửa hoặc theo dõi request/response trước khi chúng được xử lý.

## Mục đích

- Gắn header mặc định (Authorization, Content-Type, v.v.).
- Xử lý chung lỗi HTTP.
- Log request và response.
- Thêm cơ chế retry hoặc caching.
- Ngăn gửi request trùng lặp.
- Theo dõi vòng đời request để hiển thị loading.

## Cách sử dụng với `@angular/common/http`

```ts
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./auth.interceptor";

@NgModule({
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
})
export class AppModule {}
```

## Interceptors có sẵn trong @cci-web/core

1. **duplicateRequestInterceptor**

   - **Chức năng**: Ngăn gửi trùng GET theo key `method + url + params` (dùng `Map pendingRequests`).
   - **Lợi ích**: Giảm tải backend và tiết kiệm băng thông khi UI có thể bắn trùng GET (ví dụ: nhiều component cùng subscribe cùng lúc).

2. **loadingBarInterceptor**

   - **Chức năng**: Theo dõi số request đang chạy theo key `method + url + params` và log trạng thái start/complete.
   - **Lợi ích**: Dễ tracking vòng đời request để hiển thị loading hoặc log performance. Không phụ thuộc UI framework loading riêng.

## Đăng ký Interceptors với provideHttpClient

```ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { duplicateRequestInterceptor, loadingBarInterceptor } from "@cci-web/core";

providers: [provideHttpClient(withInterceptors([duplicateRequestInterceptor, loadingBarInterceptor]))];
```

## Tại sao dùng các interceptor này?

- **duplicateRequestInterceptor**: giảm tải backend và bandwidth khi UI có thể bắn trùng GET (ví dụ: nhiều component cùng subscribe một lần).
- **loadingBarInterceptor**: dễ tracking vòng đời request để hiển thị loading hoặc log performance. Không phụ thuộc UI framework loading riêng.
