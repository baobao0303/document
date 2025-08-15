## BreakpointService

**Mô tả**: Service theo dõi thay đổi breakpoint cho responsive design

**Cách sử dụng**:

```typescript
import { BreakpointService, Breakpoints } from "@cci-web/core";

// Subscribe to breakpoint changes
this.breakpointService.breakpointsResult$.subscribe((breakpoints: Breakpoints) => {
  if (breakpoints.isPhoneOnly) {
    // Mobile logic
  } else if (breakpoints.isDesktopUp) {
    // Desktop logic
  }
});
```

**Ưu điểm**:

- Reactive breakpoint detection
- Multiple breakpoint support
- Angular CDK integration
- Distinct until changed optimization

**Nhược điểm**:

- Chỉ support predefined breakpoints
- Memory overhead cho observers
