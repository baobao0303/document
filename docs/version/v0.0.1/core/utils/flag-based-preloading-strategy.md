## FlagBasedPreloadingStrategy

**Mô tả**: Custom preloading strategy cho Angular Router

**Cách sử dụng**:

```typescript
import { FlagBasedPreloadingStrategy } from "@cci-web/core";

// Trong route config
const routes: Routes = [
  {
    path: "feature",
    loadChildren: () => import("./feature/feature.module"),
    data: { preload: true }, // Sẽ được preload
  },
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.module"),
    // Không có preload flag, sẽ không preload
  },
];

// Trong app config
RouterModule.forRoot(routes, {
  preloadingStrategy: FlagBasedPreloadingStrategy,
});
```

**Ưu điểm**:

- Selective preloading
- Improve performance
- Declarative configuration
- Fine-grained control

**Nhược điểm**:

- Cần setup manual cho từng route
- Chỉ support boolean flag
- Không có advanced conditions

**Lưu ý**:

- Chỉ preload khi `route.data.preload === true`
- Return `of(null)` cho routes không preload
- Sử dụng với lazy-loaded modules
