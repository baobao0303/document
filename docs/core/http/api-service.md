# ApiService

`ApiService` là service trung gian giúp gọi API một cách đơn giản và thống nhất.

## Tính năng chính

- GET, POST, PUT, DELETE wrapper.
- Tự động thêm base URL.
- Tích hợp interceptor và error handler.

## Ví dụ

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

## Headers mặc định gửi kèm

- `app-name`: tên ứng dụng.
- `gatewate-api`: API key (nếu set).
- `ConcungContextID`: ID phiên (nếu set).
- `returnUrl`: URL trả về (trên browser).
- `platform-id`: ID platform (theo breakpoint).

Kết quả API chuẩn: `{ status: number; message: string; data: any }` — service sẽ throw nếu `status !== 200`.

## Tại sao dùng `ApiService`?

- **Chuẩn hoá header liên ứng dụng**: app-name, platform-id, context id.
- **Xử lý chuẩn hoá `CRUDResult` và throw lỗi sớm giúp code component gọn hơn**.
- **Cache tự chọn theo `useCache` để giảm request lặp lại**.

## Lợi ích

Giảm boilerplate code.

- Giảm boilerplate code.

- Dễ thay đổi base URL hoặc cấu hình request.

- Gọn gàng khi gọi API trong ứng dụng.
