# Document Service - Safe Document Access Service

## Giới thiệu

Document Service là service cốt lõi cung cấp quyền truy cập an toàn đến đối tượng `document` gốc. Service này đảm bảo hoạt động tốt trong cả môi trường browser và server-side rendering (SSR), tránh các lỗi khi document không tồn tại.

## Tính năng chính

- **Safe Document Access**: Truy cập an toàn đến document object
- **SSR Compatible**: Hoạt động tốt trong server-side rendering
- **DOM Manipulation**: Các phương thức tiện ích cho thao tác DOM
- **Type Safety**: Full TypeScript support
- **Null Safety**: Tránh errors khi document không tồn tại
- **Platform Detection**: Tự động phát hiện môi trường
- **Element Utilities**: Các tiện ích để làm việc với DOM elements
- **Event Handling**: Safe event handling trên document

## Dependencies

Service này phụ thuộc vào các Angular core modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `nativeDocument` | `Document \| null` | Native document object (null trong SSR) |
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getDocument()` | `getDocument(): Document \| null` | Lấy document object an toàn |
| `isDocumentAvailable()` | `isDocumentAvailable(): boolean` | Kiểm tra document có sẵn |
| `getElementById()` | `getElementById(id: string): HTMLElement \| null` | Tìm element theo ID |
| `getElementsByClassName()` | `getElementsByClassName(className: string): HTMLCollectionOf<Element> \| null` | Tìm elements theo class |
| `getElementsByTagName()` | `getElementsByTagName(tagName: string): HTMLCollectionOf<Element> \| null` | Tìm elements theo tag |
| `querySelector()` | `querySelector(selector: string): Element \| null` | Tìm element đầu tiên theo selector |
| `querySelectorAll()` | `querySelectorAll(selector: string): NodeListOf<Element> \| null` | Tìm tất cả elements theo selector |
| `createElement()` | `createElement(tagName: string): HTMLElement \| null` | Tạo element mới |
| `createTextNode()` | `createTextNode(text: string): Text \| null` | Tạo text node mới |
| `getTitle()` | `getTitle(): string` | Lấy title của document |
| `setTitle()` | `setTitle(title: string): void` | Set title của document |
| `getHead()` | `getHead(): HTMLHeadElement \| null` | Lấy head element |
| `getBody()` | `getBody(): HTMLBodyElement \| null` | Lấy body element |
| `getActiveElement()` | `getActiveElement(): Element \| null` | Lấy element đang được focus |
| `addEventListener()` | `addEventListener(event: string, handler: EventListener): void` | Thêm event listener |
| `removeEventListener()` | `removeEventListener(event: string, handler: EventListener): void` | Xóa event listener |

## Implementation Details

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private _isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  // Getters
  get nativeDocument(): Document | null {
    return this._isBrowser ? this.document : null;
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  // Core methods
  getDocument(): Document | null {
    return this.nativeDocument;
  }

  isDocumentAvailable(): boolean {
    return this.nativeDocument !== null;
  }

  // Element selection methods
  getElementById(id: string): HTMLElement | null {
    const doc = this.getDocument();
    return doc ? doc.getElementById(id) : null;
  }

  getElementsByClassName(className: string): HTMLCollectionOf<Element> | null {
    const doc = this.getDocument();
    return doc ? doc.getElementsByClassName(className) : null;
  }

  getElementsByTagName(tagName: string): HTMLCollectionOf<Element> | null {
    const doc = this.getDocument();
    return doc ? doc.getElementsByTagName(tagName) : null;
  }

  querySelector(selector: string): Element | null {
    const doc = this.getDocument();
    if (doc) {
      try {
        return doc.querySelector(selector);
      } catch (error) {
        console.error('Invalid selector:', selector, error);
        return null;
      }
    }
    return null;
  }

  querySelectorAll(selector: string): NodeListOf<Element> | null {
    const doc = this.getDocument();
    if (doc) {
      try {
        return doc.querySelectorAll(selector);
      } catch (error) {
        console.error('Invalid selector:', selector, error);
        return null;
      }
    }
    return null;
  }

  // Element creation methods
  createElement(tagName: string): HTMLElement | null {
    const doc = this.getDocument();
    if (doc) {
      try {
        return doc.createElement(tagName);
      } catch (error) {
        console.error('Failed to create element:', tagName, error);
        return null;
      }
    }
    return null;
  }

  createTextNode(text: string): Text | null {
    const doc = this.getDocument();
    return doc ? doc.createTextNode(text) : null;
  }

  createDocumentFragment(): DocumentFragment | null {
    const doc = this.getDocument();
    return doc ? doc.createDocumentFragment() : null;
  }

  // Document properties
  getTitle(): string {
    const doc = this.getDocument();
    return doc ? doc.title : '';
  }

  setTitle(title: string): void {
    const doc = this.getDocument();
    if (doc) {
      doc.title = title;
    }
  }

  getHead(): HTMLHeadElement | null {
    const doc = this.getDocument();
    return doc ? doc.head : null;
  }

  getBody(): HTMLBodyElement | null {
    const doc = this.getDocument();
    return doc ? doc.body : null;
  }

  getDocumentElement(): HTMLElement | null {
    const doc = this.getDocument();
    return doc ? doc.documentElement : null;
  }

  getActiveElement(): Element | null {
    const doc = this.getDocument();
    return doc ? doc.activeElement : null;
  }

  // URL and location
  getURL(): string {
    const doc = this.getDocument();
    return doc ? doc.URL : '';
  }

  getBaseURI(): string {
    const doc = this.getDocument();
    return doc ? doc.baseURI : '';
  }

  getDomain(): string {
    const doc = this.getDocument();
    return doc ? doc.domain : '';
  }

  getReferrer(): string {
    const doc = this.getDocument();
    return doc ? doc.referrer : '';
  }

  // Ready state
  getReadyState(): DocumentReadyState | null {
    const doc = this.getDocument();
    return doc ? doc.readyState : null;
  }

  isLoading(): boolean {
    return this.getReadyState() === 'loading';
  }

  isInteractive(): boolean {
    return this.getReadyState() === 'interactive';
  }

  isComplete(): boolean {
    return this.getReadyState() === 'complete';
  }

  // Event handling
  addEventListener(event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void {
    const doc = this.getDocument();
    if (doc) {
      doc.addEventListener(event, handler, options);
    }
  }

  removeEventListener(event: string, handler: EventListener, options?: boolean | EventListenerOptions): void {
    const doc = this.getDocument();
    if (doc) {
      doc.removeEventListener(event, handler, options);
    }
  }

  // Focus management
  hasFocus(): boolean {
    const doc = this.getDocument();
    return doc ? doc.hasFocus() : false;
  }

  // Cookie management
  getCookie(): string {
    const doc = this.getDocument();
    return doc ? doc.cookie : '';
  }

  setCookie(cookie: string): void {
    const doc = this.getDocument();
    if (doc) {
      doc.cookie = cookie;
    }
  }

  // Visibility API
  getVisibilityState(): VisibilityState | null {
    const doc = this.getDocument();
    return doc ? doc.visibilityState : null;
  }

  isHidden(): boolean {
    const doc = this.getDocument();
    return doc ? doc.hidden : true;
  }

  isVisible(): boolean {
    return !this.isHidden();
  }

  // Scroll utilities
  getScrollingElement(): Element | null {
    const doc = this.getDocument();
    return doc ? doc.scrollingElement : null;
  }

  scrollToTop(): void {
    const scrollingElement = this.getScrollingElement();
    if (scrollingElement) {
      scrollingElement.scrollTop = 0;
    }
  }

  scrollToBottom(): void {
    const scrollingElement = this.getScrollingElement();
    if (scrollingElement) {
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }
  }

  getScrollPosition(): { top: number; left: number } {
    const scrollingElement = this.getScrollingElement();
    if (scrollingElement) {
      return {
        top: scrollingElement.scrollTop,
        left: scrollingElement.scrollLeft
      };
    }
    return { top: 0, left: 0 };
  }

  // Meta tag utilities
  getMetaContent(name: string): string | null {
    const metaElement = this.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    return metaElement ? metaElement.content : null;
  }

  setMetaContent(name: string, content: string): void {
    let metaElement = this.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!metaElement) {
      metaElement = this.createElement('meta') as HTMLMetaElement;
      if (metaElement) {
        metaElement.name = name;
        const head = this.getHead();
        if (head) {
          head.appendChild(metaElement);
        }
      }
    }
    
    if (metaElement) {
      metaElement.content = content;
    }
  }

  // Link utilities
  addStylesheet(href: string, id?: string): void {
    const head = this.getHead();
    if (head) {
      const link = this.createElement('link') as HTMLLinkElement;
      if (link) {
        link.rel = 'stylesheet';
        link.href = href;
        if (id) {
          link.id = id;
        }
        head.appendChild(link);
      }
    }
  }

  removeStylesheet(id: string): void {
    const link = this.getElementById(id);
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }

  // Script utilities
  addScript(src: string, id?: string, async: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const head = this.getHead();
      if (!head) {
        reject(new Error('Head element not available'));
        return;
      }

      const script = this.createElement('script') as HTMLScriptElement;
      if (!script) {
        reject(new Error('Failed to create script element'));
        return;
      }

      script.src = src;
      script.async = async;
      if (id) {
        script.id = id;
      }

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

      head.appendChild(script);
    });
  }

  removeScript(id: string): void {
    const script = this.getElementById(id);
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  // Class utilities
  addClassToBody(className: string): void {
    const body = this.getBody();
    if (body) {
      body.classList.add(className);
    }
  }

  removeClassFromBody(className: string): void {
    const body = this.getBody();
    if (body) {
      body.classList.remove(className);
    }
  }

  toggleBodyClass(className: string): void {
    const body = this.getBody();
    if (body) {
      body.classList.toggle(className);
    }
  }

  hasBodyClass(className: string): boolean {
    const body = this.getBody();
    return body ? body.classList.contains(className) : false;
  }

  // Element utilities
  isElementInViewport(element: Element): boolean {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const doc = this.getDocument();
    if (!doc) return false;
    
    const documentElement = this.getDocumentElement();
    if (!documentElement) return false;
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || documentElement.clientWidth)
    );
  }

  scrollElementIntoView(element: Element, options?: ScrollIntoViewOptions): void {
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView(options);
    }
  }

  // Form utilities
  getFormData(formElement: HTMLFormElement): FormData | null {
    if (formElement && typeof FormData !== 'undefined') {
      return new FormData(formElement);
    }
    return null;
  }

  resetForm(formElement: HTMLFormElement): void {
    if (formElement && typeof formElement.reset === 'function') {
      formElement.reset();
    }
  }

  // Print utilities
  print(): void {
    const doc = this.getDocument();
    if (doc && doc.defaultView && typeof doc.defaultView.print === 'function') {
      doc.defaultView.print();
    }
  }
}
```

## Cách sử dụng

### Basic Document Access

```typescript
import { Component, OnInit } from '@angular/core';
import { DocumentService } from '@cci-web/core';

@Component({
  selector: 'app-document-demo',
  template: `
    <div class="document-info">
      <h2>Document Information</h2>
      
      <div *ngIf="isBrowser; else serverMessage">
        <div class="info-section">
          <h3>Document Properties</h3>
          <p>Title: {{ documentTitle }}</p>
          <p>URL: {{ documentUrl }}</p>
          <p>Domain: {{ documentDomain }}</p>
          <p>Ready State: {{ readyState }}</p>
          <p>Visibility State: {{ visibilityState }}</p>
        </div>
        
        <div class="info-section">
          <h3>Document Actions</h3>
          <button (click)="changeTitle()">Change Title</button>
          <button (click)="addStylesheet()">Add Stylesheet</button>
          <button (click)="scrollToTop()">Scroll to Top</button>
          <button (click)="printDocument()">Print Document</button>
        </div>
        
        <div class="info-section">
          <h3>Element Search</h3>
          <input #searchInput type="text" placeholder="Enter element ID">
          <button (click)="findElement(searchInput.value)">Find Element</button>
          <p *ngIf="foundElement">Element found: {{ foundElement.tagName }}</p>
        </div>
      </div>
      
      <ng-template #serverMessage>
        <p>This content is being rendered on the server.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .document-info { padding: 20px; }
    .info-section { margin-bottom: 20px; }
    .info-section button { margin-right: 10px; margin-bottom: 10px; }
    .info-section input { margin-right: 10px; padding: 5px; }
  `]
})
export class DocumentDemoComponent implements OnInit {
  documentTitle = '';
  documentUrl = '';
  documentDomain = '';
  readyState: DocumentReadyState | null = null;
  visibilityState: VisibilityState | null = null;
  foundElement: Element | null = null;

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    if (this.documentService.isBrowser) {
      this.loadDocumentInfo();
    }
  }

  private loadDocumentInfo(): void {
    this.documentTitle = this.documentService.getTitle();
    this.documentUrl = this.documentService.getURL();
    this.documentDomain = this.documentService.getDomain();
    this.readyState = this.documentService.getReadyState();
    this.visibilityState = this.documentService.getVisibilityState();
  }

  get isBrowser(): boolean {
    return this.documentService.isBrowser;
  }

  changeTitle(): void {
    const newTitle = `Updated Title - ${new Date().toLocaleTimeString()}`;
    this.documentService.setTitle(newTitle);
    this.documentTitle = newTitle;
  }

  addStylesheet(): void {
    this.documentService.addStylesheet(
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
      'font-awesome'
    );
  }

  scrollToTop(): void {
    this.documentService.scrollToTop();
  }

  printDocument(): void {
    this.documentService.print();
  }

  findElement(id: string): void {
    if (id.trim()) {
      this.foundElement = this.documentService.getElementById(id.trim());
    }
  }
}
```

### SEO Meta Management Service

```typescript
import { Injectable } from '@angular/core';
import { DocumentService } from '@cci-web/core';

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoMetaService {
  constructor(private documentService: DocumentService) {}

  // Title management
  setTitle(title: string): void {
    this.documentService.setTitle(title);
  }

  getTitle(): string {
    return this.documentService.getTitle();
  }

  // Meta tags management
  setMetaTag(tag: MetaTag): void {
    const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
    let metaElement = this.documentService.querySelector(selector) as HTMLMetaElement;
    
    if (!metaElement) {
      metaElement = this.documentService.createElement('meta') as HTMLMetaElement;
      if (metaElement) {
        if (tag.name) {
          metaElement.name = tag.name;
        } else if (tag.property) {
          metaElement.setAttribute('property', tag.property);
        }
        
        const head = this.documentService.getHead();
        if (head) {
          head.appendChild(metaElement);
        }
      }
    }
    
    if (metaElement) {
      metaElement.content = tag.content;
    }
  }

  getMetaContent(name: string): string | null {
    return this.documentService.getMetaContent(name);
  }

  removeMetaTag(name: string): void {
    const metaElement = this.documentService.querySelector(`meta[name="${name}"]`);
    if (metaElement && metaElement.parentNode) {
      metaElement.parentNode.removeChild(metaElement);
    }
  }

  // Open Graph tags
  setOpenGraphTags(data: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
  }): void {
    if (data.title) {
      this.setMetaTag({ property: 'og:title', content: data.title });
    }
    if (data.description) {
      this.setMetaTag({ property: 'og:description', content: data.description });
    }
    if (data.image) {
      this.setMetaTag({ property: 'og:image', content: data.image });
    }
    if (data.url) {
      this.setMetaTag({ property: 'og:url', content: data.url });
    }
    if (data.type) {
      this.setMetaTag({ property: 'og:type', content: data.type });
    }
    if (data.siteName) {
      this.setMetaTag({ property: 'og:site_name', content: data.siteName });
    }
  }

  // Twitter Card tags
  setTwitterCardTags(data: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
  }): void {
    if (data.card) {
      this.setMetaTag({ name: 'twitter:card', content: data.card });
    }
    if (data.title) {
      this.setMetaTag({ name: 'twitter:title', content: data.title });
    }
    if (data.description) {
      this.setMetaTag({ name: 'twitter:description', content: data.description });
    }
    if (data.image) {
      this.setMetaTag({ name: 'twitter:image', content: data.image });
    }
    if (data.site) {
      this.setMetaTag({ name: 'twitter:site', content: data.site });
    }
    if (data.creator) {
      this.setMetaTag({ name: 'twitter:creator', content: data.creator });
    }
  }

  // Standard meta tags
  setStandardMetaTags(data: {
    description?: string;
    keywords?: string;
    author?: string;
    robots?: string;
    viewport?: string;
  }): void {
    if (data.description) {
      this.setMetaTag({ name: 'description', content: data.description });
    }
    if (data.keywords) {
      this.setMetaTag({ name: 'keywords', content: data.keywords });
    }
    if (data.author) {
      this.setMetaTag({ name: 'author', content: data.author });
    }
    if (data.robots) {
      this.setMetaTag({ name: 'robots', content: data.robots });
    }
    if (data.viewport) {
      this.setMetaTag({ name: 'viewport', content: data.viewport });
    }
  }

  // Canonical URL
  setCanonicalUrl(url: string): void {
    let linkElement = this.documentService.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!linkElement) {
      linkElement = this.documentService.createElement('link') as HTMLLinkElement;
      if (linkElement) {
        linkElement.rel = 'canonical';
        const head = this.documentService.getHead();
        if (head) {
          head.appendChild(linkElement);
        }
      }
    }
    
    if (linkElement) {
      linkElement.href = url;
    }
  }

  // Complete SEO setup
  setupPageSeo(data: {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    author?: string;
    type?: string;
    siteName?: string;
  }): void {
    // Set title
    this.setTitle(data.title);
    
    // Set standard meta tags
    this.setStandardMetaTags({
      description: data.description,
      keywords: data.keywords,
      author: data.author
    });
    
    // Set Open Graph tags
    this.setOpenGraphTags({
      title: data.title,
      description: data.description,
      image: data.image,
      url: data.url,
      type: data.type || 'website',
      siteName: data.siteName
    });
    
    // Set Twitter Card tags
    this.setTwitterCardTags({
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      image: data.image
    });
    
    // Set canonical URL
    if (data.url) {
      this.setCanonicalUrl(data.url);
    }
  }
}
```

### Dynamic Content Management Service

```typescript
import { Injectable } from '@angular/core';
import { DocumentService } from '@cci-web/core';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DynamicContentService {
  constructor(private documentService: DocumentService) {}

  // Dynamic script loading
  loadScript(src: string, id?: string): Promise<void> {
    return this.documentService.addScript(src, id);
  }

  // Dynamic stylesheet loading
  loadStylesheet(href: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const head = this.documentService.getHead();
      if (!head) {
        reject(new Error('Head element not available'));
        return;
      }

      const link = this.documentService.createElement('link') as HTMLLinkElement;
      if (!link) {
        reject(new Error('Failed to create link element'));
        return;
      }

      link.rel = 'stylesheet';
      link.href = href;
      if (id) {
        link.id = id;
      }

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

      head.appendChild(link);
    });
  }

  // Dynamic content injection
  injectHtml(selector: string, html: string, position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend' = 'beforeend'): boolean {
    const element = this.documentService.querySelector(selector);
    if (element) {
      element.insertAdjacentHTML(position, html);
      return true;
    }
    return false;
  }

  // Element creation and insertion
  createAndInsertElement(tagName: string, attributes: { [key: string]: string } = {}, parentSelector?: string): HTMLElement | null {
    const element = this.documentService.createElement(tagName);
    if (!element) return null;

    // Set attributes
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });

    // Insert into parent or body
    let parent: Element | null = null;
    if (parentSelector) {
      parent = this.documentService.querySelector(parentSelector);
    } else {
      parent = this.documentService.getBody();
    }

    if (parent) {
      parent.appendChild(element);
      return element;
    }

    return null;
  }

  // Element removal
  removeElement(selector: string): boolean {
    const element = this.documentService.querySelector(selector);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
      return true;
    }
    return false;
  }

  // Class management
  addClassToElements(selector: string, className: string): number {
    const elements = this.documentService.querySelectorAll(selector);
    if (elements) {
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.classList.add(className);
        }
      });
      return elements.length;
    }
    return 0;
  }

  removeClassFromElements(selector: string, className: string): number {
    const elements = this.documentService.querySelectorAll(selector);
    if (elements) {
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.classList.remove(className);
        }
      });
      return elements.length;
    }
    return 0;
  }

  // Event delegation
  delegateEvent(eventType: string, selector: string): Observable<Event> {
    const doc = this.documentService.getDocument();
    if (doc) {
      return fromEvent(doc, eventType).pipe(
        filter(event => {
          const target = event.target as Element;
          return target && target.matches && target.matches(selector);
        })
      );
    }
    return EMPTY;
  }

  // Intersection Observer wrapper
  observeElementVisibility(selector: string, options?: IntersectionObserverInit): Observable<IntersectionObserverEntry[]> {
    return new Observable(observer => {
      const element = this.documentService.querySelector(selector);
      if (!element || typeof IntersectionObserver === 'undefined') {
        observer.complete();
        return;
      }

      const intersectionObserver = new IntersectionObserver(
        entries => observer.next(entries),
        options
      );

      intersectionObserver.observe(element);

      return () => {
        intersectionObserver.disconnect();
      };
    });
  }

  // Mutation Observer wrapper
  observeElementChanges(selector: string, options?: MutationObserverInit): Observable<MutationRecord[]> {
    return new Observable(observer => {
      const element = this.documentService.querySelector(selector);
      if (!element || typeof MutationObserver === 'undefined') {
        observer.complete();
        return;
      }

      const mutationObserver = new MutationObserver(
        mutations => observer.next(mutations)
      );

      mutationObserver.observe(element, options || {
        childList: true,
        subtree: true,
        attributes: true
      });

      return () => {
        mutationObserver.disconnect();
      };
    });
  }

  // Document ready state
  onDocumentReady(): Observable<void> {
    return new Observable(observer => {
      if (this.documentService.isComplete()) {
        observer.next();
        observer.complete();
        return;
      }

      const handleReadyStateChange = () => {
        if (this.documentService.isComplete()) {
          observer.next();
          observer.complete();
          this.documentService.removeEventListener('readystatechange', handleReadyStateChange);
        }
      };

      this.documentService.addEventListener('readystatechange', handleReadyStateChange);

      return () => {
        this.documentService.removeEventListener('readystatechange', handleReadyStateChange);
      };
    });
  }

  // Visibility change
  onVisibilityChange(): Observable<boolean> {
    const doc = this.documentService.getDocument();
    if (doc) {
      return fromEvent(doc, 'visibilitychange').pipe(
        map(() => this.documentService.isVisible())
      );
    }
    return EMPTY;
  }
}
```

## Best Practices

### 1. Always Check Document Availability

```typescript
// ✅ Good: Check document availability
class SafeDocumentService {
  constructor(private documentService: DocumentService) {}

  manipulateDOM(): void {
    const doc = this.documentService.getDocument();
    if (doc) {
      // Safe to manipulate DOM
      const element = this.documentService.getElementById('myElement');
      if (element) {
        element.textContent = 'Updated content';
      }
    } else {
      // Handle SSR case
      console.log('Document not available in SSR');
    }
  }
}

// ❌ Bad: Direct document access
class UnsafeDocumentService {
  manipulateDOM(): void {
    // This will fail in SSR
    const element = document.getElementById('myElement');
    element!.textContent = 'Updated content';
  }
}
```

### 2. Error Handling for Selectors

```typescript
// ✅ Good: Safe selector usage
class SafeSelectorService {
  constructor(private documentService: DocumentService) {}

  findElements(selector: string): Element[] {
    try {
      const elements = this.documentService.querySelectorAll(selector);
      return elements ? Array.from(elements) : [];
    } catch (error) {
      console.error('Invalid selector:', selector, error);
      return [];
    }
  }
}
```

### 3. Event Cleanup

```typescript
// ✅ Good: Proper event cleanup
@Component({
  selector: 'app-document-events'
})
export class DocumentEventsComponent implements OnInit, OnDestroy {
  private clickHandler = this.onClick.bind(this);

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.documentService.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy() {
    this.documentService.removeEventListener('click', this.clickHandler);
  }

  private onClick(event: Event): void {
    // Handle click
  }
}
```

### 4. Dynamic Content Loading

```typescript
// ✅ Good: Async resource loading with error handling
class ResourceLoaderService {
  constructor(private documentService: DocumentService) {}

  async loadResources(): Promise<void> {
    try {
      await Promise.all([
        this.documentService.addScript('/assets/js/vendor.js', 'vendor-script'),
        this.loadStylesheet('/assets/css/theme.css', 'theme-styles')
      ]);
      console.log('All resources loaded successfully');
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  }

  private loadStylesheet(href: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const head = this.documentService.getHead();
      if (!head) {
        reject(new Error('Head not available'));
        return;
      }

      const link = this.documentService.createElement('link') as HTMLLinkElement;
      if (!link) {
        reject(new Error('Failed to create link element'));
        return;
      }

      link.rel = 'stylesheet';
      link.href = href;
      link.id = id;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load: ${href}`));

      head.appendChild(link);
    });
  }
}
```

## Performance Considerations

### 1. Singleton Pattern
- Service được provide ở root level
- Single instance across entire application
- Document object được inject từ Angular DI

### 2. Efficient DOM Queries
- Cache frequently accessed elements
- Use specific selectors để tránh unnecessary traversal
- Batch DOM operations khi có thể

### 3. Event Optimization
- Sử dụng event delegation cho dynamic content
- Proper cleanup để tránh memory leaks
- Throttle/debounce high-frequency events

## Troubleshooting

### Common Issues

**1. Document Not Available in SSR**
```typescript
// Check if running in browser
if (this.documentService.isBrowser) {
  // Browser-specific DOM operations
} else {
  // SSR fallback
}
```

**2. Invalid Selectors**
```typescript
// Always wrap selector operations in try-catch
try {
  const elements = this.documentService.querySelectorAll(selector);
  // Process elements
} catch (error) {
  console.error('Invalid selector:', selector, error);
}
```

**3. Element Not Found**
```typescript
// Always check if element exists
const element = this.documentService.getElementById('myElement');
if (element) {
  // Safe to manipulate element
} else {
  console.warn('Element not found: myElement');
}
```

## Dependencies

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection và DOCUMENT token

## Related Services

- **WindowService**: Window object access
- **PlatformService**: Platform detection
- **SeoService**: SEO meta management
- **DynamicContentService**: Dynamic content loading