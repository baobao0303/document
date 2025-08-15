# Tổng quan về thư viện CCI-Web

## Giới thiệu

Thư viện CCI-Web là một hệ thống thư viện Angular được thiết kế theo kiến trúc Micro Frontend, bao gồm ba module chính:

- **Core Module**: Cung cấp các dịch vụ cơ bản, providers, interceptors và models
- **Shared Module**: Chứa các component UI tái sử dụng, directives, pipes và utilities
- **Server Module**: Hỗ trợ Server-Side Rendering (SSR) với cấu hình và implementation cho Node.js

## Kiến trúc

```
cci-web/
├── core/           # Module cốt lõi
│   ├── src/lib/
│   │   ├── constants/
│   │   ├── interceptors/
│   │   ├── models/
│   │   ├── providers/
│   │   └── services/
│   └── public-api.ts
├── shared/         # Module chia sẻ
│   ├── src/lib/
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── utilities/
│   └── public-api.ts
└── server/         # Module server
    ├── src/lib/
    └── public-api.ts
```

## Các ưu điểm nổi bật của thư viện

### Kiến trúc Micro Frontend

- **Tách biệt rõ ràng**: Core, Shared, Server modules độc lập
- **Tái sử dụng cao**: Components và services có thể dùng chung
- **Dễ bảo trì**: Mỗi module có trách nhiệm riêng biệt

### Dependency Injection Pattern

- **Port-Adapter Pattern**: Kết nối linh hoạt giữa các services
- **Configuration Management**: Quản lý cấu hình tập trung
- **Environment-specific**: Hỗ trợ nhiều môi trường khác nhau

### Performance Optimization

- **Lazy Loading**: Tải module khi cần thiết
- **Caching Strategy**: Cache HTTP requests và data
- **Bundle Optimization**: Tối ưu kích thước bundle

### Developer Experience

- **Type Safety**: TypeScript support đầy đủ
- **Consistent API**: API thống nhất across modules
- **Rich Documentation**: Tài liệu chi tiết và examples