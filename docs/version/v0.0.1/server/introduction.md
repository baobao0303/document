# Introduction

`@cci-web/server` là một thư viện Angular được thiết kế để hỗ trợ server-side rendering (SSR) cho các ứng dụng web. Thư viện cung cấp các công cụ và cấu hình cần thiết để chạy ứng dụng Angular trên Node.js server.

## Tổng quan

Thư viện server-side rendering (SSR) cho ứng dụng Angular CCI Web, cung cấp:

- **NodeServer Class**: Lớp chính để khởi tạo và cấu hình Express server
- **API Proxy**: Middleware để proxy các request API đến backend
- **Static File Serving**: Phục vụ các file tĩnh với caching tối ưu
- **SSR Rendering**: Render Angular components trên server
- **Error Handling**: Xử lý lỗi toàn cục cho SSR

## Tính năng chính

### 1. API Proxy

Tự động proxy tất cả requests có prefix `/api` đến backend server:

```typescript
// Request từ client: /api/users
// Sẽ được proxy đến: https://backend-url/api/users
```

### 2. Static File Caching

- File tĩnh được cache 1 năm
- File HTML không được cache
- Tự động set headers phù hợp

### 3. SSR Rendering

- Render Angular components trên server
- Hỗ trợ Angular Universal
- Tự động inject APP_BASE_HREF

### 4. Error Handling

- Log chi tiết các lỗi SSR
- Trả về response lỗi có cấu trúc
- Graceful fallback khi SSR fail

## Dependencies

- `express`: ^4.18.0
- `http-proxy-middleware`: ^2.0.0
- `@angular/ssr`: Angular SSR package
- `@angular/common`: ^19.2.0
- `@angular/core`: ^19.2.0

## License

MIT License - xem file [LICENSE](./LICENSE) để biết thêm chi tiết.

## Đóng góp

Vui lòng đọc hướng dẫn đóng góp trong file [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Changelog

Xem [CHANGELOG.md](./CHANGELOG.md) để biết lịch sử thay đổi của thư viện.