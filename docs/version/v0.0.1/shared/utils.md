# Utils Module

Module này cung cấp các utility functions và helper functions để hỗ trợ phát triển ứng dụng CCI Web.

## Tổng quan

Module Utils bao gồm các hàm tiện ích được thiết kế để xử lý các tác vụ phổ biến như kiểm tra URL, chuyển đổi dữ liệu, xử lý mảng, và quản lý navigation.

### Tóm tắt nhanh

| STT | Hàm                                       | Mô tả ngắn                                  |
| --- | ----------------------------------------- | ------------------------------------------- |
| 1   | `checkUrl(full, match)`                   | Kiểm tra URL có chứa path                   |
| 2   | `convertISOToDateObject(s)`               | Chuyển ISO string → đối tượng ngày chi tiết |
| 3   | `convertArrayTwoItemInSlide(arr, k1, k2)` | Gom mảng theo cặp 2 phần tử/slide           |
| 4   | `getUrlImageCDN(url, cdn)`                | Tạo URL ảnh đầy đủ từ CDN                   |
| 5   | `navigateHistory()`                       | Quay lại trang trước                        |

Ví dụ dùng nhanh:

```typescript
const cdnImg = getUrlImageCDN("/images/p.jpg", "https://cdn.example.com");
// => https://cdn.example.com/images/p.jpg
```

## Danh sách Utility Functions

### checkUrl(url: string): boolean

Kiểm tra tính hợp lệ của một URL path.

#### Cách sử dụng

```typescript
import { checkUrl } from "@cci-web/shared";

// Kiểm tra URL hợp lệ
const isValid1 = checkUrl("/products/123"); // true
const isValid2 = checkUrl("https://example.com/page"); // true
const isValid3 = checkUrl("invalid-url"); // false
const isValid4 = checkUrl(""); // false

// Sử dụng trong component
@Component({
  template: `
    <a [href]="productUrl" [class.disabled]="!isValidUrl" (click)="navigateToProduct($event)"> Xem sản phẩm </a>
  `,
})
export class ProductLinkComponent {
  productUrl = "/products/abc-123";

  get isValidUrl(): boolean {
    return checkUrl(this.productUrl);
  }

  navigateToProduct(event: Event): void {
    if (!this.isValidUrl) {
      event.preventDefault();
      console.warn("Invalid URL:", this.productUrl);
      return;
    }
    // Proceed with navigation
  }
}
```

#### Parameters

| Parameter | Type     | Mô tả            |
| --------- | -------- | ---------------- |
| `url`     | `string` | URL cần kiểm tra |

#### Returns

| Type      | Mô tả                                    |
| --------- | ---------------------------------------- |
| `boolean` | `true` nếu URL hợp lệ, `false` nếu không |

---

### convertISOToDateObject(isoString: string): DateObject

Chuyển đổi chuỗi ISO date thành object chứa thông tin chi tiết về ngày tháng.

#### Cách sử dụng

```typescript
import { convertISOToDateObject } from "@cci-web/shared";

// Chuyển đổi ISO string
const isoDate = "2024-03-15T10:30:00.000Z";
const dateObj = convertISOToDateObject(isoDate);

console.log(dateObj);
// Output:
// {
//   year: 2024,
//   month: 3,
//   day: 15,
//   hour: 10,
//   minute: 30,
//   second: 0,
//   dayOfWeek: 5, // 0 = Chủ nhật, 1 = Thứ hai, ...
//   dayOfWeekName: 'Thứ sáu',
//   monthName: 'Tháng 3',
//   formattedDate: '15/03/2024',
//   formattedTime: '10:30',
//   formattedDateTime: '15/03/2024 10:30',
//   timestamp: 1710500200000
// }

// Sử dụng trong component
@Component({
  template: `
    <div class="date-display">
      <h3>{{ dateInfo.dayOfWeekName }}, {{ dateInfo.formattedDate }}</h3>
      <p>{{ dateInfo.formattedTime }}</p>
      <small>{{ dateInfo.monthName }} {{ dateInfo.year }}</small>
    </div>
  `,
})
export class DateDisplayComponent {
  @Input() isoDateString!: string;

  get dateInfo() {
    return convertISOToDateObject(this.isoDateString);
  }
}
```

#### Parameters

| Parameter   | Type     | Mô tả                         |
| ----------- | -------- | ----------------------------- |
| `isoString` | `string` | Chuỗi ISO date cần chuyển đổi |

#### Returns

| Type         | Mô tả                                        |
| ------------ | -------------------------------------------- |
| `DateObject` | Object chứa thông tin chi tiết về ngày tháng |

#### DateObject Interface

```typescript
interface DateObject {
  year: number; // Năm (2024)
  month: number; // Tháng (1-12)
  day: number; // Ngày (1-31)
  hour: number; // Giờ (0-23)
  minute: number; // Phút (0-59)
  second: number; // Giây (0-59)
  dayOfWeek: number; // Thứ trong tuần (0-6, 0 = Chủ nhật)
  dayOfWeekName: string; // Tên thứ trong tuần
  monthName: string; // Tên tháng
  formattedDate: string; // Ngày định dạng dd/mm/yyyy
  formattedTime: string; // Giờ định dạng hh:mm
  formattedDateTime: string; // Ngày giờ định dạng dd/mm/yyyy hh:mm
  timestamp: number; // Unix timestamp
}
```

---

### convertArrayTwoItemInSlide(array: T[]): T[][]

Chuyển đổi mảng thành mảng các slide, mỗi slide chứa 2 phần tử, phục vụ cho carousel component.

#### Cách sử dụng

```typescript
import { convertArrayTwoItemInSlide } from "@cci-web/shared";

// Chuyển đổi mảng sản phẩm
const products = [
  { id: 1, name: "Sản phẩm 1" },
  { id: 2, name: "Sản phẩm 2" },
  { id: 3, name: "Sản phẩm 3" },
  { id: 4, name: "Sản phẩm 4" },
  { id: 5, name: "Sản phẩm 5" },
];

const slides = convertArrayTwoItemInSlide(products);
console.log(slides);
// Output:
// [
//   [{ id: 1, name: 'Sản phẩm 1' }, { id: 2, name: 'Sản phẩm 2' }],
//   [{ id: 3, name: 'Sản phẩm 3' }, { id: 4, name: 'Sản phẩm 4' }],
//   [{ id: 5, name: 'Sản phẩm 5' }]
// ]

// Sử dụng trong carousel component
@Component({
  template: `
    <div class="carousel">
      <div class="slide" *ngFor="let slide of productSlides; let i = index" [class.active]="i === currentSlide">
        <div class="product-item" *ngFor="let product of slide">
          <h4>{{ product.name }}</h4>
          <p>{{ product.description }}</p>
        </div>
      </div>
    </div>

    <div class="carousel-controls">
      <button (click)="previousSlide()" [disabled]="currentSlide === 0">Trước</button>
      <span>{{ currentSlide + 1 }} / {{ productSlides.length }}</span>
      <button (click)="nextSlide()" [disabled]="currentSlide === productSlides.length - 1">Sau</button>
    </div>
  `,
})
export class ProductCarouselComponent {
  @Input() products: Product[] = [];
  currentSlide = 0;

  get productSlides(): Product[][] {
    return convertArrayTwoItemInSlide(this.products);
  }

  nextSlide(): void {
    if (this.currentSlide < this.productSlides.length - 1) {
      this.currentSlide++;
    }
  }

  previousSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }
}
```

#### Parameters

| Parameter | Type  | Mô tả               |
| --------- | ----- | ------------------- |
| `array`   | `T[]` | Mảng cần chuyển đổi |

#### Returns

| Type    | Mô tả                                           |
| ------- | ----------------------------------------------- |
| `T[][]` | Mảng các slide, mỗi slide chứa tối đa 2 phần tử |

---

### getUrlImageCDN(imagePath: string, baseUrl?: string): string

Tạo URL đầy đủ cho hình ảnh từ CDN.

#### Cách sử dụng

```typescript
import { getUrlImageCDN } from "@cci-web/shared";

// Sử dụng với base URL mặc định
const imageUrl1 = getUrlImageCDN("/products/image1.jpg");
// Output: 'https://cdn.cci.com/products/image1.jpg'

// Sử dụng với custom base URL
const imageUrl2 = getUrlImageCDN("/products/image2.jpg", "https://custom-cdn.com");
// Output: 'https://custom-cdn.com/products/image2.jpg'

// Xử lý URL đã có protocol
const imageUrl3 = getUrlImageCDN("https://external.com/image.jpg");
// Output: 'https://external.com/image.jpg' (không thay đổi)

// Sử dụng trong component
@Component({
  template: `
    <div class="product-gallery">
      <img
        *ngFor="let image of productImages"
        [src]="getCDNUrl(image.path)"
        [alt]="image.alt"
        [loading]="'lazy'"
        (error)="onImageError($event)"
      />
    </div>
  `,
})
export class ProductGalleryComponent {
  @Input() productImages: ProductImage[] = [];

  getCDNUrl(imagePath: string): string {
    return getUrlImageCDN(imagePath);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = getUrlImageCDN("/assets/images/placeholder.jpg");
  }
}
```

#### Parameters

| Parameter   | Type     | Default     | Mô tả                       |
| ----------- | -------- | ----------- | --------------------------- |
| `imagePath` | `string` | -           | Đường dẫn hình ảnh          |
| `baseUrl`   | `string` | `undefined` | Base URL của CDN (tùy chọn) |

#### Returns

| Type     | Mô tả                   |
| -------- | ----------------------- |
| `string` | URL đầy đủ của hình ảnh |

---

### navigateHistory(direction: 'back' | 'forward', fallbackUrl?: string): void

Quản lý navigation history của browser.

#### Cách sử dụng

```typescript
import { navigateHistory } from "@cci-web/shared";

// Quay lại trang trước
navigateHistory("back");

// Tiến tới trang sau
navigateHistory("forward");

// Quay lại với fallback URL nếu không có history
navigateHistory("back", "/home");

// Sử dụng trong component
@Component({
  template: `
    <div class="navigation-controls">
      <button (click)="goBack()" [disabled]="!canGoBack">
        <i class="icon-arrow-left"></i>
        Quay lại
      </button>

      <button (click)="goForward()" [disabled]="!canGoForward">
        Tiến tới
        <i class="icon-arrow-right"></i>
      </button>

      <button (click)="goHome()">
        <i class="icon-home"></i>
        Trang chủ
      </button>
    </div>
  `,
})
export class NavigationComponent {
  canGoBack = window.history.length > 1;
  canGoForward = false; // Cần logic phức tạp hơn để detect

  goBack(): void {
    navigateHistory("back", "/home");
  }

  goForward(): void {
    navigateHistory("forward");
  }

  goHome(): void {
    this.router.navigate(["/home"]);
  }
}
```

#### Parameters

| Parameter     | Type     | Default     | Mô tả                             |
| ------------- | -------- | ----------- | --------------------------------- | ---------------- |
| `direction`   | `'back'  | 'forward'`  | -                                 | Hướng navigation |
| `fallbackUrl` | `string` | `undefined` | URL fallback nếu không có history |

#### Returns

| Type   | Mô tả                |
| ------ | -------------------- |
| `void` | Không trả về giá trị |

## Ví dụ tổng hợp

### 1. Product Detail Component

```typescript
import { checkUrl, convertISOToDateObject, getUrlImageCDN, navigateHistory } from "@cci-web/shared";

@Component({
  template: `
    <div class="product-detail">
      <!-- Navigation -->
      <div class="breadcrumb">
        <button (click)="goBack()">← Quay lại</button>
        <span>Chi tiết sản phẩm</span>
      </div>

      <!-- Product Images -->
      <div class="product-images">
        <img *ngFor="let image of productImages" [src]="getCDNImageUrl(image)" [alt]="product.name" />
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="price">{{ product.price | formatMoney }}</p>

        <!-- Created Date -->
        <div class="product-meta">
          <span>Ngày tạo: {{ createdDateInfo.formattedDateTime }}</span>
          <span>{{ createdDateInfo.dayOfWeekName }}</span>
        </div>

        <!-- Related Links -->
        <div class="related-links">
          <a
            *ngFor="let link of relatedLinks"
            [href]="link.url"
            [class.disabled]="!isValidUrl(link.url)"
            (click)="handleLinkClick($event, link)"
          >
            {{ link.title }}
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ProductDetailComponent {
  @Input() product!: Product;
  @Input() relatedLinks: RelatedLink[] = [];

  get productImages(): string[] {
    return this.product.images || [];
  }

  get createdDateInfo() {
    return convertISOToDateObject(this.product.createdAt);
  }

  getCDNImageUrl(imagePath: string): string {
    return getUrlImageCDN(imagePath);
  }

  isValidUrl(url: string): boolean {
    return checkUrl(url);
  }

  goBack(): void {
    navigateHistory("back", "/products");
  }

  handleLinkClick(event: Event, link: RelatedLink): void {
    if (!this.isValidUrl(link.url)) {
      event.preventDefault();
      console.warn("Invalid URL:", link.url);
      return;
    }
  }
}
```

### 2. Product Carousel Service

```typescript
import { convertArrayTwoItemInSlide } from "@cci-web/shared";

@Injectable({
  providedIn: "root",
})
export class CarouselService {
  createProductSlides(products: Product[]): Product[][] {
    return convertArrayTwoItemInSlide(products);
  }

  createImageSlides(images: string[]): string[][] {
    return convertArrayTwoItemInSlide(images);
  }

  createCustomSlides<T>(items: T[], itemsPerSlide: number = 2): T[][] {
    if (itemsPerSlide === 2) {
      return convertArrayTwoItemInSlide(items);
    }

    // Custom logic for other slide sizes
    const slides: T[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      slides.push(items.slice(i, i + itemsPerSlide));
    }
    return slides;
  }
}
```

### 3. Date Utility Service

```typescript
import { convertISOToDateObject } from "@cci-web/shared";

@Injectable({
  providedIn: "root",
})
export class DateUtilityService {
  formatProductDate(isoString: string): string {
    const dateObj = convertISOToDateObject(isoString);
    return `${dateObj.dayOfWeekName}, ${dateObj.formattedDate}`;
  }

  getRelativeTime(isoString: string): string {
    const dateObj = convertISOToDateObject(isoString);
    const now = Date.now();
    const diff = now - dateObj.timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else {
      return `${days} ngày trước`;
    }
  }

  isToday(isoString: string): boolean {
    const dateObj = convertISOToDateObject(isoString);
    const today = convertISOToDateObject(new Date().toISOString());

    return dateObj.year === today.year && dateObj.month === today.month && dateObj.day === today.day;
  }
}
```

## Best Practices

1. **Error Handling**: Luôn kiểm tra input trước khi xử lý.

```typescript
// Tốt
function safeCheckUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  return checkUrl(url);
}
```

2. **Performance**: Cache kết quả cho các operations tốn kém.

```typescript
// Cache CDN URLs
const cdnUrlCache = new Map<string, string>();

function getCachedCDNUrl(imagePath: string): string {
  if (cdnUrlCache.has(imagePath)) {
    return cdnUrlCache.get(imagePath)!;
  }

  const url = getUrlImageCDN(imagePath);
  cdnUrlCache.set(imagePath, url);
  return url;
}
```

3. **Type Safety**: Sử dụng TypeScript interfaces.

```typescript
interface ProductWithFormattedDate extends Product {
  formattedCreatedAt: DateObject;
}

function enhanceProductWithDate(product: Product): ProductWithFormattedDate {
  return {
    ...product,
    formattedCreatedAt: convertISOToDateObject(product.createdAt),
  };
}
```

4. **Testing**: Viết unit tests cho các utility functions.

```typescript
describe("Utils Functions", () => {
  describe("checkUrl", () => {
    it("should return true for valid URLs", () => {
      expect(checkUrl("/products/123")).toBe(true);
      expect(checkUrl("https://example.com")).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      expect(checkUrl("")).toBe(false);
      expect(checkUrl("invalid")).toBe(false);
    });
  });

  describe("convertArrayTwoItemInSlide", () => {
    it("should convert array to slides correctly", () => {
      const input = [1, 2, 3, 4, 5];
      const expected = [[1, 2], [3, 4], [5]];
      expect(convertArrayTwoItemInSlide(input)).toEqual(expected);
    });
  });
});
```

## Troubleshooting

### Vấn đề thường gặp

1. **URL không hợp lệ**

   - Kiểm tra format URL
   - Đảm bảo có protocol (http/https) cho external URLs

2. **Date conversion lỗi**

   - Kiểm tra format ISO string
   - Xử lý timezone nếu cần

3. **CDN images không load**

   - Kiểm tra CDN base URL
   - Implement fallback images

4. **Navigation không hoạt động**
   - Kiểm tra browser history
   - Cung cấp fallback URL

### Debug Tips

```typescript
// Enable debug logging
const DEBUG = environment.production === false;

function debugLog(message: string, data?: any): void {
  if (DEBUG) {
    console.log(`[Utils Debug] ${message}`, data);
  }
}

// Sử dụng trong functions
export function checkUrl(url: string): boolean {
  debugLog('Checking URL:', url);
  const result = /* validation logic */;
  debugLog('URL check result:', result);
  return result;
}
```
