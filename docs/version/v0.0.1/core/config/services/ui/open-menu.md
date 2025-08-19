# Open Menu Service - Quản lý trạng thái menu

## Giới thiệu

Open Menu Service cung cấp hệ thống quản lý trạng thái menu toàn cục cho ứng dụng Angular. Service này cho phép kiểm soát việc mở/đóng menu từ bất kỳ đâu trong ứng dụng, đặc biệt hữu ích cho responsive navigation và mobile menu systems.

## Tính năng chính

- **Global Menu State**: Quản lý trạng thái menu toàn cục
- **Observable Streams**: Cung cấp observable để components subscribe
- **Toggle Functionality**: Hỗ trợ toggle menu state
- **Multiple Menu Support**: Quản lý nhiều menu khác nhau
- **Memory Management**: Extends UnsubscribeOnDestroyAdapter
- **Type Safety**: Full TypeScript support
- **Event Integration**: Tích hợp với DOM events để auto-close

## Types và Interfaces

### MenuState Interface

```typescript
export interface MenuState {
  [menuId: string]: boolean;
}

export interface MenuConfig {
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  closeOnRouteChange?: boolean;
  autoFocus?: boolean;
}

export interface MenuEvent {
  menuId: string;
  isOpen: boolean;
  timestamp: Date;
  trigger?: 'toggle' | 'open' | 'close' | 'outside-click' | 'escape' | 'route-change';
}
```

### Default Menu IDs

```typescript
export const DEFAULT_MENU_IDS = {
  MAIN_NAVIGATION: 'main-navigation',
  MOBILE_MENU: 'mobile-menu',
  USER_MENU: 'user-menu',
  SIDEBAR: 'sidebar',
  CONTEXT_MENU: 'context-menu'
} as const;
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `menuState$` | `Observable<MenuState>` | Observable stream của tất cả menu states |
| `menuEvents$` | `Observable<MenuEvent>` | Observable stream của menu events |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `isOpen()` | `isOpen(menuId: string): boolean` | Kiểm tra menu có đang mở |
| `isOpen$()` | `isOpen$(menuId: string): Observable<boolean>` | Observable cho menu state |
| `open()` | `open(menuId: string): void` | Mở menu |
| `close()` | `close(menuId: string): void` | Đóng menu |
| `toggle()` | `toggle(menuId: string): void` | Toggle menu state |
| `closeAll()` | `closeAll(): void` | Đóng tất cả menu |
| `setConfig()` | `setConfig(menuId: string, config: MenuConfig): void` | Cấu hình menu behavior |

## Implementation Details

### Service Implementation

```typescript
import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { UnsubscribeOnDestroyAdapter } from '../utils/unsubscribe-on-destroy.adapter';

@Injectable({
  providedIn: 'root'
})
export class OpenMenuService extends UnsubscribeOnDestroyAdapter {
  private _menuState = new BehaviorSubject<MenuState>({});
  private _menuEvents = new BehaviorSubject<MenuEvent | null>(null);
  private _menuConfigs = new Map<string, MenuConfig>();

  public readonly menuState$ = this._menuState.asObservable();
  public readonly menuEvents$ = this._menuEvents.asObservable().pipe(
    filter(event => event !== null)
  ) as Observable<MenuEvent>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {
    super();
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Listen for outside clicks
    this.subs.add(
      fromEvent(this.document, 'click').subscribe((event: Event) => {
        this.handleOutsideClick(event);
      })
    );

    // Listen for escape key
    this.subs.add(
      fromEvent(this.document, 'keydown').subscribe((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.handleEscapeKey();
        }
      })
    );

    // Listen for route changes
    this.subs.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.handleRouteChange();
      })
    );
  }

  isOpen(menuId: string): boolean {
    return this._menuState.value[menuId] || false;
  }

  isOpen$(menuId: string): Observable<boolean> {
    return this.menuState$.pipe(
      map(state => state[menuId] || false),
      distinctUntilChanged()
    );
  }

  open(menuId: string): void {
    this.updateMenuState(menuId, true, 'open');
  }

  close(menuId: string): void {
    this.updateMenuState(menuId, false, 'close');
  }

  toggle(menuId: string): void {
    const currentState = this.isOpen(menuId);
    this.updateMenuState(menuId, !currentState, 'toggle');
  }

  closeAll(): void {
    const currentState = this._menuState.value;
    const newState: MenuState = {};
    
    Object.keys(currentState).forEach(menuId => {
      newState[menuId] = false;
    });

    this._menuState.next(newState);
    
    // Emit events for all closed menus
    Object.keys(currentState).forEach(menuId => {
      if (currentState[menuId]) {
        this.emitMenuEvent(menuId, false, 'close');
      }
    });
  }

  setConfig(menuId: string, config: MenuConfig): void {
    this._menuConfigs.set(menuId, config);
  }

  private updateMenuState(menuId: string, isOpen: boolean, trigger: MenuEvent['trigger']): void {
    const currentState = this._menuState.value;
    const newState = { ...currentState, [menuId]: isOpen };
    
    this._menuState.next(newState);
    this.emitMenuEvent(menuId, isOpen, trigger);

    // Auto-focus if configured
    if (isOpen) {
      const config = this._menuConfigs.get(menuId);
      if (config?.autoFocus) {
        this.focusMenu(menuId);
      }
    }
  }

  private emitMenuEvent(menuId: string, isOpen: boolean, trigger?: MenuEvent['trigger']): void {
    const event: MenuEvent = {
      menuId,
      isOpen,
      timestamp: new Date(),
      trigger
    };
    
    this._menuEvents.next(event);
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as Element;
    const currentState = this._menuState.value;
    
    Object.keys(currentState).forEach(menuId => {
      if (currentState[menuId]) {
        const config = this._menuConfigs.get(menuId);
        if (config?.closeOnOutsideClick !== false) {
          const menuElement = this.document.querySelector(`[data-menu-id="${menuId}"]`);
          const triggerElement = this.document.querySelector(`[data-menu-trigger="${menuId}"]`);
          
          if (menuElement && !menuElement.contains(target) && 
              triggerElement && !triggerElement.contains(target)) {
            this.updateMenuState(menuId, false, 'outside-click');
          }
        }
      }
    });
  }

  private handleEscapeKey(): void {
    const currentState = this._menuState.value;
    
    Object.keys(currentState).forEach(menuId => {
      if (currentState[menuId]) {
        const config = this._menuConfigs.get(menuId);
        if (config?.closeOnEscape !== false) {
          this.updateMenuState(menuId, false, 'escape');
        }
      }
    });
  }

  private handleRouteChange(): void {
    const currentState = this._menuState.value;
    
    Object.keys(currentState).forEach(menuId => {
      if (currentState[menuId]) {
        const config = this._menuConfigs.get(menuId);
        if (config?.closeOnRouteChange !== false) {
          this.updateMenuState(menuId, false, 'route-change');
        }
      }
    });
  }

  private focusMenu(menuId: string): void {
    setTimeout(() => {
      const menuElement = this.document.querySelector(`[data-menu-id="${menuId}"]`) as HTMLElement;
      if (menuElement) {
        const focusableElement = menuElement.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (focusableElement) {
          focusableElement.focus();
        } else {
          menuElement.focus();
        }
      }
    }, 0);
  }
}
```

## Cách sử dụng

### Basic Usage trong Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { OpenMenuService, DEFAULT_MENU_IDS } from '@cci-web/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navigation',
  template: `
    <nav class="navigation">
      <!-- Desktop Navigation -->
      <div class="desktop-nav" *ngIf="!isMobile">
        <ul class="nav-list">
          <li><a routerLink="/home">Home</a></li>
          <li><a routerLink="/products">Products</a></li>
          <li><a routerLink="/about">About</a></li>
          <li><a routerLink="/contact">Contact</a></li>
        </ul>
        
        <!-- User Menu Trigger -->
        <button class="user-menu-trigger"
                [data-menu-trigger]="userMenuId"
                (click)="toggleUserMenu()"
                [attr.aria-expanded]="isUserMenuOpen">
          <mat-icon>account_circle</mat-icon>
          <span>User Menu</span>
          <mat-icon>{{ isUserMenuOpen ? 'expand_less' : 'expand_more' }}</mat-icon>
        </button>
        
        <!-- User Menu -->
        <div class="user-menu"
             [data-menu-id]="userMenuId"
             [class.open]="isUserMenuOpen"
             [@slideInOut]>
          <ul class="user-menu-list">
            <li><a routerLink="/profile">Profile</a></li>
            <li><a routerLink="/settings">Settings</a></li>
            <li><button (click)="logout()">Logout</button></li>
          </ul>
        </div>
      </div>
      
      <!-- Mobile Navigation -->
      <div class="mobile-nav" *ngIf="isMobile">
        <!-- Mobile Menu Trigger -->
        <button class="mobile-menu-trigger"
                [data-menu-trigger]="mobileMenuId"
                (click)="toggleMobileMenu()"
                [attr.aria-expanded]="isMobileMenuOpen">
          <mat-icon>{{ isMobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
        
        <!-- Mobile Menu Overlay -->
        <div class="mobile-menu-overlay"
             *ngIf="isMobileMenuOpen"
             (click)="closeMobileMenu()">
        </div>
        
        <!-- Mobile Menu -->
        <div class="mobile-menu"
             [data-menu-id]="mobileMenuId"
             [class.open]="isMobileMenuOpen"
             [@slideInFromLeft]>
          <div class="mobile-menu-header">
            <h3>Navigation</h3>
            <button (click)="closeMobileMenu()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <ul class="mobile-menu-list">
            <li><a routerLink="/home" (click)="closeMobileMenu()">Home</a></li>
            <li><a routerLink="/products" (click)="closeMobileMenu()">Products</a></li>
            <li><a routerLink="/about" (click)="closeMobileMenu()">About</a></li>
            <li><a routerLink="/contact" (click)="closeMobileMenu()">Contact</a></li>
            <li class="divider"></li>
            <li><a routerLink="/profile" (click)="closeMobileMenu()">Profile</a></li>
            <li><a routerLink="/settings" (click)="closeMobileMenu()">Settings</a></li>
            <li><button (click)="logout()">Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navigation {
      position: relative;
    }
    
    .desktop-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 2rem;
    }
    
    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .user-menu-trigger:hover {
      background-color: #f5f5f5;
    }
    
    .user-menu {
      position: absolute;
      top: 100%;
      right: 2rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1000;
    }
    
    .user-menu.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .user-menu-list {
      list-style: none;
      margin: 0;
      padding: 0.5rem 0;
    }
    
    .user-menu-list li {
      padding: 0;
    }
    
    .user-menu-list a,
    .user-menu-list button {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #333;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .user-menu-list a:hover,
    .user-menu-list button:hover {
      background-color: #f5f5f5;
    }
    
    .mobile-nav {
      position: relative;
    }
    
    .mobile-menu-trigger {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1001;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    
    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
    
    .mobile-menu {
      position: fixed;
      top: 0;
      left: -100%;
      width: 80%;
      max-width: 320px;
      height: 100vh;
      background: white;
      z-index: 1000;
      transition: left 0.3s ease;
      overflow-y: auto;
    }
    
    .mobile-menu.open {
      left: 0;
    }
    
    .mobile-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .mobile-menu-list {
      list-style: none;
      margin: 0;
      padding: 1rem 0;
    }
    
    .mobile-menu-list li {
      padding: 0;
    }
    
    .mobile-menu-list .divider {
      height: 1px;
      background: #eee;
      margin: 1rem 0;
    }
    
    .mobile-menu-list a,
    .mobile-menu-list button {
      display: block;
      width: 100%;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: #333;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .mobile-menu-list a:hover,
    .mobile-menu-list button:hover {
      background-color: #f5f5f5;
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('slideInFromLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class NavigationComponent implements OnInit, OnDestroy {
  userMenuId = DEFAULT_MENU_IDS.USER_MENU;
  mobileMenuId = DEFAULT_MENU_IDS.MOBILE_MENU;
  
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  isMobile = false; // This would come from ResponsiveService
  
  private destroy$ = new Subject<void>();

  constructor(private openMenuService: OpenMenuService) {}

  ngOnInit() {
    // Configure menus
    this.openMenuService.setConfig(this.userMenuId, {
      closeOnOutsideClick: true,
      closeOnEscape: true,
      closeOnRouteChange: true
    });
    
    this.openMenuService.setConfig(this.mobileMenuId, {
      closeOnOutsideClick: false, // Handled by overlay
      closeOnEscape: true,
      closeOnRouteChange: true,
      autoFocus: true
    });

    // Subscribe to menu states
    this.openMenuService.isOpen$(this.userMenuId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isUserMenuOpen = isOpen;
      });
    
    this.openMenuService.isOpen$(this.mobileMenuId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isMobileMenuOpen = isOpen;
      });

    // Listen to menu events
    this.openMenuService.menuEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('Menu event:', event);
      });
  }

  toggleUserMenu() {
    this.openMenuService.toggle(this.userMenuId);
  }

  toggleMobileMenu() {
    this.openMenuService.toggle(this.mobileMenuId);
  }

  closeMobileMenu() {
    this.openMenuService.close(this.mobileMenuId);
  }

  logout() {
    // Close all menus before logout
    this.openMenuService.closeAll();
    // Implement logout logic
    console.log('Logging out...');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Context Menu Implementation

```typescript
@Component({
  selector: 'app-context-menu-demo',
  template: `
    <div class="demo-area"
         (contextmenu)="showContextMenu($event)">
      <p>Right-click anywhere in this area to show context menu</p>
      
      <div class="items">
        <div *ngFor="let item of items; let i = index"
             class="item"
             (contextmenu)="showItemContextMenu($event, item, i)">
          {{ item.name }}
        </div>
      </div>
      
      <!-- Context Menu -->
      <div class="context-menu"
           [data-menu-id]="contextMenuId"
           [class.open]="isContextMenuOpen"
           [style.left.px]="contextMenuPosition.x"
           [style.top.px]="contextMenuPosition.y"
           [@fadeInOut]>
        <ul class="context-menu-list">
          <li *ngFor="let action of contextMenuActions">
            <button (click)="executeContextAction(action)">
              <mat-icon>{{ action.icon }}</mat-icon>
              <span>{{ action.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .demo-area {
      padding: 2rem;
      min-height: 400px;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      position: relative;
    }
    
    .items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .item {
      padding: 1rem;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .item:hover {
      transform: translateY(-2px);
    }
    
    .context-menu {
      position: fixed;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.95);
      transition: all 0.15s ease;
      z-index: 10000;
    }
    
    .context-menu.open {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }
    
    .context-menu-list {
      list-style: none;
      margin: 0;
      padding: 0.5rem 0;
    }
    
    .context-menu-list button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .context-menu-list button:hover {
      background-color: #f5f5f5;
    }
    
    .context-menu-list mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class ContextMenuDemoComponent implements OnInit, OnDestroy {
  contextMenuId = DEFAULT_MENU_IDS.CONTEXT_MENU;
  isContextMenuOpen = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuActions: any[] = [];
  selectedItem: any = null;
  
  items = [
    { name: 'Item 1', type: 'document' },
    { name: 'Item 2', type: 'image' },
    { name: 'Item 3', type: 'video' },
    { name: 'Item 4', type: 'document' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(private openMenuService: OpenMenuService) {}

  ngOnInit() {
    // Configure context menu
    this.openMenuService.setConfig(this.contextMenuId, {
      closeOnOutsideClick: true,
      closeOnEscape: true,
      closeOnRouteChange: true
    });

    // Subscribe to context menu state
    this.openMenuService.isOpen$(this.contextMenuId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isContextMenuOpen = isOpen;
      });
  }

  showContextMenu(event: MouseEvent) {
    event.preventDefault();
    
    this.contextMenuPosition = {
      x: event.clientX,
      y: event.clientY
    };
    
    this.contextMenuActions = [
      { label: 'New Item', icon: 'add', action: 'new' },
      { label: 'Paste', icon: 'content_paste', action: 'paste' },
      { label: 'Refresh', icon: 'refresh', action: 'refresh' }
    ];
    
    this.selectedItem = null;
    this.openMenuService.open(this.contextMenuId);
  }

  showItemContextMenu(event: MouseEvent, item: any, index: number) {
    event.preventDefault();
    event.stopPropagation();
    
    this.contextMenuPosition = {
      x: event.clientX,
      y: event.clientY
    };
    
    this.contextMenuActions = [
      { label: 'Open', icon: 'open_in_new', action: 'open' },
      { label: 'Edit', icon: 'edit', action: 'edit' },
      { label: 'Copy', icon: 'content_copy', action: 'copy' },
      { label: 'Delete', icon: 'delete', action: 'delete' }
    ];
    
    this.selectedItem = { item, index };
    this.openMenuService.open(this.contextMenuId);
  }

  executeContextAction(action: any) {
    console.log('Context action:', action.action, this.selectedItem);
    
    switch (action.action) {
      case 'new':
        this.items.push({ name: `New Item ${this.items.length + 1}`, type: 'document' });
        break;
      case 'delete':
        if (this.selectedItem) {
          this.items.splice(this.selectedItem.index, 1);
        }
        break;
      case 'edit':
        if (this.selectedItem) {
          // Open edit dialog
          console.log('Edit item:', this.selectedItem.item);
        }
        break;
      // Handle other actions...
    }
    
    this.openMenuService.close(this.contextMenuId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Dropdown Menu Component

```typescript
@Component({
  selector: 'app-dropdown-menu',
  template: `
    <div class="dropdown" [class.open]="isOpen">
      <!-- Trigger -->
      <button class="dropdown-trigger"
              [data-menu-trigger]="menuId"
              (click)="toggle()"
              [attr.aria-expanded]="isOpen"
              [attr.aria-haspopup]="true">
        <span>{{ selectedOption?.label || placeholder }}</span>
        <mat-icon class="dropdown-arrow" [class.rotated]="isOpen">
          expand_more
        </mat-icon>
      </button>
      
      <!-- Menu -->
      <div class="dropdown-menu"
           [data-menu-id]="menuId"
           [class.open]="isOpen"
           [@slideInOut]>
        <div class="dropdown-search" *ngIf="searchable">
          <mat-form-field appearance="outline">
            <input matInput
                   placeholder="Search..."
                   [(ngModel)]="searchTerm"
                   (input)="onSearch()">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>
        
        <ul class="dropdown-list">
          <li *ngFor="let option of filteredOptions; trackBy: trackByFn"
              class="dropdown-item"
              [class.selected]="option === selectedOption"
              (click)="selectOption(option)">
            <mat-icon *ngIf="option.icon" class="option-icon">
              {{ option.icon }}
            </mat-icon>
            <span class="option-label">{{ option.label }}</span>
            <mat-icon *ngIf="option === selectedOption" class="check-icon">
              check
            </mat-icon>
          </li>
          
          <li *ngIf="filteredOptions.length === 0" class="no-options">
            No options found
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .dropdown {
      position: relative;
      display: inline-block;
      min-width: 200px;
    }
    
    .dropdown-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem 1rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .dropdown-trigger:hover {
      border-color: #2196f3;
    }
    
    .dropdown.open .dropdown-trigger {
      border-color: #2196f3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    }
    
    .dropdown-arrow {
      transition: transform 0.2s;
    }
    
    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 300px;
      overflow-y: auto;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1000;
    }
    
    .dropdown-menu.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .dropdown-search {
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .dropdown-search mat-form-field {
      width: 100%;
    }
    
    .dropdown-list {
      list-style: none;
      margin: 0;
      padding: 0.5rem 0;
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .dropdown-item:hover {
      background-color: #f5f5f5;
    }
    
    .dropdown-item.selected {
      background-color: #e3f2fd;
      color: #2196f3;
    }
    
    .option-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .option-label {
      flex: 1;
    }
    
    .check-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #2196f3;
    }
    
    .no-options {
      padding: 1rem;
      text-align: center;
      color: #666;
      font-style: italic;
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class DropdownMenuComponent implements OnInit, OnDestroy {
  @Input() options: any[] = [];
  @Input() placeholder = 'Select an option';
  @Input() searchable = false;
  @Input() menuId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  @Output() selectionChange = new EventEmitter<any>();
  
  selectedOption: any = null;
  isOpen = false;
  searchTerm = '';
  filteredOptions: any[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(private openMenuService: OpenMenuService) {}

  ngOnInit() {
    this.filteredOptions = [...this.options];
    
    // Configure dropdown menu
    this.openMenuService.setConfig(this.menuId, {
      closeOnOutsideClick: true,
      closeOnEscape: true,
      closeOnRouteChange: false // Keep open on route change for dropdowns
    });

    // Subscribe to menu state
    this.openMenuService.isOpen$(this.menuId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
        if (!isOpen) {
          this.searchTerm = '';
          this.filteredOptions = [...this.options];
        }
      });
  }

  toggle() {
    this.openMenuService.toggle(this.menuId);
  }

  selectOption(option: any) {
    this.selectedOption = option;
    this.selectionChange.emit(option);
    this.openMenuService.close(this.menuId);
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  trackByFn(index: number, option: any): any {
    return option.value || option.id || index;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Advanced Usage Patterns

### Menu Manager Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class MenuManagerService {
  constructor(private openMenuService: OpenMenuService) {}

  // Close all menus except specified ones
  closeAllExcept(excludeMenuIds: string[]) {
    const currentState = this.openMenuService.menuState$.pipe(take(1));
    currentState.subscribe(state => {
      Object.keys(state).forEach(menuId => {
        if (state[menuId] && !excludeMenuIds.includes(menuId)) {
          this.openMenuService.close(menuId);
        }
      });
    });
  }

  // Open menu with exclusive behavior
  openExclusive(menuId: string) {
    this.openMenuService.closeAll();
    this.openMenuService.open(menuId);
  }

  // Check if any menu is open
  isAnyMenuOpen(): Observable<boolean> {
    return this.openMenuService.menuState$.pipe(
      map(state => Object.values(state).some(isOpen => isOpen))
    );
  }

  // Get list of open menus
  getOpenMenus(): Observable<string[]> {
    return this.openMenuService.menuState$.pipe(
      map(state => Object.keys(state).filter(menuId => state[menuId]))
    );
  }
}
```

### Keyboard Navigation Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class MenuKeyboardService {
  constructor(
    private openMenuService: OpenMenuService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializeKeyboardHandlers();
  }

  private initializeKeyboardHandlers() {
    fromEvent(this.document, 'keydown').subscribe((event: KeyboardEvent) => {
      this.handleKeyboardNavigation(event);
    });
  }

  private handleKeyboardNavigation(event: KeyboardEvent) {
    const activeElement = this.document.activeElement as HTMLElement;
    const menuElement = activeElement?.closest('[data-menu-id]') as HTMLElement;
    
    if (!menuElement) return;
    
    const menuId = menuElement.getAttribute('data-menu-id');
    if (!menuId || !this.openMenuService.isOpen(menuId)) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(menuElement);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(menuElement);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem(menuElement);
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem(menuElement);
        break;
    }
  }

  private focusNextItem(menuElement: HTMLElement) {
    const focusableItems = this.getFocusableItems(menuElement);
    const currentIndex = focusableItems.indexOf(this.document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableItems.length;
    focusableItems[nextIndex]?.focus();
  }

  private focusPreviousItem(menuElement: HTMLElement) {
    const focusableItems = this.getFocusableItems(menuElement);
    const currentIndex = focusableItems.indexOf(this.document.activeElement as HTMLElement);
    const prevIndex = currentIndex <= 0 ? focusableItems.length - 1 : currentIndex - 1;
    focusableItems[prevIndex]?.focus();
  }

  private focusFirstItem(menuElement: HTMLElement) {
    const focusableItems = this.getFocusableItems(menuElement);
    focusableItems[0]?.focus();
  }

  private focusLastItem(menuElement: HTMLElement) {
    const focusableItems = this.getFocusableItems(menuElement);
    focusableItems[focusableItems.length - 1]?.focus();
  }

  private getFocusableItems(menuElement: HTMLElement): HTMLElement[] {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(menuElement.querySelectorAll(selector)) as HTMLElement[];
  }
}
```

## Best Practices

### 1. Use Data Attributes for Menu Identification

```typescript
// ✅ Good - Use data attributes
<button [data-menu-trigger]="menuId" (click)="toggle()">
  Menu Trigger
</button>
<div [data-menu-id]="menuId" [class.open]="isOpen">
  Menu Content
</div>
```

### 2. Configure Menu Behavior Appropriately

```typescript
// ✅ Good - Configure based on menu type
this.openMenuService.setConfig('user-menu', {
  closeOnOutsideClick: true,
  closeOnEscape: true,
  closeOnRouteChange: true
});

this.openMenuService.setConfig('modal-menu', {
  closeOnOutsideClick: false,
  closeOnEscape: true,
  closeOnRouteChange: false
});
```

### 3. Handle Accessibility

```typescript
// ✅ Good - Proper ARIA attributes
<button [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="true"
        [attr.aria-controls]="menuId">
  Menu
</button>
```

### 4. Proper Cleanup

```typescript
// ✅ Good - Always cleanup subscriptions
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Performance Considerations

- **Event Delegation**: Service sử dụng global event listeners
- **Memory Management**: Tự động cleanup subscriptions
- **Efficient State Updates**: Chỉ emit khi state thực sự thay đổi
- **DOM Queries**: Cache DOM elements khi có thể

## Troubleshooting

### Common Issues

1. **Menu không đóng khi click outside**
   - Kiểm tra data attributes đã được set đúng
   - Verify menu configuration

2. **Multiple menus conflict**
   - Sử dụng unique menu IDs
   - Configure appropriate close behaviors

3. **Focus management issues**
   - Implement proper tabindex management
   - Use autoFocus configuration

## Dependencies

- `@angular/router` - Route change detection
- `rxjs` - Observable streams và operators
- `UnsubscribeOnDestroyAdapter` - Memory management
- `DOCUMENT` token - DOM access

## Tóm tắt

Open Menu Service cung cấp hệ thống quản lý menu toàn cục mạnh mẽ và linh hoạt cho ứng dụng Angular. Với hỗ trợ multiple menus, event handling, keyboard navigation và accessibility features, service này giúp developers dễ dàng tạo ra các menu systems phức tạp với user experience tối ưu.