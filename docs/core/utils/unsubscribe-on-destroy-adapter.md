## UnsubscribeOnDestroyAdapter

**Mô tả**: Base class tự động unsubscribe khi component destroy

**Cách sử dụng**:

```typescript
import { UnsubscribeOnDestroyAdapter } from '@cci-web/core';

export class MyComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  ngOnInit() {
    // Using SubSink (inherited)
    this.subs.sink = this.dataService.getData().subscribe(...);

    // Using destroy$ Subject
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);
  }

  // ngOnDestroy tự động được gọi từ parent class
}
```

**Ưu điểm**:

- Automatic cleanup
- Multiple unsubscribe patterns
- Inheritance-based, clean code
- Provides both SubSink và destroy$ Subject

**Nhược điểm**:

- Requires inheritance
- Injectable decorator (có thể không cần thiết)
- Thêm complexity cho simple components
