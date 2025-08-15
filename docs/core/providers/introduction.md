## Providers

Các provider cung cấp dependency injection và configuration.

### Danh sách Providers

| Tên                | File                     | Mô tả                                    | Loại           |
| ------------------ | ------------------------ | ---------------------------------------- | -------------- |
| `CCI_WEB_APP_NAME` | `app-config.provider.ts` | Injection token cho app name             | InjectionToken |
| `getBaseProviders` | `base.provider.ts`       | Base providers cho app                   | Function       |
| Các providers khác | `*.provider.ts`          | Config, environment, translate providers | Various        |
