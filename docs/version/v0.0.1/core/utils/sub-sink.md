## SubSink

**Mô tả**: Utility class quản lý RxJS subscriptions

**Cách sử dụng**:

```typescript
import { SubSink } from '@cci-web/core';

export class MyComponent implements OnDestroy {
  private subs = new SubSink();

  ngOnInit() {
    // Method 1: using sink setter
    this.subs.sink = this.dataService.getData().subscribe(...);

    // Method 2: using add method
    this.subs.add(
      this.userService.getUser().subscribe(...),
      this.configService.getConfig().subscribe(...)
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
```

**Ưu điểm**:

- Prevent memory leaks
- Clean API với multiple ways to add subscriptions
- Automatic cleanup
- Lightweight

**Nhược điểm**:

- Manual setup required
- Cần nhớ call unsubscribe trong ngOnDestroy
