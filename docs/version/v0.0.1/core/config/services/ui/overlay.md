# Overlay Service - Quản lý Overlay Components

## Giới thiệu

Overlay Service cung cấp hệ thống quản lý overlay components toàn cục cho ứng dụng Angular. Service này cho phép tạo và quản lý các overlay như modals, tooltips, popups, dropdowns và các UI elements khác cần hiển thị trên top của content chính.

## Tính năng chính

- **Dynamic Overlay Creation**: Tạo overlay động từ components hoặc templates
- **Position Management**: Quản lý vị trí overlay với nhiều strategies
- **Z-Index Management**: Tự động quản lý z-index stacking
- **Backdrop Support**: Hỗ trợ backdrop với custom behaviors
- **Scroll Strategy**: Các chiến lược xử lý scroll events
- **Animation Integration**: Tích hợp với Angular Animations
- **Memory Management**: Tự động cleanup resources
- **Type Safety**: Full TypeScript support
- **Accessibility**: ARIA support và focus management

## Types và Interfaces

### Overlay Configuration

```typescript
export interface OverlayConfig {
  // Position strategy
  positionStrategy?: PositionStrategy;
  
  // Scroll strategy
  scrollStrategy?: ScrollStrategy;
  
  // Backdrop configuration
  hasBackdrop?: boolean;
  backdropClass?: string | string[];
  
  // Panel configuration
  panelClass?: string | string[];
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  
  // Positioning
  direction?: Direction;
  
  // Disposal
  disposeOnNavigation?: boolean;
}

export interface OverlayRef {
  id: string;
  attach(portal: ComponentPortal<any> | TemplatePortal): ComponentRef<any> | EmbeddedViewRef<any>;
  detach(): any;
  dispose(): void;
  hasAttached(): boolean;
  backdropClick(): Observable<MouseEvent>;
  keydownEvents(): Observable<KeyboardEvent>;
  outsidePointerEvents(): Observable<MouseEvent>;
  updatePosition(): void;
  updateSize(config: OverlaySizeConfig): void;
  getConfig(): OverlayConfig;
}

export interface PositionStrategy {
  apply(): void;
  dispose(): void;
}

export interface ScrollStrategy {
  attach(overlayRef: OverlayRef): void;
  enable(): void;
  disable(): void;
  detach(): void;
}

export interface OverlaySizeConfig {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}
```

### Position Strategies

```typescript
export enum OverlayPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right'
}

export interface ConnectedPosition {
  originX: 'start' | 'center' | 'end';
  originY: 'top' | 'center' | 'bottom';
  overlayX: 'start' | 'center' | 'end';
  overlayY: 'top' | 'center' | 'bottom';
  weight?: number;
  offsetX?: number;
  offsetY?: number;
  panelClass?: string | string[];
}
```

### Scroll Strategies

```typescript
export enum ScrollStrategyType {
  NOOP = 'noop',
  CLOSE = 'close',
  BLOCK = 'block',
  REPOSITION = 'reposition'
}
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `overlays$` | `Observable<OverlayRef[]>` | Observable stream của active overlays |
| `activeOverlays` | `OverlayRef[]` | Danh sách overlay đang active |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `create()` | `create(config?: OverlayConfig): OverlayRef` | Tạo overlay mới |
| `createModal()` | `createModal(config?: ModalConfig): OverlayRef` | Tạo modal overlay |
| `createTooltip()` | `createTooltip(element: ElementRef, config?: TooltipConfig): OverlayRef` | Tạo tooltip overlay |
| `createPopup()` | `createPopup(origin: ElementRef, config?: PopupConfig): OverlayRef` | Tạo popup overlay |
| `createDropdown()` | `createDropdown(trigger: ElementRef, config?: DropdownConfig): OverlayRef` | Tạo dropdown overlay |
| `position()` | `position(): PositionBuilder` | Tạo position strategy builder |
| `scrollStrategies()` | `scrollStrategies(): ScrollStrategyBuilder` | Tạo scroll strategy builder |
| `closeAll()` | `closeAll(): void` | Đóng tất cả overlays |
| `getById()` | `getById(id: string): OverlayRef \| undefined` | Lấy overlay theo ID |

## Implementation Details

### Service Implementation

```typescript
import { Injectable, Injector, ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef as CdkOverlayRef, PositionStrategy, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from '../utils/unsubscribe-on-destroy.adapter';

@Injectable({
  providedIn: 'root'
})
export class OverlayService extends UnsubscribeOnDestroyAdapter {
  private _overlays = new BehaviorSubject<OverlayRef[]>([]);
  private _overlayCounter = 0;
  private _zIndexBase = 1000;

  public readonly overlays$ = this._overlays.asObservable();

  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    super();
  }

  get activeOverlays(): OverlayRef[] {
    return this._overlays.value;
  }

  create(config: OverlayConfig = {}): OverlayRef {
    const overlayConfig = this.createOverlayConfig(config);
    const cdkOverlayRef = this.overlay.create(overlayConfig);
    const overlayRef = this.createOverlayRef(cdkOverlayRef, config);
    
    this.addOverlay(overlayRef);
    return overlayRef;
  }

  createModal(config: ModalConfig = {}): OverlayRef {
    const modalConfig: OverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'modal-panel',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      disposeOnNavigation: true,
      ...config
    };
    
    return this.create(modalConfig);
  }

  createTooltip(element: ElementRef, config: TooltipConfig = {}): OverlayRef {
    const tooltipConfig: OverlayConfig = {
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(element)
        .withPositions([
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
            offsetY: -8
          },
          {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
            offsetY: 8
          }
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'tooltip-panel',
      hasBackdrop: false,
      ...config
    };
    
    return this.create(tooltipConfig);
  }

  createPopup(origin: ElementRef, config: PopupConfig = {}): OverlayRef {
    const popupConfig: OverlayConfig = {
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(origin)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 4
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -4
          }
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'popup-panel',
      ...config
    };
    
    return this.create(popupConfig);
  }

  createDropdown(trigger: ElementRef, config: DropdownConfig = {}): OverlayRef {
    const dropdownConfig: OverlayConfig = {
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
          }
        ])
        .withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'dropdown-panel',
      width: trigger.nativeElement.offsetWidth,
      ...config
    };
    
    return this.create(dropdownConfig);
  }

  position(): PositionBuilder {
    return new PositionBuilder(this.overlay.position());
  }

  scrollStrategies(): ScrollStrategyBuilder {
    return new ScrollStrategyBuilder(this.overlay.scrollStrategies);
  }

  closeAll(): void {
    const overlays = [...this._overlays.value];
    overlays.forEach(overlay => overlay.dispose());
  }

  getById(id: string): OverlayRef | undefined {
    return this._overlays.value.find(overlay => overlay.id === id);
  }

  private createOverlayConfig(config: OverlayConfig): OverlayConfig {
    return {
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      ...config
    };
  }

  private createOverlayRef(cdkOverlayRef: CdkOverlayRef, config: OverlayConfig): OverlayRef {
    const id = `overlay-${++this._overlayCounter}`;
    const overlayRef = new CustomOverlayRef(id, cdkOverlayRef, config);
    
    // Handle disposal
    overlayRef.onDispose(() => {
      this.removeOverlay(overlayRef);
    });
    
    return overlayRef;
  }

  private addOverlay(overlayRef: OverlayRef): void {
    const currentOverlays = this._overlays.value;
    this._overlays.next([...currentOverlays, overlayRef]);
  }

  private removeOverlay(overlayRef: OverlayRef): void {
    const currentOverlays = this._overlays.value;
    const filteredOverlays = currentOverlays.filter(overlay => overlay.id !== overlayRef.id);
    this._overlays.next(filteredOverlays);
  }
}

// Custom OverlayRef implementation
class CustomOverlayRef implements OverlayRef {
  private _disposeCallbacks: (() => void)[] = [];

  constructor(
    public readonly id: string,
    private cdkOverlayRef: CdkOverlayRef,
    private config: OverlayConfig
  ) {}

  attach(portal: ComponentPortal<any> | TemplatePortal): ComponentRef<any> | EmbeddedViewRef<any> {
    return this.cdkOverlayRef.attach(portal);
  }

  detach(): any {
    return this.cdkOverlayRef.detach();
  }

  dispose(): void {
    this._disposeCallbacks.forEach(callback => callback());
    this.cdkOverlayRef.dispose();
  }

  hasAttached(): boolean {
    return this.cdkOverlayRef.hasAttached();
  }

  backdropClick(): Observable<MouseEvent> {
    return this.cdkOverlayRef.backdropClick();
  }

  keydownEvents(): Observable<KeyboardEvent> {
    return this.cdkOverlayRef.keydownEvents();
  }

  outsidePointerEvents(): Observable<MouseEvent> {
    return this.cdkOverlayRef.outsidePointerEvents();
  }

  updatePosition(): void {
    this.cdkOverlayRef.updatePosition();
  }

  updateSize(config: OverlaySizeConfig): void {
    this.cdkOverlayRef.updateSize(config);
  }

  getConfig(): OverlayConfig {
    return this.config;
  }

  onDispose(callback: () => void): void {
    this._disposeCallbacks.push(callback);
  }
}

// Position Builder
class PositionBuilder {
  constructor(private cdkPositionBuilder: any) {}

  global(): GlobalPositionBuilder {
    return new GlobalPositionBuilder(this.cdkPositionBuilder.global());
  }

  flexibleConnectedTo(origin: ElementRef): FlexibleConnectedPositionBuilder {
    return new FlexibleConnectedPositionBuilder(
      this.cdkPositionBuilder.flexibleConnectedTo(origin)
    );
  }
}

// Global Position Builder
class GlobalPositionBuilder {
  constructor(private cdkBuilder: any) {}

  top(value?: string): this {
    this.cdkBuilder.top(value);
    return this;
  }

  bottom(value?: string): this {
    this.cdkBuilder.bottom(value);
    return this;
  }

  left(value?: string): this {
    this.cdkBuilder.left(value);
    return this;
  }

  right(value?: string): this {
    this.cdkBuilder.right(value);
    return this;
  }

  centerHorizontally(offset?: string): this {
    this.cdkBuilder.centerHorizontally(offset);
    return this;
  }

  centerVertically(offset?: string): this {
    this.cdkBuilder.centerVertically(offset);
    return this;
  }

  build(): PositionStrategy {
    return this.cdkBuilder;
  }
}

// Flexible Connected Position Builder
class FlexibleConnectedPositionBuilder {
  constructor(private cdkBuilder: any) {}

  withPositions(positions: ConnectedPosition[]): this {
    this.cdkBuilder.withPositions(positions);
    return this;
  }

  withPush(canPush: boolean): this {
    this.cdkBuilder.withPush(canPush);
    return this;
  }

  withGrowAfterOpen(growAfterOpen: boolean): this {
    this.cdkBuilder.withGrowAfterOpen(growAfterOpen);
    return this;
  }

  withViewportMargin(margin: number): this {
    this.cdkBuilder.withViewportMargin(margin);
    return this;
  }

  withFlexibleDimensions(flexibleDimensions: boolean): this {
    this.cdkBuilder.withFlexibleDimensions(flexibleDimensions);
    return this;
  }

  build(): PositionStrategy {
    return this.cdkBuilder;
  }
}

// Scroll Strategy Builder
class ScrollStrategyBuilder {
  constructor(private cdkScrollStrategies: any) {}

  noop(): ScrollStrategy {
    return this.cdkScrollStrategies.noop();
  }

  close(): ScrollStrategy {
    return this.cdkScrollStrategies.close();
  }

  block(): ScrollStrategy {
    return this.cdkScrollStrategies.block();
  }

  reposition(config?: { scrollThrottle?: number; autoClose?: boolean }): ScrollStrategy {
    return this.cdkScrollStrategies.reposition(config);
  }
}
```

## Cách sử dụng

### Basic Modal Usage

```typescript
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { OverlayService } from '@cci-web/core';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-modal-demo',
  template: `
    <div class="demo-container">
      <h2>Modal Demo</h2>
      
      <div class="button-group">
        <button mat-raised-button color="primary" (click)="openSimpleModal()">
          Open Simple Modal
        </button>
        
        <button mat-raised-button color="accent" (click)="openTemplateModal()">
          Open Template Modal
        </button>
        
        <button mat-raised-button color="warn" (click)="openComponentModal()">
          Open Component Modal
        </button>
        
        <button mat-stroked-button (click)="closeAllModals()">
          Close All Modals
        </button>
      </div>
      
      <!-- Template Modal Content -->
      <ng-template #modalTemplate let-data>
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ data.title }}</h3>
            <button mat-icon-button (click)="closeModal(data.overlayRef)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="modal-body">
            <p>{{ data.message }}</p>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your input</mat-label>
              <input matInput [(ngModel)]="data.userInput" placeholder="Type something...">
            </mat-form-field>
          </div>
          
          <div class="modal-footer">
            <button mat-button (click)="closeModal(data.overlayRef)">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveAndClose(data)">
              Save
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin: 2rem 0;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
    
    .modal-body {
      padding: 2rem;
      flex: 1;
      overflow-y: auto;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 2rem 1.5rem;
      border-top: 1px solid #eee;
    }
    
    .full-width {
      width: 100%;
    }
  `]
})
export class ModalDemoComponent {
  @ViewChild('modalTemplate', { static: true }) modalTemplate!: TemplateRef<any>;
  
  private activeModals: any[] = [];

  constructor(private overlayService: OverlayService) {}

  openSimpleModal() {
    const overlayRef = this.overlayService.createModal({
      panelClass: 'simple-modal-panel'
    });
    
    const portal = new TemplatePortal(this.modalTemplate, undefined, {
      title: 'Simple Modal',
      message: 'This is a simple modal created with template portal.',
      userInput: '',
      overlayRef
    });
    
    overlayRef.attach(portal);
    this.activeModals.push({ overlayRef, portal });
    
    // Handle backdrop click
    overlayRef.backdropClick().subscribe(() => {
      this.closeModal(overlayRef);
    });
    
    // Handle escape key
    overlayRef.keydownEvents().subscribe(event => {
      if (event.key === 'Escape') {
        this.closeModal(overlayRef);
      }
    });
  }

  openTemplateModal() {
    const overlayRef = this.overlayService.createModal({
      panelClass: 'template-modal-panel',
      backdropClass: 'custom-backdrop'
    });
    
    const portal = new TemplatePortal(this.modalTemplate, undefined, {
      title: 'Template Modal',
      message: 'This modal demonstrates template-based content with data binding.',
      userInput: 'Default value',
      overlayRef
    });
    
    overlayRef.attach(portal);
    this.activeModals.push({ overlayRef, portal });
    
    overlayRef.backdropClick().subscribe(() => {
      this.closeModal(overlayRef);
    });
  }

  openComponentModal() {
    const overlayRef = this.overlayService.createModal({
      panelClass: 'component-modal-panel'
    });
    
    // Create component portal
    const portal = new ComponentPortal(DynamicModalComponent);
    const componentRef = overlayRef.attach(portal);
    
    // Pass data to component
    componentRef.instance.title = 'Component Modal';
    componentRef.instance.message = 'This modal uses a dynamic component.';
    componentRef.instance.closeModal = () => this.closeModal(overlayRef);
    
    this.activeModals.push({ overlayRef, componentRef });
    
    overlayRef.backdropClick().subscribe(() => {
      this.closeModal(overlayRef);
    });
  }

  closeModal(overlayRef: any) {
    const index = this.activeModals.findIndex(modal => modal.overlayRef === overlayRef);
    if (index !== -1) {
      this.activeModals.splice(index, 1);
    }
    overlayRef.dispose();
  }

  closeAllModals() {
    this.overlayService.closeAll();
    this.activeModals = [];
  }

  saveAndClose(data: any) {
    console.log('Saving data:', data.userInput);
    this.closeModal(data.overlayRef);
  }
}

// Dynamic Modal Component
@Component({
  selector: 'app-dynamic-modal',
  template: `
    <div class="dynamic-modal">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button mat-icon-button (click)="closeModal()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="modal-body">
        <p>{{ message }}</p>
        
        <div class="feature-list">
          <h4>Features:</h4>
          <ul>
            <li>Dynamic component creation</li>
            <li>Data binding</li>
            <li>Event handling</li>
            <li>Custom styling</li>
          </ul>
        </div>
        
        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      </div>
      
      <div class="modal-footer">
        <button mat-button (click)="closeModal()">Close</button>
        <button mat-raised-button color="primary" (click)="performAction()">
          Perform Action
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dynamic-modal {
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      max-width: 600px;
      width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem 1rem;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }
    
    .modal-body {
      padding: 2rem;
      flex: 1;
      overflow-y: auto;
    }
    
    .feature-list {
      margin: 1.5rem 0;
    }
    
    .feature-list h4 {
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .feature-list ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .feature-list li {
      margin-bottom: 0.25rem;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 2rem 1.5rem;
      border-top: 1px solid #eee;
      background: #f8f9fa;
    }
  `]
})
export class DynamicModalComponent {
  title = '';
  message = '';
  loading = false;
  closeModal: () => void = () => {};

  performAction() {
    this.loading = true;
    
    // Simulate async operation
    setTimeout(() => {
      this.loading = false;
      console.log('Action performed!');
    }, 2000);
  }
}
```

### Tooltip Implementation

```typescript
@Component({
  selector: 'app-tooltip-demo',
  template: `
    <div class="tooltip-demo">
      <h2>Tooltip Demo</h2>
      
      <div class="demo-grid">
        <button mat-raised-button
                #tooltipTrigger1
                (mouseenter)="showTooltip(tooltipTrigger1, 'Simple tooltip message')"
                (mouseleave)="hideTooltip()">
          Hover for Tooltip
        </button>
        
        <button mat-raised-button
                #tooltipTrigger2
                (mouseenter)="showRichTooltip(tooltipTrigger2)"
                (mouseleave)="hideTooltip()">
          Rich Tooltip
        </button>
        
        <button mat-raised-button
                #tooltipTrigger3
                (click)="toggleTooltip(tooltipTrigger3)">
          Click Tooltip
        </button>
      </div>
      
      <!-- Rich Tooltip Template -->
      <ng-template #richTooltipTemplate>
        <div class="rich-tooltip">
          <div class="tooltip-header">
            <mat-icon>info</mat-icon>
            <span>Information</span>
          </div>
          <div class="tooltip-content">
            <p>This is a rich tooltip with custom content.</p>
            <ul>
              <li>Custom styling</li>
              <li>Multiple elements</li>
              <li>Interactive content</li>
            </ul>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .tooltip-demo {
      padding: 2rem;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .rich-tooltip {
      background: #333;
      color: white;
      border-radius: 6px;
      padding: 0;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #444;
      border-radius: 6px 6px 0 0;
      font-weight: 500;
    }
    
    .tooltip-content {
      padding: 1rem;
    }
    
    .tooltip-content p {
      margin: 0 0 0.5rem 0;
    }
    
    .tooltip-content ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .tooltip-content li {
      margin-bottom: 0.25rem;
    }
  `]
})
export class TooltipDemoComponent {
  @ViewChild('richTooltipTemplate', { static: true }) richTooltipTemplate!: TemplateRef<any>;
  
  private currentTooltip: any = null;

  constructor(private overlayService: OverlayService) {}

  showTooltip(element: ElementRef, message: string) {
    this.hideTooltip();
    
    const overlayRef = this.overlayService.createTooltip(element, {
      panelClass: 'simple-tooltip-panel'
    });
    
    // Create simple tooltip content
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'simple-tooltip';
    tooltipElement.textContent = message;
    
    const portal = new DomPortal(tooltipElement);
    overlayRef.attach(portal);
    
    this.currentTooltip = overlayRef;
  }

  showRichTooltip(element: ElementRef) {
    this.hideTooltip();
    
    const overlayRef = this.overlayService.createTooltip(element, {
      panelClass: 'rich-tooltip-panel'
    });
    
    const portal = new TemplatePortal(this.richTooltipTemplate, undefined);
    overlayRef.attach(portal);
    
    this.currentTooltip = overlayRef;
  }

  toggleTooltip(element: ElementRef) {
    if (this.currentTooltip) {
      this.hideTooltip();
    } else {
      this.showTooltip(element, 'Click tooltip - click again to hide');
    }
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.dispose();
      this.currentTooltip = null;
    }
  }
}
```

### Dropdown Menu Implementation

```typescript
@Component({
  selector: 'app-dropdown-demo',
  template: `
    <div class="dropdown-demo">
      <h2>Dropdown Demo</h2>
      
      <div class="demo-controls">
        <button mat-raised-button
                #dropdownTrigger1
                (click)="toggleDropdown(dropdownTrigger1, 'simple')">
          Simple Dropdown
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        
        <button mat-raised-button
                #dropdownTrigger2
                (click)="toggleDropdown(dropdownTrigger2, 'menu')">
          Menu Dropdown
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
      </div>
      
      <!-- Simple Dropdown Template -->
      <ng-template #simpleDropdownTemplate>
        <div class="simple-dropdown">
          <div class="dropdown-item" (click)="selectOption('Option 1')">
            Option 1
          </div>
          <div class="dropdown-item" (click)="selectOption('Option 2')">
            Option 2
          </div>
          <div class="dropdown-item" (click)="selectOption('Option 3')">
            Option 3
          </div>
        </div>
      </ng-template>
      
      <!-- Menu Dropdown Template -->
      <ng-template #menuDropdownTemplate>
        <div class="menu-dropdown">
          <div class="dropdown-header">
            <span>Actions</span>
          </div>
          <div class="dropdown-item" (click)="performAction('edit')">
            <mat-icon>edit</mat-icon>
            <span>Edit</span>
          </div>
          <div class="dropdown-item" (click)="performAction('copy')">
            <mat-icon>content_copy</mat-icon>
            <span>Copy</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" (click)="performAction('delete')">
            <mat-icon>delete</mat-icon>
            <span>Delete</span>
          </div>
        </div>
      </ng-template>
      
      <div class="selected-option" *ngIf="selectedOption">
        Selected: {{ selectedOption }}
      </div>
    </div>
  `,
  styles: [`
    .dropdown-demo {
      padding: 2rem;
    }
    
    .demo-controls {
      display: flex;
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .simple-dropdown,
    .menu-dropdown {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 200px;
      overflow: hidden;
    }
    
    .dropdown-header {
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
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
    
    .dropdown-item.danger {
      color: #f44336;
    }
    
    .dropdown-item.danger:hover {
      background-color: #ffebee;
    }
    
    .dropdown-divider {
      height: 1px;
      background: #eee;
      margin: 0.5rem 0;
    }
    
    .selected-option {
      margin-top: 2rem;
      padding: 1rem;
      background: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 4px;
      color: #2e7d32;
    }
  `]
})
export class DropdownDemoComponent {
  @ViewChild('simpleDropdownTemplate', { static: true }) simpleDropdownTemplate!: TemplateRef<any>;
  @ViewChild('menuDropdownTemplate', { static: true }) menuDropdownTemplate!: TemplateRef<any>;
  
  selectedOption: string = '';
  private currentDropdown: any = null;

  constructor(private overlayService: OverlayService) {}

  toggleDropdown(trigger: ElementRef, type: string) {
    if (this.currentDropdown) {
      this.currentDropdown.dispose();
      this.currentDropdown = null;
      return;
    }
    
    const overlayRef = this.overlayService.createDropdown(trigger, {
      panelClass: `${type}-dropdown-panel`
    });
    
    const template = type === 'simple' ? this.simpleDropdownTemplate : this.menuDropdownTemplate;
    const portal = new TemplatePortal(template, undefined);
    
    overlayRef.attach(portal);
    this.currentDropdown = overlayRef;
    
    // Close on backdrop click
    overlayRef.backdropClick().subscribe(() => {
      this.closeDropdown();
    });
    
    // Close on outside click
    overlayRef.outsidePointerEvents().subscribe(() => {
      this.closeDropdown();
    });
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.closeDropdown();
  }

  performAction(action: string) {
    console.log('Performing action:', action);
    this.closeDropdown();
  }

  private closeDropdown() {
    if (this.currentDropdown) {
      this.currentDropdown.dispose();
      this.currentDropdown = null;
    }
  }
}
```

## Advanced Usage Patterns

### Overlay Manager Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class OverlayManagerService {
  private overlayStack: OverlayRef[] = [];
  private zIndexCounter = 1000;

  constructor(private overlayService: OverlayService) {
    // Subscribe to overlay changes
    this.overlayService.overlays$.subscribe(overlays => {
      this.updateZIndexes(overlays);
    });
  }

  createModalWithStack(config?: OverlayConfig): OverlayRef {
    const overlayRef = this.overlayService.createModal({
      ...config,
      disposeOnNavigation: false // Manage disposal manually
    });
    
    this.overlayStack.push(overlayRef);
    this.updateZIndexes([overlayRef]);
    
    // Handle disposal
    overlayRef.onDispose(() => {
      const index = this.overlayStack.indexOf(overlayRef);
      if (index !== -1) {
        this.overlayStack.splice(index, 1);
      }
    });
    
    return overlayRef;
  }

  closeTopModal(): boolean {
    if (this.overlayStack.length > 0) {
      const topOverlay = this.overlayStack[this.overlayStack.length - 1];
      topOverlay.dispose();
      return true;
    }
    return false;
  }

  closeAllModals(): void {
    [...this.overlayStack].forEach(overlay => overlay.dispose());
    this.overlayStack = [];
  }

  getModalCount(): number {
    return this.overlayStack.length;
  }

  private updateZIndexes(overlays: OverlayRef[]): void {
    overlays.forEach((overlay, index) => {
      const element = overlay.overlayElement;
      if (element) {
        element.style.zIndex = (this.zIndexCounter + index).toString();
      }
    });
  }
}
```

### Animation Integration

```typescript
@Injectable({
  providedIn: 'root'
})
export class AnimatedOverlayService {
  constructor(private overlayService: OverlayService) {}

  createAnimatedModal(config?: OverlayConfig): OverlayRef {
    const overlayRef = this.overlayService.createModal({
      ...config,
      panelClass: ['animated-modal-panel', ...(config?.panelClass || [])]
    });
    
    // Add enter animation
    const overlayElement = overlayRef.overlayElement;
    if (overlayElement) {
      overlayElement.classList.add('overlay-enter');
      
      // Remove enter class after animation
      setTimeout(() => {
        overlayElement.classList.remove('overlay-enter');
        overlayElement.classList.add('overlay-enter-active');
      }, 10);
    }
    
    // Handle exit animation
    const originalDispose = overlayRef.dispose.bind(overlayRef);
    overlayRef.dispose = () => {
      if (overlayElement) {
        overlayElement.classList.add('overlay-exit');
        
        setTimeout(() => {
          originalDispose();
        }, 300); // Animation duration
      } else {
        originalDispose();
      }
    };
    
    return overlayRef;
  }
}
```

## Best Practices

### 1. Proper Resource Management

```typescript
// ✅ Good - Always dispose overlays
const overlayRef = this.overlayService.create();
// ... use overlay
overlayRef.dispose(); // Clean up

// ✅ Good - Handle disposal in component destroy
ngOnDestroy() {
  this.activeOverlays.forEach(overlay => overlay.dispose());
}
```

### 2. Configure Position Strategies Appropriately

```typescript
// ✅ Good - Use appropriate position strategy
const tooltipOverlay = this.overlayService.createTooltip(element, {
  positionStrategy: this.overlayService.position()
    .flexibleConnectedTo(element)
    .withPositions([/* fallback positions */])
    .withPush(false)
});
```

### 3. Handle Backdrop and Keyboard Events

```typescript
// ✅ Good - Handle user interactions
overlayRef.backdropClick().subscribe(() => {
  overlayRef.dispose();
});

overlayRef.keydownEvents().subscribe(event => {
  if (event.key === 'Escape') {
    overlayRef.dispose();
  }
});
```

### 4. Use Appropriate Scroll Strategies

```typescript
// ✅ Good - Choose scroll strategy based on use case
const modalOverlay = this.overlayService.createModal({
  scrollStrategy: this.overlayService.scrollStrategies().block() // Block scrolling
});

const tooltipOverlay = this.overlayService.createTooltip(element, {
  scrollStrategy: this.overlayService.scrollStrategies().reposition() // Reposition on scroll
});
```

## Performance Considerations

- **Lazy Loading**: Chỉ tạo overlay khi cần thiết
- **Resource Cleanup**: Luôn dispose overlay sau khi sử dụng
- **Position Updates**: Sử dụng `updatePosition()` thay vì recreate
- **Event Subscriptions**: Unsubscribe để tránh memory leaks

## Troubleshooting

### Common Issues

1. **Overlay không hiển thị đúng vị trí**
   - Kiểm tra position strategy configuration
   - Verify element references

2. **Z-index conflicts**
   - Sử dụng OverlayManagerService để quản lý stacking
   - Configure appropriate z-index base values

3. **Memory leaks**
   - Luôn dispose overlays
   - Unsubscribe từ event streams

## Dependencies

- `@angular/cdk/overlay` - CDK Overlay functionality
- `@angular/cdk/portal` - Portal system
- `rxjs` - Observable streams
- `UnsubscribeOnDestroyAdapter` - Memory management

## Tóm tắt

Overlay Service cung cấp hệ thống quản lý overlay components mạnh mẽ và linh hoạt cho ứng dụng Angular. Với hỗ trợ đầy đủ cho modals, tooltips, dropdowns và các UI elements khác, service này giúp developers tạo ra các overlay experiences phong phú với performance tối ưu và accessibility support.