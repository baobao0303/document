# Translate Provider

## Tổng quan

`Translate Provider` là một provider pattern cung cấp internationalization (i18n) cho ứng dụng Angular, hỗ trợ cả browser environment (HTTP loader) và Server-Side Rendering (SSR) với static loader.

## Cách sử dụng

### Bước 1: Tạo Interface cho HTTP Options

```typescript
export interface ITranslateHttpOptions {
  /** Path prefix for translation files (default: "/assets/i18n/") */
  prefix?: string;
  /** File suffix for translation files (default: ".json") */
  suffix?: string;
}
```

### Bước 2: Tạo HTTP-based Translate Module

```typescript
export function getTranslateHttpModule(options?: ITranslateHttpOptions): ModuleWithProviders<TranslateModule> {
  const prefix = options?.prefix ?? "/assets/i18n/";
  const suffix = options?.suffix ?? ".json";

  const loaderFactory = (http: HttpClient) => new TranslateHttpLoader(http, prefix, suffix);

  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: loaderFactory,
      deps: [HttpClient],
    },
  });
}
```

### Bước 3: Tạo Static Translate Loader cho SSR

```typescript
export class StaticTranslateLoader implements TranslateLoader {
  constructor(private readonly resources: TranslationResources) {}

  public getTranslation(lang: string): Observable<Record<string, any>> {
    const data = this.resources[lang] ?? {};
    return of(data);
  }
}
```

### Bước 4: Tạo Static Translate Module

```typescript
export function getTranslateStaticModule(resources: TranslationResources): ModuleWithProviders<TranslateModule> {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: () => new StaticTranslateLoader(resources),
    },
  });
}
```

### Browser Environment (HTTP Loader):

```typescript
// Trong app.config.ts hoặc app.module.ts
import { getTranslateHttpModule } from "./core/providers/translate.provider";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    ...getTranslateHttpModule({
      prefix: "/assets/i18n/",
      suffix: ".json",
    }).providers,
  ],
};
```

### SSR Environment (Static Loader):

```typescript
// Trong SSR configuration
import { getTranslateStaticModule } from "./core/providers/translate.provider";

const resources = {
  en: {
    hello: "Hello",
    welcome: "Welcome to our app",
  },
  vi: {
    hello: "Xin chào",
    welcome: "Chào mừng đến với ứng dụng",
  },
};

export const appConfig: ApplicationConfig = {
  providers: [...getTranslateStaticModule(resources).providers],
};
```

### Trong Component:

```typescript
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-root",
  template: `
    <div>
      <h1>{{ "hello" | translate }}</h1>
      <p>{{ "welcome" | translate }}</p>
      <button (click)="switchLanguage('vi')">Tiếng Việt</button>
      <button (click)="switchLanguage('en')">English</button>
    </div>
  `,
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang("en");
    translate.use("en");
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
```
