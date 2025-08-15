# Config Module - @cci-web/core

Module Config cung cấp các thành phần cấu hình cốt lõi cho thư viện CCI-Web Core, bao gồm constants, interceptors, models, providers, services và utilities.

## 📋 Tổng quan

Config module bao gồm các thành phần chính:

### 🔧 **Constants**
Các hằng số và enum được sử dụng trong toàn bộ ứng dụng:
- **BREAKPOINTS_VALUE**: Định nghĩa breakpoints cho responsive design
- **ConfigValues**: Enum chứa các giá trị cấu hình hệ thống
- **ViewType**: Enum phân loại loại view (mobile/desktop)

### 🔄 **Interceptors**
Các HTTP interceptors xử lý request/response:
- **Duplicate Request Interceptor**: Ngăn chặn request trùng lặp
- **Loading Bar Interceptor**: Theo dõi trạng thái loading

### 📊 **Models**
Các model và interface định nghĩa cấu trúc dữ liệu:
- **AppUserPrincipal**: Thông tin người dùng hiện tại
- **BreadcrumbRes**: Dữ liệu breadcrumb navigation
- **Paging**: Model phân trang
- **SeoSocialShareData**: Dữ liệu SEO và social sharing

### ⚙️ **Providers**
Các provider cấu hình dependency injection:
- **App Provider**: Cấu hình chính cho thư viện
- **Base Providers**: Các provider cơ bản

### 🛠️ **Services**
Các service cốt lõi:
- **ApiService**: HTTP client với caching
- **CacheService**: Quản lý cache
- **BreakpointService**: Theo dõi breakpoints
- **SeoService**: Tối ưu SEO

### 🔨 **Utils**
Các utility functions và helper classes:
- **UnsubscribeOnDestroyAdapter**: Tự động unsubscribe
- **SubSink**: Quản lý subscriptions
- **FlagBasedPreloadingStrategy**: Chiến lược preloading
- **Federation Utilities**: Hỗ trợ micro frontend

## 🚀 Cách sử dụng

Mỗi module con có tài liệu chi tiết riêng. Bạn có thể tham khảo từng phần để hiểu rõ cách sử dụng và tích hợp vào ứng dụng của mình.

## 📚 Tài liệu liên quan

- [Constants Module](./constants.md) - Chi tiết về các hằng số
- [Interceptors Module](./interceptors.md) - HTTP interceptors
- [Models Module](./models.md) - Cấu trúc dữ liệu
- [Providers Module](./providers.md) - Dependency injection
- [Services Module](./services.md) - Các service cốt lõi
- [Utils Module](./utils.md) - Utility functions
