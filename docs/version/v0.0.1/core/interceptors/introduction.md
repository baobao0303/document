## Interceptors

Các HTTP interceptors xử lý các request/response tự động.

### Danh sách Interceptors

| Tên                           | File                               | Mô tả                        | Áp dụng         |
| ----------------------------- | ---------------------------------- | ---------------------------- | --------------- |
| `duplicateRequestInterceptor` | `duplicate-request.interceptor.ts` | Ngăn chặn duplicate requests | GET requests    |
| `loadingBarInterceptor`       | `loading-bar.interceptor.ts`       | Theo dõi trạng thái loading  | Tất cả requests |
