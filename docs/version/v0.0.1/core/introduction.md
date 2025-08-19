# Giới thiệu

**@cci-web/core** là thư viện nền tảng (core library) được sử dụng chung cho toàn bộ hệ thống Micro Frontend của CCI.  
Nó cung cấp các thành phần và dịch vụ cơ bản giúp cho việc phát triển ứng dụng nhất quán, tái sử dụng cao và dễ bảo trì.

## Mục đích

| Mục tiêu    | Mô tả                                                                |
| ----------- | -------------------------------------------------------------------- |
| Tái sử dụng | Gom nhóm logic, constants, utilities, services dùng chung            |
| Chuẩn hóa   | Đồng nhất cấu trúc code, naming convention, hành vi giữa các module  |
| Tiện lợi    | Rút ngắn thời gian khởi tạo dự án mới với cấu hình và helpers sẵn có |
| Tích hợp dễ | MFE chỉ cần cài đặt và import để dùng chung các chức năng            |

## Thư viện này bao gồm

| Nhóm               | Nội dung chính                                         |
| ------------------ | ------------------------------------------------------ |
| Cấu hình ứng dụng  | Application config & runtime config access             |
| HTTP utilities     | Interceptors, API service, request cache               |
| Responsive         | Breakpoints & responsive helpers                       |
| Storage services   | LocalStorage, SessionStorage, Cookies                  |
| Services tiện ích  | SEO, Overlay Loader, Platform detection, Event bridges |
| Providers tiện ích | Base app providers, platform config, enums from config |
| Utilities          | Federation utilities, helper functions                 |
