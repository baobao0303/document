# Giới thiệu

**@cci-web/core** là thư viện nền tảng (core library) được sử dụng chung cho toàn bộ hệ thống Micro Frontend của CCI.  
Nó cung cấp các thành phần và dịch vụ cơ bản giúp cho việc phát triển ứng dụng nhất quán, tái sử dụng cao và dễ bảo trì.

## Mục đích

- **Tái sử dụng**: Gom nhóm các logic, constants, utilities, và services thường dùng để không phải viết lại ở từng MFE.
- **Chuẩn hóa**: Đảm bảo cấu trúc code, naming convention và hành vi nhất quán giữa các module.
- **Tiện lợi**: Giảm thời gian khởi tạo dự án mới vì đã có sẵn các cấu hình, providers và helper.
- **Tích hợp dễ dàng**: Các MFE chỉ cần cài đặt và import để có ngay các chức năng chung.

## Thư viện này bao gồm

- **Cấu hình ứng dụng** (application config & runtime config access)
- **HTTP utilities** (interceptors, API service, request cache)
- **Responsive & Breakpoints**
- **Storage services** (LocalStorage, SessionStorage, Cookies)
- **Các service tiện ích** (SEO, Overlay Loader, Platform detection, Event bridges)
- **Providers tiện ích** (base app providers, platform config, enums from config)
- **Utilities** (federation utilities, helper functions)
