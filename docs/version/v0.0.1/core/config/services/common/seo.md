# SEO Service - Search Engine Optimization Service

## Giới thiệu

SEO Service là service cốt lõi được thiết kế để quản lý các thẻ meta, tiêu đề trang và các yếu tố SEO khác trong ứng dụng Angular. Service này giúp tối ưu hóa trang web cho các công cụ tìm kiếm và cải thiện khả năng hiển thị trong kết quả tìm kiếm.

## Tính năng chính

- **Meta Tag Management**: Quản lý các thẻ meta động
- **Title Management**: Cập nhật tiêu đề trang
- **Open Graph Support**: Hỗ trợ Open Graph tags cho social media
- **Twitter Cards**: Hỗ trợ Twitter Card meta tags
- **Canonical URLs**: Quản lý canonical URLs
- **Structured Data**: Hỗ trợ JSON-LD structured data
- **SSR Compatible**: Hoạt động tốt với server-side rendering
- **Dynamic Updates**: Cập nhật SEO tags theo route
- **Fallback Values**: Giá trị mặc định cho các tags
- **Validation**: Xác thực các giá trị SEO

## Phụ thuộc

Service này phụ thuộc vào các Angular modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |
| `defaultTitle` | `string` | Tiêu đề mặc định |
| `titleSeparator` | `string` | Ký tự phân cách tiêu đề |
| `siteName` | `string` | Tên website |

### Methods

#### Quản lý tiêu đề
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setTitle()` | `setTitle(title: string, append?: boolean): void` | Đặt tiêu đề trang |
| `getTitle()` | `getTitle(): string` | Lấy tiêu đề hiện tại |
| `setTitleTemplate()` | `setTitleTemplate(template: string): void` | Đặt template tiêu đề |
| `resetTitle()` | `resetTitle(): void` | Reset về tiêu đề mặc định |

#### Quản lý thẻ Meta
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setMeta()` | `setMeta(tags: MetaTag[]): void` | Đặt nhiều meta tags |
| `updateMeta()` | `updateMeta(name: string, content: string): void` | Cập nhật một meta tag |
| `removeMeta()` | `removeMeta(name: string): void` | Xóa meta tag |
| `getMeta()` | `getMeta(name: string): string \| null` | Lấy giá trị meta tag |

#### Open Graph
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setOpenGraph()` | `setOpenGraph(og: OpenGraphData): void` | Đặt Open Graph tags |
| `updateOpenGraph()` | `updateOpenGraph(property: string, content: string): void` | Cập nhật OG tag |
| `removeOpenGraph()` | `removeOpenGraph(property: string): void` | Xóa OG tag |

#### Twitter Cards
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setTwitterCard()` | `setTwitterCard(twitter: TwitterCardData): void` | Đặt Twitter Card tags |
| `updateTwitterCard()` | `updateTwitterCard(name: string, content: string): void` | Cập nhật Twitter tag |
| `removeTwitterCard()` | `removeTwitterCard(name: string): void` | Xóa Twitter tag |

#### Dữ liệu có cấu trúc
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setStructuredData()` | `setStructuredData(data: any, id?: string): void` | Đặt structured data |
| `removeStructuredData()` | `removeStructuredData(id: string): void` | Xóa structured data |
| `updateStructuredData()` | `updateStructuredData(id: string, data: any): void` | Cập nhật structured data |

#### Tiện ích
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setCanonicalUrl()` | `setCanonicalUrl(url: string): void` | Đặt canonical URL |
| `setRobots()` | `setRobots(robots: string): void` | Đặt robots meta tag |
| `setLanguage()` | `setLanguage(lang: string): void` | Đặt ngôn ngữ trang |
| `setSEOData()` | `setSEOData(seoData: SEOData): void` | Đặt tất cả SEO data |
| `resetSEO()` | `resetSEO(): void` | Reset tất cả SEO tags |

## Chi tiết triển khai

### Giao diện

```typescript
interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
  charset?: string;
}

interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

interface TwitterCardData {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonicalUrl?: string;
  openGraph?: OpenGraphData;
  twitterCard?: TwitterCardData;
  structuredData?: any;
  customMeta?: MetaTag[];
}

interface SEOConfig {
  defaultTitle: string;
  titleSeparator: string;
  siteName: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultAuthor: string;
  defaultRobots: string;
  defaultOpenGraph: Partial<OpenGraphData>;
  defaultTwitterCard: Partial<TwitterCardData>;
}
```

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private _isBrowser: boolean;
  private _config: SEOConfig;
  private _titleTemplate: string = '';
  private _structuredDataElements = new Map<string, HTMLElement>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title,
    private metaService: Meta
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this._config = this.getDefaultConfig();
  }

  private getDefaultConfig(): SEOConfig {
    return {
      defaultTitle: 'CCI Web Application',
      titleSeparator: ' | ',
      siteName: 'CCI Web',
      defaultDescription: 'CCI Web Application - Modern Angular Application',
      defaultKeywords: 'angular, web application, cci',
      defaultAuthor: 'CCI Team',
      defaultRobots: 'index, follow',
      defaultOpenGraph: {
        type: 'website',
        siteName: 'CCI Web',
        locale: 'en_US'
      },
      defaultTwitterCard: {
        card: 'summary_large_image'
      }
    };
  }

  // Configuration
  setConfig(config: Partial<SEOConfig>): void {
    this._config = { ...this._config, ...config };
  }

  getConfig(): SEOConfig {
    return { ...this._config };
  }

  // Title Management
  setTitle(title: string, append: boolean = false): void {
    try {
      let finalTitle = title;
      
      if (append && this._config.siteName) {
        finalTitle = `${title}${this._config.titleSeparator}${this._config.siteName}`;
      }
      
      if (this._titleTemplate) {
        finalTitle = this._titleTemplate.replace('{{title}}', finalTitle);
      }
      
      this.titleService.setTitle(finalTitle);
      
      // Also update Open Graph title
      this.updateOpenGraph('title', finalTitle);
      
      // Also update Twitter title
      this.updateTwitterCard('title', finalTitle);
      
    } catch (error) {
      console.error('Failed to set title:', error);
    }
  }

  getTitle(): string {
    return this.titleService.getTitle();
  }

  setTitleTemplate(template: string): void {
    this._titleTemplate = template;
  }

  resetTitle(): void {
    this.setTitle(this._config.defaultTitle);
  }

  // Meta Tag Management
  setMeta(tags: MetaTag[]): void {
    try {
      tags.forEach(tag => {
        if (tag.name) {
          this.metaService.updateTag({ name: tag.name, content: tag.content });
        } else if (tag.property) {
          this.metaService.updateTag({ property: tag.property, content: tag.content });
        } else if (tag.httpEquiv) {
          this.metaService.updateTag({ httpEquiv: tag.httpEquiv, content: tag.content });
        } else if (tag.charset) {
          this.metaService.updateTag({ charset: tag.charset });
        }
      });
    } catch (error) {
      console.error('Failed to set meta tags:', error);
    }
  }

  updateMeta(name: string, content: string): void {
    try {
      this.metaService.updateTag({ name, content });
    } catch (error) {
      console.error(`Failed to update meta tag ${name}:`, error);
    }
  }

  removeMeta(name: string): void {
    try {
      this.metaService.removeTag(`name="${name}"`);
    } catch (error) {
      console.error(`Failed to remove meta tag ${name}:`, error);
    }
  }

  getMeta(name: string): string | null {
    try {
      const tag = this.metaService.getTag(`name="${name}"`);
      return tag ? tag.content : null;
    } catch (error) {
      console.error(`Failed to get meta tag ${name}:`, error);
      return null;
    }
  }

  // Open Graph
  setOpenGraph(og: OpenGraphData): void {
    try {
      const ogData = { ...this._config.defaultOpenGraph, ...og };
      
      Object.entries(ogData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          this.metaService.updateTag({ property: `og:${key}`, content: String(value) });
        }
      });
    } catch (error) {
      console.error('Failed to set Open Graph tags:', error);
    }
  }

  updateOpenGraph(property: string, content: string): void {
    try {
      this.metaService.updateTag({ property: `og:${property}`, content });
    } catch (error) {
      console.error(`Failed to update Open Graph ${property}:`, error);
    }
  }

  removeOpenGraph(property: string): void {
    try {
      this.metaService.removeTag(`property="og:${property}"`);
    } catch (error) {
      console.error(`Failed to remove Open Graph ${property}:`, error);
    }
  }

  // Twitter Cards
  setTwitterCard(twitter: TwitterCardData): void {
    try {
      const twitterData = { ...this._config.defaultTwitterCard, ...twitter };
      
      Object.entries(twitterData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          this.metaService.updateTag({ name: `twitter:${key}`, content: String(value) });
        }
      });
    } catch (error) {
      console.error('Failed to set Twitter Card tags:', error);
    }
  }

  updateTwitterCard(name: string, content: string): void {
    try {
      this.metaService.updateTag({ name: `twitter:${name}`, content });
    } catch (error) {
      console.error(`Failed to update Twitter Card ${name}:`, error);
    }
  }

  removeTwitterCard(name: string): void {
    try {
      this.metaService.removeTag(`name="twitter:${name}"`);
    } catch (error) {
      console.error(`Failed to remove Twitter Card ${name}:`, error);
    }
  }

  // Structured Data
  setStructuredData(data: any, id: string = 'default'): void {
    try {
      if (!this._isBrowser) return;
      
      // Remove existing structured data with same ID
      this.removeStructuredData(id);
      
      // Create new script element
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-data-${id}`;
      script.textContent = JSON.stringify(data);
      
      // Add to head
      const head = this.document.head;
      if (head) {
        head.appendChild(script);
        this._structuredDataElements.set(id, script);
      }
    } catch (error) {
      console.error('Failed to set structured data:', error);
    }
  }

  removeStructuredData(id: string): void {
    try {
      const element = this._structuredDataElements.get(id);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
        this._structuredDataElements.delete(id);
      }
      
      // Also try to remove by ID selector
      const existingScript = this.document.getElementById(`structured-data-${id}`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    } catch (error) {
      console.error(`Failed to remove structured data ${id}:`, error);
    }
  }

  updateStructuredData(id: string, data: any): void {
    this.setStructuredData(data, id);
  }

  // Utilities
  setCanonicalUrl(url: string): void {
    try {
      // Remove existing canonical link
      const existingCanonical = this.document.querySelector('link[rel="canonical"]');
      if (existingCanonical && existingCanonical.parentNode) {
        existingCanonical.parentNode.removeChild(existingCanonical);
      }
      
      // Add new canonical link
      const link = this.document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      
      const head = this.document.head;
      if (head) {
        head.appendChild(link);
      }
      
      // Also update Open Graph URL
      this.updateOpenGraph('url', url);
      
    } catch (error) {
      console.error('Failed to set canonical URL:', error);
    }
  }

  setRobots(robots: string): void {
    this.updateMeta('robots', robots);
  }

  setLanguage(lang: string): void {
    try {
      if (this._isBrowser && this.document.documentElement) {
        this.document.documentElement.lang = lang;
      }
      
      // Also update Open Graph locale
      this.updateOpenGraph('locale', lang.replace('-', '_'));
      
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  }

  // Comprehensive SEO Data
  setSEOData(seoData: SEOData): void {
    try {
      // Set title
      if (seoData.title) {
        this.setTitle(seoData.title, true);
      }
      
      // Set basic meta tags
      const basicTags: MetaTag[] = [];
      
      if (seoData.description) {
        basicTags.push({ name: 'description', content: seoData.description });
      }
      
      if (seoData.keywords) {
        basicTags.push({ name: 'keywords', content: seoData.keywords });
      }
      
      if (seoData.author) {
        basicTags.push({ name: 'author', content: seoData.author });
      }
      
      if (basicTags.length > 0) {
        this.setMeta(basicTags);
      }
      
      // Set robots
      if (seoData.robots) {
        this.setRobots(seoData.robots);
      }
      
      // Set canonical URL
      if (seoData.canonicalUrl) {
        this.setCanonicalUrl(seoData.canonicalUrl);
      }
      
      // Set Open Graph
      if (seoData.openGraph) {
        this.setOpenGraph(seoData.openGraph);
      }
      
      // Set Twitter Card
      if (seoData.twitterCard) {
        this.setTwitterCard(seoData.twitterCard);
      }
      
      // Set structured data
      if (seoData.structuredData) {
        this.setStructuredData(seoData.structuredData);
      }
      
      // Set custom meta tags
      if (seoData.customMeta && seoData.customMeta.length > 0) {
        this.setMeta(seoData.customMeta);
      }
      
    } catch (error) {
      console.error('Failed to set SEO data:', error);
    }
  }

  // Reset SEO
  resetSEO(): void {
    try {
      // Reset title
      this.resetTitle();
      
      // Set default meta tags
      this.setMeta([
        { name: 'description', content: this._config.defaultDescription },
        { name: 'keywords', content: this._config.defaultKeywords },
        { name: 'author', content: this._config.defaultAuthor },
        { name: 'robots', content: this._config.defaultRobots }
      ]);
      
      // Set default Open Graph
      this.setOpenGraph(this._config.defaultOpenGraph);
      
      // Set default Twitter Card
      this.setTwitterCard(this._config.defaultTwitterCard);
      
      // Remove all structured data
      this._structuredDataElements.forEach((element, id) => {
        this.removeStructuredData(id);
      });
      
    } catch (error) {
      console.error('Failed to reset SEO:', error);
    }
  }

  // Getters
  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get defaultTitle(): string {
    return this._config.defaultTitle;
  }

  get titleSeparator(): string {
    return this._config.titleSeparator;
  }

  get siteName(): string {
    return this._config.siteName;
  }

  // Validation
  validateSEOData(seoData: SEOData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate title length
    if (seoData.title && seoData.title.length > 60) {
      errors.push('Title should be 60 characters or less');
    }
    
    // Validate description length
    if (seoData.description && seoData.description.length > 160) {
      errors.push('Description should be 160 characters or less');
    }
    
    // Validate Open Graph image
    if (seoData.openGraph?.image && !this.isValidUrl(seoData.openGraph.image)) {
      errors.push('Open Graph image must be a valid URL');
    }
    
    // Validate canonical URL
    if (seoData.canonicalUrl && !this.isValidUrl(seoData.canonicalUrl)) {
      errors.push('Canonical URL must be a valid URL');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Debug methods
  getCurrentSEOData(): any {
    return {
      title: this.getTitle(),
      description: this.getMeta('description'),
      keywords: this.getMeta('keywords'),
      author: this.getMeta('author'),
      robots: this.getMeta('robots'),
      canonical: this.document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      openGraph: this.getOpenGraphData(),
      twitterCard: this.getTwitterCardData(),
      structuredData: Array.from(this._structuredDataElements.keys()),
      language: this.document.documentElement?.lang
    };
  }

  private getOpenGraphData(): any {
    const ogTags = this.document.querySelectorAll('meta[property^="og:"]');
    const ogData: any = {};
    
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property')?.replace('og:', '');
      const content = tag.getAttribute('content');
      if (property && content) {
        ogData[property] = content;
      }
    });
    
    return ogData;
  }

  private getTwitterCardData(): any {
    const twitterTags = this.document.querySelectorAll('meta[name^="twitter:"]');
    const twitterData: any = {};
    
    twitterTags.forEach(tag => {
      const name = tag.getAttribute('name')?.replace('twitter:', '');
      const content = tag.getAttribute('content');
      if (name && content) {
        twitterData[name] = content;
      }
    });
    
    return twitterData;
  }
}
```

## Cách sử dụng

### Basic SEO Management

```typescript
import { Component, OnInit } from '@angular/core';
import { SeoService } from '@cci-web/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-page">
      <h1>Welcome to CCI Web</h1>
      <p>This is the home page with optimized SEO.</p>
      
      <div class="seo-controls">
        <button (click)="updateSEO()">Update SEO</button>
        <button (click)="resetSEO()">Reset SEO</button>
        <button (click)="showCurrentSEO()">Show Current SEO</button>
      </div>
      
      <div class="seo-info" *ngIf="currentSEO">
        <h3>Current SEO Data</h3>
        <pre>{{ currentSEO | json }}</pre>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  currentSEO: any = null;

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    // Set SEO data for home page
    this.seoService.setSEOData({
      title: 'Home - CCI Web Application',
      description: 'Welcome to CCI Web Application. A modern Angular application with advanced features and excellent user experience.',
      keywords: 'angular, web application, cci, home, modern ui',
      author: 'CCI Team',
      robots: 'index, follow',
      canonicalUrl: 'https://cci-web.com/',
      openGraph: {
        title: 'CCI Web Application - Home',
        description: 'Welcome to CCI Web Application. A modern Angular application.',
        image: 'https://cci-web.com/assets/images/og-home.jpg',
        url: 'https://cci-web.com/',
        type: 'website'
      },
      twitterCard: {
        card: 'summary_large_image',
        site: '@cciweb',
        title: 'CCI Web Application - Home',
        description: 'Welcome to CCI Web Application. A modern Angular application.',
        image: 'https://cci-web.com/assets/images/twitter-home.jpg'
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'CCI Web Application',
        'url': 'https://cci-web.com/',
        'description': 'A modern Angular application with advanced features',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://cci-web.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    });
  }

  updateSEO() {
    this.seoService.setSEOData({
      title: 'Updated Home Page',
      description: 'This is an updated description for the home page.',
      openGraph: {
        title: 'Updated CCI Web Application',
        description: 'Updated description for social media sharing.'
      }
    });
  }

  resetSEO() {
    this.seoService.resetSEO();
  }

  showCurrentSEO() {
    this.currentSEO = this.seoService.getCurrentSEOData();
  }
}
```

### Route-based SEO Service

```typescript
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SeoService } from '@cci-web/core';
import { filter, map, switchMap } from 'rxjs/operators';

interface RouteSEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noIndex?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RouteSeoService {
  private routeSEOMap = new Map<string, RouteSEOData>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService
  ) {
    this.initializeRouteSEO();
    this.setupRouteListener();
  }

  private initializeRouteSEO(): void {
    // Define SEO data for different routes
    this.routeSEOMap.set('/', {
      title: 'Home',
      description: 'Welcome to CCI Web Application home page',
      keywords: 'home, welcome, cci web',
      image: '/assets/images/home-og.jpg'
    });

    this.routeSEOMap.set('/about', {
      title: 'About Us',
      description: 'Learn more about CCI Web Application and our team',
      keywords: 'about, team, company, cci web',
      image: '/assets/images/about-og.jpg'
    });

    this.routeSEOMap.set('/contact', {
      title: 'Contact Us',
      description: 'Get in touch with CCI Web Application team',
      keywords: 'contact, support, help, cci web',
      image: '/assets/images/contact-og.jpg'
    });

    this.routeSEOMap.set('/admin', {
      title: 'Admin Panel',
      description: 'CCI Web Application admin panel',
      keywords: 'admin, management, dashboard',
      noIndex: true // Don't index admin pages
    });
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        switchMap(route => route.data)
      )
      .subscribe(data => {
        this.updateSEOForRoute(this.router.url, data);
      });
  }

  private updateSEOForRoute(url: string, routeData: any): void {
    // Get SEO data from route configuration or map
    const seoData = routeData.seo || this.routeSEOMap.get(url) || {};
    
    // Merge with route-specific data
    const finalSEOData = {
      ...seoData,
      ...routeData
    };

    // Build complete SEO data
    const completeSEOData: any = {
      title: finalSEOData.title,
      description: finalSEOData.description,
      keywords: finalSEOData.keywords,
      canonicalUrl: `${window.location.origin}${url}`,
      robots: finalSEOData.noIndex ? 'noindex, nofollow' : 'index, follow'
    };

    // Add Open Graph data
    if (finalSEOData.title || finalSEOData.description || finalSEOData.image) {
      completeSEOData.openGraph = {
        title: finalSEOData.title,
        description: finalSEOData.description,
        image: finalSEOData.image ? `${window.location.origin}${finalSEOData.image}` : undefined,
        url: `${window.location.origin}${url}`
      };
    }

    // Add Twitter Card data
    if (finalSEOData.title || finalSEOData.description || finalSEOData.image) {
      completeSEOData.twitterCard = {
        title: finalSEOData.title,
        description: finalSEOData.description,
        image: finalSEOData.image ? `${window.location.origin}${finalSEOData.image}` : undefined
      };
    }

    // Update SEO
    this.seoService.setSEOData(completeSEOData);
  }

  // Public methods
  registerRouteSEO(route: string, seoData: RouteSEOData): void {
    this.routeSEOMap.set(route, seoData);
  }

  updateRouteSEO(route: string, seoData: Partial<RouteSEOData>): void {
    const existing = this.routeSEOMap.get(route) || {};
    this.routeSEOMap.set(route, { ...existing, ...seoData });
  }

  removeRouteSEO(route: string): void {
    this.routeSEOMap.delete(route);
  }

  getRouteSEO(route: string): RouteSEOData | undefined {
    return this.routeSEOMap.get(route);
  }

  getAllRouteSEO(): Map<string, RouteSEOData> {
    return new Map(this.routeSEOMap);
  }
}
```

### Dynamic Content SEO Service

```typescript
import { Injectable } from '@angular/core';
import { SeoService } from '@cci-web/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface ContentSEOData {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  author: string;
  publishedDate: Date;
  modifiedDate: Date;
  image?: string;
  category?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DynamicContentSeoService {
  constructor(private seoService: SeoService) {}

  // Set SEO for blog post
  setBlogPostSEO(post: ContentSEOData): void {
    const seoData = {
      title: `${post.title} | CCI Web Blog`,
      description: post.description,
      keywords: post.keywords.join(', '),
      author: post.author,
      canonicalUrl: `${window.location.origin}/blog/${post.id}`,
      openGraph: {
        title: post.title,
        description: post.description,
        image: post.image,
        url: `${window.location.origin}/blog/${post.id}`,
        type: 'article'
      },
      twitterCard: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        image: post.image
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.description,
        'author': {
          '@type': 'Person',
          'name': post.author
        },
        'datePublished': post.publishedDate.toISOString(),
        'dateModified': post.modifiedDate.toISOString(),
        'image': post.image,
        'url': `${window.location.origin}/blog/${post.id}`,
        'keywords': post.keywords.join(', '),
        'articleSection': post.category,
        'publisher': {
          '@type': 'Organization',
          'name': 'CCI Web',
          'logo': {
            '@type': 'ImageObject',
            'url': `${window.location.origin}/assets/images/logo.png`
          }
        }
      },
      customMeta: [
        { name: 'article:author', content: post.author },
        { name: 'article:published_time', content: post.publishedDate.toISOString() },
        { name: 'article:modified_time', content: post.modifiedDate.toISOString() },
        { name: 'article:section', content: post.category || '' },
        ...post.tags?.map(tag => ({ name: 'article:tag', content: tag })) || []
      ]
    };

    this.seoService.setSEOData(seoData);
  }

  // Set SEO for product page
  setProductSEO(product: any): void {
    const seoData = {
      title: `${product.name} | CCI Web Store`,
      description: product.description,
      keywords: product.keywords?.join(', ') || '',
      canonicalUrl: `${window.location.origin}/products/${product.id}`,
      openGraph: {
        title: product.name,
        description: product.description,
        image: product.image,
        url: `${window.location.origin}/products/${product.id}`,
        type: 'product'
      },
      twitterCard: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        image: product.image
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'description': product.description,
        'image': product.image,
        'url': `${window.location.origin}/products/${product.id}`,
        'sku': product.sku,
        'brand': {
          '@type': 'Brand',
          'name': product.brand
        },
        'offers': {
          '@type': 'Offer',
          'price': product.price,
          'priceCurrency': product.currency || 'USD',
          'availability': product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'url': `${window.location.origin}/products/${product.id}`
        },
        'aggregateRating': product.rating ? {
          '@type': 'AggregateRating',
          'ratingValue': product.rating.average,
          'reviewCount': product.rating.count
        } : undefined
      }
    };

    this.seoService.setSEOData(seoData);
  }

  // Set SEO for user profile
  setUserProfileSEO(user: any): void {
    const seoData = {
      title: `${user.name} | CCI Web Profile`,
      description: `View ${user.name}'s profile on CCI Web. ${user.bio || ''}`,
      robots: user.isPublic ? 'index, follow' : 'noindex, nofollow',
      canonicalUrl: `${window.location.origin}/users/${user.id}`,
      openGraph: {
        title: `${user.name} - CCI Web Profile`,
        description: user.bio || `View ${user.name}'s profile on CCI Web`,
        image: user.avatar,
        url: `${window.location.origin}/users/${user.id}`,
        type: 'profile'
      },
      structuredData: user.isPublic ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': user.name,
        'description': user.bio,
        'image': user.avatar,
        'url': `${window.location.origin}/users/${user.id}`,
        'jobTitle': user.jobTitle,
        'worksFor': user.company ? {
          '@type': 'Organization',
          'name': user.company
        } : undefined,
        'sameAs': user.socialLinks || []
      } : undefined
    };

    this.seoService.setSEOData(seoData);
  }

  // Generate SEO from API data
  generateSEOFromAPI(endpoint: string, transformer: (data: any) => any): Observable<void> {
    // This would typically fetch data from an API
    // For demo purposes, we'll return a mock observable
    return of(null).pipe(
      map(() => {
        // Mock API data
        const apiData = { title: 'API Content', description: 'Content from API' };
        const seoData = transformer(apiData);
        this.seoService.setSEOData(seoData);
      }),
      catchError(error => {
        console.error('Failed to generate SEO from API:', error);
        return of(null);
      })
    );
  }

  // Validate and optimize SEO data
  validateAndOptimizeSEO(seoData: any): any {
    const optimized = { ...seoData };

    // Optimize title length
    if (optimized.title && optimized.title.length > 60) {
      optimized.title = optimized.title.substring(0, 57) + '...';
    }

    // Optimize description length
    if (optimized.description && optimized.description.length > 160) {
      optimized.description = optimized.description.substring(0, 157) + '...';
    }

    // Ensure Open Graph data
    if (!optimized.openGraph && (optimized.title || optimized.description)) {
      optimized.openGraph = {
        title: optimized.title,
        description: optimized.description
      };
    }

    // Ensure Twitter Card data
    if (!optimized.twitterCard && (optimized.title || optimized.description)) {
      optimized.twitterCard = {
        card: 'summary',
        title: optimized.title,
        description: optimized.description
      };
    }

    return optimized;
  }
}
```

## Thực hành tốt nhất

### 1. Title Optimization

```typescript
// ✅ Good: Descriptive and concise titles
this.seoService.setTitle('Angular SEO Best Practices', true);

// ✅ Good: Use title templates
this.seoService.setTitleTemplate('{{title}} | CCI Web');

// ❌ Bad: Too long or generic titles
this.seoService.setTitle('This is a very long title that exceeds the recommended 60 character limit and will be truncated in search results');
```

### 2. Meta Description Optimization

```typescript
// ✅ Good: Compelling and informative descriptions
this.seoService.updateMeta('description', 
  'Learn Angular SEO best practices with practical examples and implementation guides.');

// ❌ Bad: Too short or too long descriptions
this.seoService.updateMeta('description', 'SEO guide'); // Too short
this.seoService.updateMeta('description', 
  'This is an extremely long description that exceeds the recommended 160 character limit...'); // Too long
```

### 3. Structured Data Implementation

```typescript
// ✅ Good: Comprehensive structured data
this.seoService.setStructuredData({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Angular SEO Guide',
  'author': {
    '@type': 'Person',
    'name': 'John Doe'
  },
  'datePublished': '2024-01-01',
  'dateModified': '2024-01-15',
  'publisher': {
    '@type': 'Organization',
    'name': 'CCI Web',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://example.com/logo.png'
    }
  }
});
```

### 4. Route-based SEO Management

```typescript
// ✅ Good: Automatic SEO updates on route changes
@Injectable()
export class SEOGuard implements CanActivate {
  constructor(private seoService: SeoService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const seoData = route.data['seo'];
    if (seoData) {
      this.seoService.setSEOData(seoData);
    }
    return true;
  }
}
```

## Cân nhắc về hiệu suất

### 1. Lazy Loading SEO Data
- Chỉ load SEO data khi cần thiết
- Cache SEO data để tránh re-computation
- Sử dụng async loading cho dynamic content

### 2. Memory Management
- Cleanup structured data khi component destroy
- Limit số lượng structured data elements
- Reuse meta tags thay vì tạo mới

### 3. SSR Optimization
- Ensure SEO data được set trong server-side rendering
- Avoid client-side only SEO updates
- Use transfer state để share data giữa server và client

## Khắc phục sự cố

### Common Issues

**1. Meta tags không được update**
```typescript
// Check if running in browser
if (this.seoService.isBrowser) {
  this.seoService.updateMeta('description', 'New description');
}
```

**2. Structured data không hiển thị**
```typescript
// Validate JSON-LD format
const validation = this.seoService.validateSEOData(seoData);
if (!validation.isValid) {
  console.error('SEO validation errors:', validation.errors);
}
```

**3. Open Graph images không load**
```typescript
// Ensure absolute URLs
this.seoService.setOpenGraph({
  image: 'https://example.com/image.jpg' // ✅ Absolute URL
  // image: '/assets/image.jpg' // ❌ Relative URL might not work
});
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection và DOCUMENT token
- `@angular/platform-browser`: Title và Meta services
- `@angular/router`: Route-based SEO (optional)

## Related Services

- **DocumentService**: Document manipulation
- **WindowService**: Window object access
- **PlatformService**: Platform detection
- **ConfigMergeService**: SEO configuration management