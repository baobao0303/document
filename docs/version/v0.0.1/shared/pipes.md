# Pipes Module

Module này cung cấp các Angular pipes để xử lý và định dạng dữ liệu trong ứng dụng CCI Web.

## Tổng quan

Module Pipes bao gồm các pipe được thiết kế để xử lý các tác vụ định dạng dữ liệu phổ biến như tiền tệ, ngày tháng, số liệu và các phép tính toán khác.

## Tóm tắt nhanh

| STT | Tên Pipe                        | Mô tả ngắn                         |
| --- | ------------------------------- | ---------------------------------- |
| 1   | `DiscountPipe`                  | Tính/hiển thị giảm giá             |
| 2   | `EnumeratePipe`                 | Đánh số phần tử                    |
| 3   | `FormatDataPipe`                | Chuẩn hóa/format dữ liệu chung     |
| 4   | `FormatDatePipe`                | Định dạng ngày                     |
| 5   | `FormatDeliveryTimePipe`        | Hiển thị thời gian giao hàng       |
| 6   | `FormatMoneyPipe`               | Định dạng tiền tệ                  |
| 7   | `FormatNumberHumanReadablePipe` | Số dễ đọc (1.2K, 3.4M)             |
| 8   | `FormatTwoDecimalPipe`          | Làm tròn 2 chữ số                  |
| 9   | `FormatViewPipe`                | Định dạng lượt xem                 |
| 10  | `ObjIsEmptyPipe`                | Kiểm tra object rỗng               |
| 11  | `PercentPipe`                   | Hiển thị phần trăm                 |
| 12  | `SafePipe`                      | Đánh dấu nội dung an toàn (bypass) |

Ví dụ dùng nhanh:

```html
<span>{{ 1250000 | formatMoney }}</span> <span>{{ 0.25 | percent }}</span>
```

## Danh sách Pipes

### Formatting Pipes

#### FormatMoneyPipe

Pipe định dạng số thành tiền tệ Việt Nam.

```typescript
import { FormatMoneyPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatMoneyPipe],
  template: `
    <p>Giá: {{ price | formatMoney }}</p>
    <p>Giá USD: {{ priceUSD | formatMoney : "USD" }}</p>
    <p>Không ký hiệu: {{ price | formatMoney : "VND" : false }}</p>
  `,
})
export class ProductComponent {
  price = 1500000; // Hiển thị: 1.500.000 ₫
  priceUSD = 65.5; // Hiển thị: $65.50
}
```

**Tham số:**

- `currency: 'VND' | 'USD'` - Loại tiền tệ (mặc định: 'VND')
- `showSymbol: boolean` - Hiển thị ký hiệu tiền tệ (mặc định: true)

#### FormatDatePipe

Pipe định dạng ngày tháng theo múi giờ Việt Nam.

```typescript
import { FormatDatePipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatDatePipe],
  template: `
    <p>Ngày tạo: {{ createdDate | formatDate }}</p>
    <p>Ngày cập nhật: {{ updatedDate | formatDate : "dd/MM/yyyy HH:mm" }}</p>
    <p>Ngày sinh: {{ birthDate | formatDate : "dd MMMM yyyy" }}</p>
  `,
})
export class UserProfileComponent {
  createdDate = new Date("2024-01-15T10:30:00Z");
  updatedDate = new Date();
  birthDate = new Date("1990-05-20");
}
```

**Tham số:**

- `format: string` - Định dạng ngày tháng (mặc định: 'dd/MM/yyyy')
- `locale: string` - Ngôn ngữ hiển thị (mặc định: 'vi-VN')

#### FormatDeliveryTimePipe

Pipe định dạng thời gian giao hàng.

```typescript
import { FormatDeliveryTimePipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatDeliveryTimePipe],
  template: `
    <p>Giao hàng: {{ deliveryTime | formatDeliveryTime }}</p>
    <p>Giao nhanh: {{ expressTime | formatDeliveryTime : "express" }}</p>
  `,
})
export class OrderComponent {
  deliveryTime = 3; // Hiển thị: "Giao trong 3-5 ngày"
  expressTime = 1; // Hiển thị: "Giao nhanh trong 1-2 ngày"
}
```

**Tham số:**

- `type: 'standard' | 'express'` - Loại giao hàng (mặc định: 'standard')

#### FormatNumberHumanReadablePipe

Pipe định dạng số lớn thành dạng dễ đọc.

```typescript
import { FormatNumberHumanReadablePipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatNumberHumanReadablePipe],
  template: `
    <p>Lượt xem: {{ views | formatNumberHumanReadable }}</p>
    <p>Người theo dõi: {{ followers | formatNumberHumanReadable }}</p>
  `,
})
export class StatsComponent {
  views = 1500000; // Hiển thị: "1.5M"
  followers = 25000; // Hiển thị: "25K"
}
```

#### FormatTwoDecimalPipe

Pipe định dạng số với 2 chữ số thập phân.

```typescript
import { FormatTwoDecimalPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatTwoDecimalPipe],
  template: `
    <p>Điểm đánh giá: {{ rating | formatTwoDecimal }}</p>
    <p>Tỷ lệ: {{ percentage | formatTwoDecimal }}%</p>
  `,
})
export class RatingComponent {
  rating = 4.567; // Hiển thị: "4.57"
  percentage = 85.123; // Hiển thị: "85.12%"
}
```

#### FormatViewPipe

Pipe định dạng số lượt xem.

```typescript
import { FormatViewPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatViewPipe],
  template: ` <p>{{ viewCount | formatView }}</p> `,
})
export class VideoComponent {
  viewCount = 1234567; // Hiển thị: "1.2M lượt xem"
}
```

### Calculation Pipes

#### DiscountPipe

Pipe tính toán giảm giá.

```typescript
import { DiscountPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [DiscountPipe],
  template: `
    <p>Giá gốc: {{ originalPrice | formatMoney }}</p>
    <p>Giảm giá: {{ originalPrice | discount : discountPercent | formatMoney }}</p>
    <p>Tiết kiệm: {{ originalPrice | discount : discountPercent : "amount" | formatMoney }}</p>
  `,
})
export class ProductPriceComponent {
  originalPrice = 1000000;
  discountPercent = 20;
  // Giá sau giảm: 800.000 ₫
  // Tiết kiệm: 200.000 ₫
}
```

**Tham số:**

- `discountPercent: number` - Phần trăm giảm giá
- `returnType: 'final' | 'amount'` - Trả về giá cuối hay số tiền giảm (mặc định: 'final')

#### PercentPipe

Pipe tính toán phần trăm.

```typescript
import { PercentPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [PercentPipe],
  template: `
    <p>Tiến độ: {{ progress | percent }}%</p>
    <p>Tỷ lệ thành công: {{ successRate | percent : 1 }}%</p>
  `,
})
export class ProgressComponent {
  progress = 0.75; // Hiển thị: "75%"
  successRate = 0.8567; // Hiển thị: "85.7%"
}
```

**Tham số:**

- `decimalPlaces: number` - Số chữ số thập phân (mặc định: 0)

### Utility Pipes

#### EnumeratePipe

Pipe tạo danh sách có đánh số.

```typescript
import { EnumeratePipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [EnumeratePipe],
  template: `
    <ul>
      <li *ngFor="let item of items | enumerate; let i = index">{{ item.index + 1 }}. {{ item.value.name }}</li>
    </ul>
  `,
})
export class ListComponent {
  items = [{ name: "Item A" }, { name: "Item B" }, { name: "Item C" }];
  // Hiển thị:
  // 1. Item A
  // 2. Item B
  // 3. Item C
}
```

#### ObjIsEmptyPipe

Pipe kiểm tra object có rỗng hay không.

```typescript
import { ObjIsEmptyPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [ObjIsEmptyPipe],
  template: `
    <div *ngIf="!(userData | objIsEmpty)">
      <p>Tên: {{ userData.name }}</p>
      <p>Email: {{ userData.email }}</p>
    </div>
    <div *ngIf="userData | objIsEmpty">
      <p>Không có dữ liệu người dùng</p>
    </div>
  `,
})
export class UserComponent {
  userData = {}; // hoặc { name: 'John', email: 'john@example.com' }
}
```

#### SafePipe

Pipe bỏ qua sanitization cho URL, HTML, style, script, resource URL.

```typescript
import { SafePipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [SafePipe],
  template: `
    <div [innerHTML]="htmlContent | safe : 'html'"></div>
    <iframe [src]="videoUrl | safe : 'resourceUrl'"></iframe>
    <div [style]="customStyle | safe : 'style'"></div>
  `,
})
export class ContentComponent {
  htmlContent = "<p><strong>Nội dung HTML</strong></p>";
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";
  customStyle = "color: red; font-weight: bold;";
}
```

**Tham số:**

- `type: 'html' | 'style' | 'script' | 'url' | 'resourceUrl'` - Loại nội dung cần bypass sanitization

#### FormatDataPipe

Pipe định dạng dữ liệu tổng quát.

```typescript
import { FormatDataPipe } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [FormatDataPipe],
  template: `
    <p>Dung lượng: {{ fileSize | formatData : "bytes" }}</p>
    <p>Khoảng cách: {{ distance | formatData : "distance" }}</p>
    <p>Thời gian: {{ duration | formatData : "duration" }}</p>
  `,
})
export class DataComponent {
  fileSize = 1048576; // Hiển thị: "1 MB"
  distance = 1500; // Hiển thị: "1.5 km"
  duration = 3661; // Hiển thị: "1h 1m 1s"
}
```

**Tham số:**

- `type: 'bytes' | 'distance' | 'duration'` - Loại dữ liệu cần định dạng

## Sử dụng kết hợp

Các pipes có thể được sử dụng kết hợp với nhau:

```typescript
@Component({
  template: `
    <!-- Giá sản phẩm sau giảm giá -->
    <p class="price">
      {{ originalPrice | discount : 20 | formatMoney }}
    </p>

    <!-- Phần trăm giảm giá với 1 chữ số thập phân -->
    <span class="discount"> -{{ 20 | percent : 1 }}% </span>

    <!-- Ngày tạo định dạng ngắn -->
    <small class="date">
      {{ createdDate | formatDate : "dd/MM/yy" }}
    </small>
  `,
})
export class ProductCardComponent {
  originalPrice = 1500000;
  createdDate = new Date();
}
```

## Custom Pipe Configuration

Một số pipes hỗ trợ cấu hình toàn cục:

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeVi from "@angular/common/locales/vi";

registerLocaleData(localeVi);

export const appConfig: ApplicationConfig = {
  providers: [{ provide: LOCALE_ID, useValue: "vi-VN" }],
};
```

## Performance Tips

1. **Pure Pipes**: Tất cả pipes đều là pure pipes, chỉ chạy lại khi input thay đổi.

2. **Memoization**: Các pipes phức tạp sử dụng memoization để cache kết quả.

3. **Lazy Evaluation**: Chỉ tính toán khi cần thiết.

```typescript
// Tốt: Sử dụng pipe
{
  {
    price | formatMoney;
  }
}

// Không tốt: Gọi function trong template
{
  {
    formatPrice(price);
  }
}
```

## Testing

Ví dụ test cho pipes:

```typescript
import { FormatMoneyPipe } from "./format-money.pipe";

describe("FormatMoneyPipe", () => {
  let pipe: FormatMoneyPipe;

  beforeEach(() => {
    pipe = new FormatMoneyPipe();
  });

  it("should format VND currency", () => {
    expect(pipe.transform(1500000)).toBe("1.500.000 ₫");
  });

  it("should format USD currency", () => {
    expect(pipe.transform(65.5, "USD")).toBe("$65.50");
  });

  it("should handle zero value", () => {
    expect(pipe.transform(0)).toBe("0 ₫");
  });
});
```

## Error Handling

Tất cả pipes đều có xử lý lỗi graceful:

```typescript
// Pipe sẽ trả về giá trị mặc định nếu input không hợp lệ
{{ null | formatMoney }}        <!-- Hiển thị: "0 ₫" -->
{{ undefined | formatDate }}    <!-- Hiển thị: "--" -->
{{ '' | formatView }}           <!-- Hiển thị: "0 lượt xem" -->
```
