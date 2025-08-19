# CCI Web Core Library - Tổng Quan

## Giới thiệu

CCI Web Core Library là thư viện cốt lõi được thiết kế đặc biệt cho các ứng dụng thương mại điện tử (e-commerce). Thư viện này cung cấp các công cụ và dịch vụ cần thiết để xây dựng một website bán hàng hiện đại, bao gồm quản lý dữ liệu, lưu trữ thông tin, và xử lý các thao tác người dùng.

Hãy tưởng tượng thư viện này như một "hộp công cụ đa năng" dành cho developers - nó chứa tất cả những gì cần thiết để xây dựng một trang web bán hàng chuyên nghiệp mà không cần phải viết lại từ đầu.

## Tại sao cần CCI Web Core Library?

### Vấn đề thường gặp

Khi xây dựng website thương mại điện tử, developers thường phải:

- Viết lại các chức năng cơ bản như lưu trữ dữ liệu
- Tạo các hệ thống quản lý sản phẩm, đơn hàng từ đầu
- Xử lý các thao tác phức tạp như tìm kiếm, phân trang
- Đảm bảo tính nhất quán trong cách xử lý dữ liệu

### Giải pháp của CCI Web Core

Thư viện này giải quyết tất cả những vấn đề trên bằng cách cung cấp:

- **Các công cụ có sẵn**: Không cần viết lại, chỉ cần sử dụng
- **Chuẩn hóa**: Tất cả đều theo một quy chuẩn nhất định
- **Tối ưu hóa**: Đã được tối ưu cho hiệu suất cao
- **Dễ sử dụng**: Thiết kế đơn giản, dễ hiểu

## Cấu trúc Thư viện

Thư viện được tổ chức thành các module chuyên biệt:

### 🏪 Module Chính (Core Modules)

- **Constants**: Các hằng số và cấu hình cố định
- **Models**: Định nghĩa cấu trúc dữ liệu (sản phẩm, đơn hàng, khách hàng...)
- **Services**: Các dịch vụ xử lý logic nghiệp vụ
- **Providers**: Cấu hình dependency injection cho Angular
- **Interceptors**: Xử lý HTTP requests/responses
- **Utils**: Các tiện ích hỗ trợ

### 🆕 Module Chuyên biệt (Specialized Modules)

- **Storage**: Quản lý lưu trữ dữ liệu (cache, localStorage, sessionStorage)
- **Context**: Quản lý trạng thái và thao tác trên giao diện

## Chi tiết cách sử dụng

### Cài đặt

```bash
npm install cci-web-core
```

### Import cơ bản

```typescript
import {
  CacheService, // Dịch vụ cache
  LocalStorageService, // Lưu trữ local
  ViewEditContext, // Quản lý chỉnh sửa
  ViewListContext, // Quản lý danh sách
} from "cci-web-core";
```

### Sử dụng trong dự án Angular

```typescript
// Trong component
@Component({
  selector: "app-product",
  template: "...",
})
export class ProductComponent {
  constructor(
    private cacheService: CacheService,
    private localStorage: LocalStorageService
  ) {}

  saveProduct(product: any) {
    // Lưu vào cache 5 phút
    this.cacheService.set("product", product, { ttl: 300000 });
    // Lưu vào localStorage lâu dài
    this.localStorage.set("product", product);
  }
}
```

## Mô tả chi tiết

### Đặc điểm nổi bật

#### 1. Thiết kế cho E-commerce

- **Quản lý sản phẩm**: Tạo, sửa, xóa, tìm kiếm sản phẩm
- **Quản lý đơn hàng**: Xử lý đơn hàng, trạng thái, thanh toán
- **Quản lý khách hàng**: Thông tin, lịch sử mua hàng
- **Tìm kiếm & lọc**: Tìm kiếm nâng cao, bộ lọc đa tiêu chí

#### 2. Hiệu suất cao

- **Cache thông minh**: Tự động cache dữ liệu thường dùng
- **Lazy loading**: Chỉ tải dữ liệu khi cần
- **Pagination**: Phân trang tự động cho danh sách lớn
- **Debounce**: Tránh gọi API quá nhiều lần

#### 3. Dễ bảo trì

- **Modular**: Chia thành các module độc lập
- **Type-safe**: Hỗ trợ TypeScript đầy đủ
- **Documentation**: Tài liệu chi tiết cho từng function
- **Examples**: Ví dụ thực tế cho mọi tình huống

### Lợi ích khi sử dụng

#### Cho Developer

- **Tiết kiệm thời gian**: Không cần viết lại các chức năng cơ bản
- **Giảm bug**: Code đã được test kỹ lưỡng
- **Dễ maintain**: Cấu trúc rõ ràng, dễ hiểu
- **Scalable**: Dễ mở rộng khi dự án lớn lên

#### Cho Business

- **Time to market nhanh**: Phát triển sản phẩm nhanh hơn
- **Chi phí thấp**: Giảm thời gian development
- **Chất lượng cao**: Ít bug, hiệu suất tốt
- **Bảo trì dễ**: Dễ nâng cấp và sửa chữa

### Khi nào nên sử dụng?

#### ✅ Phù hợp khi:

- Xây dựng website thương mại điện tử
- Cần quản lý sản phẩm, đơn hàng phức tạp
- Muốn có hệ thống cache hiệu quả
- Cần tìm kiếm và lọc dữ liệu nâng cao
- Làm việc với Angular framework

#### ❌ Không phù hợp khi:

- Dự án đơn giản, không cần tính năng phức tạp
- Không sử dụng Angular
- Cần customization quá sâu
- Dự án có yêu cầu đặc biệt không phù hợp

## Roadmap và tương lai

### Version hiện tại (0.0.1)

- ✅ Core modules hoàn chỉnh
- ✅ Storage system
- ✅ ViewContext cho e-commerce
- ✅ Documentation đầy đủ

### Version tiếp theo (0.1.0)

- 🔄 Performance optimization
- 🔄 More e-commerce features
- 🔄 Better error handling
- 🔄 Advanced caching strategies

### Tương lai xa (1.0.0)

- 🔮 AI-powered recommendations
- 🔮 Real-time features
- 🔮 Multi-language support
- 🔮 Advanced analytics

## Kết luận

CCI Web Core Library là giải pháp toàn diện cho việc phát triển ứng dụng thương mại điện tử với Angular. Với thiết kế modular, hiệu suất cao và dễ sử dụng, thư viện này sẽ giúp bạn xây dựng sản phẩm chất lượng trong thời gian ngắn nhất.

Hãy khám phá các module chi tiết để hiểu rõ hơn về cách sử dụng từng tính năng!
