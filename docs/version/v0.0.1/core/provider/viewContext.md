# View Context

## Tổng quan

`View Context` là một provider pattern giúp tách biệt rõ ràng giữa **UI logic** (Component) và **Business logic** (Service), sử dụng Angular signals để quản lý state và tự động cập nhật UI.

## Cách sử dụng

### Bước 1: Tạo Service

Bạn tạo một service bạn dùng. Thí dụ bạn đang làm chức năng sign in thì bạn chỉ cần 2 thứ:

1. **SignInComponent**
2. **SignInContext**

### Bước 2: Khai báo Provider trong Component

```typescript
import { Component, OnInit } from "@angular/core";
import { VIEW_CONTEXT, ViewBase } from "@view/base";

import { SignInContext } from "./sign-in.context";

@Component({
  selector: "orbitmail-sign-in",
  imports: [],
  templateUrl: "./sign-in.component.html",
  styleUrl: "./sign-in.component.scss",
  providers: [{ provide: VIEW_CONTEXT, useClass: SignInContext }],
})
export class SignInComponent extends ViewBase implements OnInit {
  ngOnInit(): void {}
}
```

### Bước 3: Tạo Service Context

Trong service bạn chỉ cần viết bình thường:

```typescript
import { Injectable, signal } from "@angular/core";
import { ViewContext } from "@view/base";

@Injectable({ providedIn: "root" })
export class SignInContext extends ViewContext {
  // Biến signal để test
  testSignal = signal<string>("Hello from SignIn Context!");
  counterSignal = signal<number>(0);

  // Methods để test
  updateTestMessage(message: string) {
    this.testSignal.set(message);
  }

  setActiveItem(item: any): void {}

  getActiveItem(filter?: any) {}

  getViewData(filter?: any) {
    return {
      testMessage: this.testSignal(),
    };
  }
}
```

## Cách sử dụng

### Giải thích các method có sẵn:

Bạn sẽ thấy mình có `setActiveItem`, `getActiveItem`, `getViewData` → cái này tôi đã setup mặc định một số thứ để bạn viết HTML một cách dễ dàng.

Ở trường hợp này bạn sẽ thấy `getViewData` return `testMessage` thì khi bạn provider service thành công khi call API hay làm gì đó render cập nhật trên UI thì chỉ cần để:

```html
<h1>{{ this._context.getViewData().testMessage }}</h1>
```

→ thì nó sẽ tự động render không cần phải đụng gì bên component.

### Ví dụ thực tế:

```typescript
// Component chỉ xử lý UI
export class SignInComponent extends ViewBase {
  constructor() {
    super();
  }

  onSignIn() {
    // Gọi service thay vì xử lý logic
    this._context.signIn(this.credentials);
  }
}

// Service xử lý tất cả logic
export class SignInContext extends ViewContext {
  signIn(credentials: any) {
    // Call API
    this.apiService.signIn(credentials).subscribe((response) => {
      // Update signals
      this.userSignal.set(response.user);
      this.isAuthenticatedSignal.set(true);
    });
  }
}
```
