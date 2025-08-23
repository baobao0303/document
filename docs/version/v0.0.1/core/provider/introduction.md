# Core Provider Patterns

## Tổng quan

- **Là tập hợp các provider patterns** trong thư viện @cci-web/core
- **Nhằm mục đích thiết kế** để giải quyết các vấn đề phổ biến việc giao tiếp giữa thư viện và dự án
- **Mỗi pattern có mục đích cụ thể** và tuân theo nguyên tắc **Separation of Concerns** rõ ràng

**Provider Patterns <---> Application Architecture**

> **Giải thích**: Provider Patterns là cách tổ chức và cung cấp các service, configuration và dependency injection trong Angular application. Chúng tạo nên kiến trúc tổng thể của ứng dụng, giúp code có cấu trúc rõ ràng, dễ maintain và scalable.

## Tổng quan từng Provider

| **Provider**     | **Mục đích**                    | **Chức năng**                | **Ưu điểm**                    | **Khi nào dùng**              |
| ---------------- | ------------------------------- | ---------------------------- | ------------------------------ | ----------------------------- |
| **Base**         | Cấu hình cơ bản cho app         | APP_BASE_HREF, global config | SSR safe, environment handling | Luôn cần thiết                |
| **Environment**  | Quản lý config theo môi trường  | Production flags, URLs       | Type-safe, build optimization  | Cần config khác nhau per env  |
| **Translate**    | Hỗ trợ đa ngôn ngữ              | HTTP loader, static loader   | Environment flexibility        | Cần i18n                      |
| **Initialized**  | Khởi tạo app trước khi chạy     | Service setup, state loading | Guaranteed init, better UX     | Cần setup services trước      |
| **View Context** | Quản lý state component-service | Signal management, API calls | Clear separation, reactive     | Cần tách UI và business logic |

## Kết luận

Core Provider Patterns cung cấp một foundation vững chắc cho Angular application với:

- **Modular architecture** dễ maintain
- **Type-safe configuration** cho tất cả providers
- **Performance optimization** cho production builds
- **Developer experience** tốt với API nhất quán
- **Scalability** để dễ dàng extend trong tương lai

Sử dụng đúng các patterns này sẽ giúp bạn xây dựng Angular application có kiến trúc rõ ràng, dễ maintain và scalable.
