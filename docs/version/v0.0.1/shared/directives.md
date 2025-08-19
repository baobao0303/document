# Directives Module

Module này cung cấp các Angular directives để mở rộng chức năng HTML trong ứng dụng CCI Web.

## Tổng quan

Module Directives bao gồm các directive được thiết kế để thêm các hành vi và chức năng đặc biệt cho các phần tử HTML, giúp tăng cường trải nghiệm người dùng và tương tác với ứng dụng.

## Tóm tắt nhanh

| STT | Tên                    | Mô tả ngắn                                 |
| --- | ---------------------- | ------------------------------------------ |
| 1   | `AutoWrapperDirective` | Tự động bọc nội dung theo cấu hình wrapper |
| 2   | `OpenSearchDirective`  | Mở khung/tính năng tìm kiếm khi tương tác  |

Ví dụ dùng nhanh:

```html
<button cciOpenSearch>Search</button>
<div cciAutoWrapper>Nội dung sẽ được bọc theo cấu hình wrapper</div>
```

## Danh sách Directives

### OpenSearchDirective

Directive mở chức năng tìm kiếm khi người dùng tương tác với phần tử.

#### Cách sử dụng cơ bản

```typescript
import { OpenSearchDirective } from "@cci-web/shared";

@Component({
  standalone: true,
  imports: [OpenSearchDirective],
  template: `
    <!-- Mở search khi click -->
    <button cciOpenSearch>Tìm kiếm</button>

    <!-- Mở search với cấu hình tùy chỉnh -->
    <div
      cciOpenSearch
      [searchConfig]="searchConfig"
      [triggerEvent]="'hover'"
      (searchOpened)="onSearchOpened()"
      (searchClosed)="onSearchClosed()"
    >
      Hover để tìm kiếm
    </div>

    <!-- Mở search với placeholder tùy chỉnh -->
    <input type="text" cciOpenSearch [placeholder]="'Nhập từ khóa tìm kiếm...'" [autoFocus]="true" readonly />
  `,
})
export class SearchComponent {
  searchConfig = {
    placeholder: "Tìm kiếm sản phẩm...",
    showSuggestions: true,
    maxSuggestions: 5,
  };

  onSearchOpened(): void {
    console.log("Search opened");
  }

  onSearchClosed(): void {
    console.log("Search closed");
  }
}
```

#### Properties

| Property              | Type           | Default         | Mô tả                           |
| --------------------- | -------------- | --------------- | ------------------------------- | --------- | ------------------------ |
| `searchConfig`        | `SearchConfig` | `{}`            | Cấu hình cho search component   |
| `triggerEvent`        | `'click'       | 'hover'         | 'focus'`                        | `'click'` | Sự kiện kích hoạt search |
| `placeholder`         | `string`       | `'Tìm kiếm...'` | Placeholder cho input search    |
| `autoFocus`           | `boolean`      | `true`          | Tự động focus vào input khi mở  |
| `showOverlay`         | `boolean`      | `true`          | Hiển thị overlay backdrop       |
| `closeOnEscape`       | `boolean`      | `true`          | Đóng search khi nhấn Escape     |
| `closeOnClickOutside` | `boolean`      | `true`          | Đóng search khi click bên ngoài |

#### Events

| Event          | Type                   | Mô tả                                |
| -------------- | ---------------------- | ------------------------------------ |
| `searchOpened` | `EventEmitter<void>`   | Phát ra khi search được mở           |
| `searchClosed` | `EventEmitter<void>`   | Phát ra khi search được đóng         |
| `searchQuery`  | `EventEmitter<string>` | Phát ra khi người dùng nhập từ khóa  |
| `searchSubmit` | `EventEmitter<string>` | Phát ra khi người dùng submit search |

#### SearchConfig Interface

```typescript
interface SearchConfig {
  placeholder?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  suggestionSource?: "api" | "local" | "custom";
  apiEndpoint?: string;
  localData?: any[];
  customSuggestionProvider?: (query: string) => Observable<any[]>;
  debounceTime?: number;
  minQueryLength?: number;
  showRecentSearches?: boolean;
  maxRecentSearches?: number;
  showPopularSearches?: boolean;
  popularSearches?: string[];
}
```

#### Ví dụ nâng cao

##### 1. Search với API suggestions

```typescript
@Component({
  template: `
    <div
      cciOpenSearch
      [searchConfig]="apiSearchConfig"
      (searchQuery)="onSearchQuery($event)"
      (searchSubmit)="onSearchSubmit($event)"
    >
      <i class="search-icon"></i>
      Tìm kiếm sản phẩm
    </div>
  `,
})
export class ProductSearchComponent {
  apiSearchConfig: SearchConfig = {
    placeholder: "Tìm kiếm sản phẩm...",
    showSuggestions: true,
    maxSuggestions: 8,
    suggestionSource: "api",
    apiEndpoint: "/api/products/search/suggestions",
    debounceTime: 300,
    minQueryLength: 2,
    showRecentSearches: true,
    maxRecentSearches: 5,
  };

  onSearchQuery(query: string): void {
    console.log("Search query:", query);
    // Có thể thực hiện search realtime ở đây
  }

  onSearchSubmit(query: string): void {
    console.log("Search submitted:", query);
    // Thực hiện search và navigate đến trang kết quả
    this.router.navigate(["/search"], { queryParams: { q: query } });
  }
}
```

##### 2. Search với custom suggestion provider

```typescript
@Component({
  template: ` <button cciOpenSearch [searchConfig]="customSearchConfig">Tìm kiếm nâng cao</button> `,
})
export class AdvancedSearchComponent {
  customSearchConfig: SearchConfig = {
    placeholder: "Tìm kiếm theo danh mục, thương hiệu...",
    showSuggestions: true,
    maxSuggestions: 10,
    suggestionSource: "custom",
    customSuggestionProvider: this.getCustomSuggestions.bind(this),
    debounceTime: 250,
    minQueryLength: 1,
  };

  private getCustomSuggestions(query: string): Observable<any[]> {
    // Logic tùy chỉnh để lấy suggestions
    return this.searchService.getAdvancedSuggestions(query).pipe(
      map((results) =>
        results.map((item) => ({
          text: item.name,
          category: item.category,
          icon: item.icon,
          url: item.url,
        }))
      )
    );
  }
}
```

##### 3. Search với local data

```typescript
@Component({
  template: `
    <div class="search-container">
      <input
        type="text"
        cciOpenSearch
        [searchConfig]="localSearchConfig"
        [triggerEvent]="'focus'"
        placeholder="Tìm trong danh sách..."
        readonly
      />
    </div>
  `,
})
export class LocalSearchComponent {
  localData = [
    { name: "iPhone 15 Pro", category: "Điện thoại", price: 29990000 },
    { name: "Samsung Galaxy S24", category: "Điện thoại", price: 22990000 },
    { name: "MacBook Pro M3", category: "Laptop", price: 52990000 },
    // ... more data
  ];

  localSearchConfig: SearchConfig = {
    placeholder: "Tìm sản phẩm trong danh sách...",
    showSuggestions: true,
    maxSuggestions: 6,
    suggestionSource: "local",
    localData: this.localData,
    debounceTime: 200,
    minQueryLength: 1,
    showPopularSearches: true,
    popularSearches: ["iPhone", "Samsung", "MacBook", "iPad"],
  };
}
```

#### Styling

Directive hỗ trợ CSS custom properties để tùy chỉnh giao diện:

```scss
// Tùy chỉnh search overlay
:root {
  --cci-search-overlay-bg: rgba(0, 0, 0, 0.5);
  --cci-search-overlay-z-index: 1000;
}

// Tùy chỉnh search input
:root {
  --cci-search-input-bg: #ffffff;
  --cci-search-input-border: #dee2e6;
  --cci-search-input-border-focus: #007bff;
  --cci-search-input-padding: 12px 16px;
  --cci-search-input-border-radius: 8px;
  --cci-search-input-font-size: 16px;
}

// Tùy chỉnh suggestions
:root {
  --cci-search-suggestions-bg: #ffffff;
  --cci-search-suggestions-border: #dee2e6;
  --cci-search-suggestions-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --cci-search-suggestion-hover-bg: #f8f9fa;
  --cci-search-suggestion-padding: 12px 16px;
}
```

#### CSS Classes

Directive tự động thêm các CSS classes:

```scss
// Class được thêm vào host element
.cci-search-trigger {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &.cci-search-active {
    // Style khi search đang mở
  }
}

// Classes cho search component
.cci-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--cci-search-overlay-bg);
  z-index: var(--cci-search-overlay-z-index);
}

.cci-search-container {
  position: relative;
  max-width: 600px;
  margin: 100px auto 0;
  padding: 0 20px;
}

.cci-search-input {
  width: 100%;
  background: var(--cci-search-input-bg);
  border: 1px solid var(--cci-search-input-border);
  padding: var(--cci-search-input-padding);
  border-radius: var(--cci-search-input-border-radius);
  font-size: var(--cci-search-input-font-size);

  &:focus {
    outline: none;
    border-color: var(--cci-search-input-border-focus);
  }
}

.cci-search-suggestions {
  background: var(--cci-search-suggestions-bg);
  border: 1px solid var(--cci-search-suggestions-border);
  box-shadow: var(--cci-search-suggestions-shadow);
  border-radius: 8px;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.cci-search-suggestion {
  padding: var(--cci-search-suggestion-padding);
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: var(--cci-search-suggestion-hover-bg);
  }

  &:last-child {
    border-bottom: none;
  }
}
```

#### Accessibility

Directive tuân thủ các tiêu chuẩn accessibility:

- Hỗ trợ keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ARIA labels và roles phù hợp
- Screen reader friendly
- Focus management

```html
<!-- Directive tự động thêm các ARIA attributes -->
<div cciOpenSearch role="button" tabindex="0" aria-label="Mở tìm kiếm" aria-expanded="false" aria-haspopup="dialog">
  Tìm kiếm
</div>
```

#### Testing

Ví dụ test cho directive:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OpenSearchDirective } from "./open-search.directive";
import { Component } from "@angular/core";

@Component({
  template: `<button cciOpenSearch>Search</button>`,
})
class TestComponent {}

describe("OpenSearchDirective", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let buttonElement: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [OpenSearchDirective],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.nativeElement.querySelector("button");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should open search on click", () => {
    buttonElement.click();
    fixture.detectChanges();

    const overlay = document.querySelector(".cci-search-overlay");
    expect(overlay).toBeTruthy();
  });

  it("should close search on escape key", () => {
    buttonElement.click();
    fixture.detectChanges();

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    const overlay = document.querySelector(".cci-search-overlay");
    expect(overlay).toBeFalsy();
  });
});
```

## Best Practices

1. **Performance**: Sử dụng debounce cho API calls để tránh spam requests.

2. **UX**: Cung cấp feedback rõ ràng khi search đang loading.

3. **Accessibility**: Đảm bảo directive hoạt động tốt với keyboard và screen readers.

4. **Mobile**: Test trên các thiết bị mobile để đảm bảo UX tốt.

5. **Error Handling**: Xử lý graceful khi API search fails.

```typescript
// Ví dụ error handling
@Component({
  template: ` <div cciOpenSearch [searchConfig]="searchConfig" (searchError)="onSearchError($event)">Tìm kiếm</div> `,
})
export class SearchWithErrorHandlingComponent {
  searchConfig: SearchConfig = {
    // ... config
    onError: (error) => {
      console.error("Search error:", error);
      this.showErrorMessage("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
    },
  };

  onSearchError(error: any): void {
    // Handle search errors
  }

  private showErrorMessage(message: string): void {
    // Show error message to user
  }
}
```
