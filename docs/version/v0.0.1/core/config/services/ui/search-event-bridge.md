# Search Event Bridge Service - Giao tiếp Shell-MFE

## Giới thiệu

Search Event Bridge Service là một service chuyên biệt để xử lý giao tiếp giữa Shell application và Micro Frontend (MFE) modules trong kiến trúc micro frontend. Service này đặc biệt tập trung vào việc truyền tải các search events và data giữa các modules độc lập.

## Tính năng chính

- **Cross-Module Communication**: Giao tiếp giữa Shell và MFE modules
- **Search Event Broadcasting**: Phát tán search events toàn cục
- **Data Synchronization**: Đồng bộ search data giữa modules
- **Event Filtering**: Lọc events theo module hoặc context
- **State Management**: Quản lý search state toàn cục
- **Type Safety**: Full TypeScript support với typed events
- **Memory Management**: Tự động cleanup subscriptions
- **Performance Optimization**: Debouncing và throttling
- **Error Handling**: Robust error handling và recovery

## Types và Interfaces

### Search Event Types

```typescript
export enum SearchEventType {
  SEARCH_QUERY_CHANGED = 'search-query-changed',
  SEARCH_RESULTS_UPDATED = 'search-results-updated',
  SEARCH_FILTERS_APPLIED = 'search-filters-applied',
  SEARCH_CATEGORY_SELECTED = 'search-category-selected',
  SEARCH_SUGGESTIONS_REQUESTED = 'search-suggestions-requested',
  SEARCH_SUGGESTIONS_RECEIVED = 'search-suggestions-received',
  SEARCH_CLEARED = 'search-cleared',
  SEARCH_FOCUSED = 'search-focused',
  SEARCH_BLURRED = 'search-blurred',
  SEARCH_SUBMITTED = 'search-submitted'
}

export interface SearchEvent<T = any> {
  type: SearchEventType;
  payload: T;
  source: string; // Module identifier
  target?: string; // Target module (optional)
  timestamp: Date;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface SearchQueryEvent {
  query: string;
  previousQuery?: string;
  source: 'user-input' | 'programmatic' | 'suggestion';
  context?: SearchContext;
}

export interface SearchResultsEvent {
  results: SearchResult[];
  totalCount: number;
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationInfo;
  executionTime?: number;
}

export interface SearchFiltersEvent {
  filters: SearchFilters;
  appliedFilters: AppliedFilter[];
  availableFilters: FilterOption[];
}

export interface SearchSuggestionsEvent {
  query: string;
  suggestions: SearchSuggestion[];
  categories?: SuggestionCategory[];
}
```

### Search Data Models

```typescript
export interface SearchContext {
  module: string;
  page?: string;
  section?: string;
  userId?: string;
  sessionId?: string;
  preferences?: UserSearchPreferences;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  type: string;
  category?: string;
  score?: number;
  highlights?: SearchHighlight[];
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  categories?: string[];
  dateRange?: DateRange;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  customFilters?: Record<string, any>;
}

export interface AppliedFilter {
  key: string;
  value: any;
  label: string;
  removable?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: { value: any; label: string; count?: number }[];
  min?: number;
  max?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'result' | 'category';
  category?: string;
  count?: number;
  metadata?: Record<string, any>;
}

export interface SuggestionCategory {
  name: string;
  label: string;
  suggestions: SearchSuggestion[];
  maxSuggestions?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
  startTag?: string;
  endTag?: string;
}

export interface UserSearchPreferences {
  defaultFilters?: SearchFilters;
  preferredCategories?: string[];
  searchHistory?: string[];
  savedSearches?: SavedSearch[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  createdAt: Date;
  lastUsed?: Date;
}
```

### Configuration Interfaces

```typescript
export interface SearchEventBridgeConfig {
  moduleId: string;
  enableLogging?: boolean;
  debounceTime?: number;
  throttleTime?: number;
  maxEventHistory?: number;
  enablePersistence?: boolean;
  persistenceKey?: string;
  errorRetryAttempts?: number;
  errorRetryDelay?: number;
}

export interface EventSubscriptionOptions {
  source?: string | string[];
  target?: string;
  debounceTime?: number;
  throttleTime?: number;
  filterPredicate?: (event: SearchEvent) => boolean;
}
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `events$` | `Observable<SearchEvent>` | Stream tất cả search events |
| `queryEvents$` | `Observable<SearchEvent<SearchQueryEvent>>` | Stream query change events |
| `resultsEvents$` | `Observable<SearchEvent<SearchResultsEvent>>` | Stream results update events |
| `filtersEvents$` | `Observable<SearchEvent<SearchFiltersEvent>>` | Stream filter change events |
| `suggestionsEvents$` | `Observable<SearchEvent<SearchSuggestionsEvent>>` | Stream suggestion events |
| `currentQuery$` | `Observable<string>` | Current search query |
| `currentResults$` | `Observable<SearchResult[]>` | Current search results |
| `currentFilters$` | `Observable<SearchFilters>` | Current applied filters |
| `isSearching$` | `Observable<boolean>` | Search loading state |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `emit()` | `emit<T>(type: SearchEventType, payload: T, target?: string): void` | Phát event |
| `subscribe()` | `subscribe<T>(type: SearchEventType, callback: (event: SearchEvent<T>) => void, options?: EventSubscriptionOptions): Subscription` | Subscribe event |
| `subscribeToQuery()` | `subscribeToQuery(callback: (query: string) => void, options?: EventSubscriptionOptions): Subscription` | Subscribe query changes |
| `subscribeToResults()` | `subscribeToResults(callback: (results: SearchResultsEvent) => void, options?: EventSubscriptionOptions): Subscription` | Subscribe results |
| `subscribeToFilters()` | `subscribeToFilters(callback: (filters: SearchFiltersEvent) => void, options?: EventSubscriptionOptions): Subscription` | Subscribe filters |
| `updateQuery()` | `updateQuery(query: string, source?: string, context?: SearchContext): void` | Update search query |
| `updateResults()` | `updateResults(results: SearchResultsEvent): void` | Update search results |
| `updateFilters()` | `updateFilters(filters: SearchFiltersEvent): void` | Update filters |
| `requestSuggestions()` | `requestSuggestions(query: string, context?: SearchContext): void` | Request suggestions |
| `clearSearch()` | `clearSearch(source?: string): void` | Clear search |
| `getEventHistory()` | `getEventHistory(type?: SearchEventType, limit?: number): SearchEvent[]` | Lấy event history |
| `getCurrentState()` | `getCurrentState(): SearchState` | Lấy current state |

## Implementation Details

### Service Implementation

```typescript
import { Injectable, Inject, Optional } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, debounceTime, throttleTime, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { UnsubscribeOnDestroyAdapter } from '../utils/unsubscribe-on-destroy.adapter';

@Injectable({
  providedIn: 'root'
})
export class SearchEventBridgeService extends UnsubscribeOnDestroyAdapter {
  private _events = new Subject<SearchEvent>();
  private _currentQuery = new BehaviorSubject<string>('');
  private _currentResults = new BehaviorSubject<SearchResult[]>([]);
  private _currentFilters = new BehaviorSubject<SearchFilters>({});
  private _isSearching = new BehaviorSubject<boolean>(false);
  private _eventHistory: SearchEvent[] = [];
  private _config: SearchEventBridgeConfig;

  // Public observables
  public readonly events$ = this._events.asObservable();
  public readonly currentQuery$ = this._currentQuery.asObservable();
  public readonly currentResults$ = this._currentResults.asObservable();
  public readonly currentFilters$ = this._currentFilters.asObservable();
  public readonly isSearching$ = this._isSearching.asObservable();

  // Filtered event streams
  public readonly queryEvents$ = this.events$.pipe(
    filter(event => event.type === SearchEventType.SEARCH_QUERY_CHANGED),
    shareReplay(1)
  ) as Observable<SearchEvent<SearchQueryEvent>>;

  public readonly resultsEvents$ = this.events$.pipe(
    filter(event => event.type === SearchEventType.SEARCH_RESULTS_UPDATED),
    shareReplay(1)
  ) as Observable<SearchEvent<SearchResultsEvent>>;

  public readonly filtersEvents$ = this.events$.pipe(
    filter(event => event.type === SearchEventType.SEARCH_FILTERS_APPLIED),
    shareReplay(1)
  ) as Observable<SearchEvent<SearchFiltersEvent>>;

  public readonly suggestionsEvents$ = this.events$.pipe(
    filter(event => event.type === SearchEventType.SEARCH_SUGGESTIONS_RECEIVED),
    shareReplay(1)
  ) as Observable<SearchEvent<SearchSuggestionsEvent>>;

  constructor(
    @Optional() @Inject('SEARCH_EVENT_BRIDGE_CONFIG') config?: SearchEventBridgeConfig
  ) {
    super();
    
    this._config = {
      moduleId: 'default',
      enableLogging: false,
      debounceTime: 300,
      throttleTime: 100,
      maxEventHistory: 100,
      enablePersistence: false,
      errorRetryAttempts: 3,
      errorRetryDelay: 1000,
      ...config
    };

    this.initializeEventHandlers();
    this.loadPersistedState();
  }

  private initializeEventHandlers(): void {
    // Handle query events
    this.subs.add(
      this.queryEvents$.subscribe(event => {
        this._currentQuery.next(event.payload.query);
        this._isSearching.next(true);
        
        if (this._config.enableLogging) {
          console.log('[SearchEventBridge] Query changed:', event.payload.query);
        }
      })
    );

    // Handle results events
    this.subs.add(
      this.resultsEvents$.subscribe(event => {
        this._currentResults.next(event.payload.results);
        this._isSearching.next(false);
        
        if (this._config.enableLogging) {
          console.log('[SearchEventBridge] Results updated:', event.payload.results.length);
        }
      })
    );

    // Handle filters events
    this.subs.add(
      this.filtersEvents$.subscribe(event => {
        this._currentFilters.next(event.payload.filters);
        
        if (this._config.enableLogging) {
          console.log('[SearchEventBridge] Filters applied:', event.payload.filters);
        }
      })
    );

    // Handle clear events
    this.subs.add(
      this.events$.pipe(
        filter(event => event.type === SearchEventType.SEARCH_CLEARED)
      ).subscribe(() => {
        this._currentQuery.next('');
        this._currentResults.next([]);
        this._currentFilters.next({});
        this._isSearching.next(false);
      })
    );

    // Persist state changes
    if (this._config.enablePersistence) {
      this.subs.add(
        this.events$.pipe(
          debounceTime(1000)
        ).subscribe(() => {
          this.persistCurrentState();
        })
      );
    }
  }

  emit<T>(type: SearchEventType, payload: T, target?: string): void {
    const event: SearchEvent<T> = {
      type,
      payload,
      source: this._config.moduleId,
      target,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId()
    };

    this.addToHistory(event);
    this._events.next(event);

    if (this._config.enableLogging) {
      console.log('[SearchEventBridge] Event emitted:', event);
    }
  }

  subscribe<T>(
    type: SearchEventType,
    callback: (event: SearchEvent<T>) => void,
    options?: EventSubscriptionOptions
  ): Subscription {
    let stream = this.events$.pipe(
      filter(event => event.type === type)
    );

    // Apply source filter
    if (options?.source) {
      const sources = Array.isArray(options.source) ? options.source : [options.source];
      stream = stream.pipe(
        filter(event => sources.includes(event.source))
      );
    }

    // Apply target filter
    if (options?.target) {
      stream = stream.pipe(
        filter(event => !event.target || event.target === options.target)
      );
    }

    // Apply custom filter
    if (options?.filterPredicate) {
      stream = stream.pipe(
        filter(options.filterPredicate)
      );
    }

    // Apply debounce
    if (options?.debounceTime) {
      stream = stream.pipe(
        debounceTime(options.debounceTime)
      );
    }

    // Apply throttle
    if (options?.throttleTime) {
      stream = stream.pipe(
        throttleTime(options.throttleTime)
      );
    }

    return stream.subscribe(callback as any);
  }

  subscribeToQuery(
    callback: (query: string) => void,
    options?: EventSubscriptionOptions
  ): Subscription {
    return this.subscribe<SearchQueryEvent>(
      SearchEventType.SEARCH_QUERY_CHANGED,
      event => callback(event.payload.query),
      options
    );
  }

  subscribeToResults(
    callback: (results: SearchResultsEvent) => void,
    options?: EventSubscriptionOptions
  ): Subscription {
    return this.subscribe<SearchResultsEvent>(
      SearchEventType.SEARCH_RESULTS_UPDATED,
      event => callback(event.payload),
      options
    );
  }

  subscribeToFilters(
    callback: (filters: SearchFiltersEvent) => void,
    options?: EventSubscriptionOptions
  ): Subscription {
    return this.subscribe<SearchFiltersEvent>(
      SearchEventType.SEARCH_FILTERS_APPLIED,
      event => callback(event.payload),
      options
    );
  }

  updateQuery(query: string, source: string = 'user-input', context?: SearchContext): void {
    const previousQuery = this._currentQuery.value;
    
    const payload: SearchQueryEvent = {
      query,
      previousQuery: previousQuery !== query ? previousQuery : undefined,
      source: source as any,
      context
    };

    this.emit(SearchEventType.SEARCH_QUERY_CHANGED, payload);
  }

  updateResults(results: SearchResultsEvent): void {
    this.emit(SearchEventType.SEARCH_RESULTS_UPDATED, results);
  }

  updateFilters(filters: SearchFiltersEvent): void {
    this.emit(SearchEventType.SEARCH_FILTERS_APPLIED, filters);
  }

  requestSuggestions(query: string, context?: SearchContext): void {
    this.emit(SearchEventType.SEARCH_SUGGESTIONS_REQUESTED, {
      query,
      context
    });
  }

  clearSearch(source?: string): void {
    this.emit(SearchEventType.SEARCH_CLEARED, {
      source: source || this._config.moduleId,
      timestamp: new Date()
    });
  }

  getEventHistory(type?: SearchEventType, limit?: number): SearchEvent[] {
    let history = [...this._eventHistory];
    
    if (type) {
      history = history.filter(event => event.type === type);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history;
  }

  getCurrentState(): SearchState {
    return {
      query: this._currentQuery.value,
      results: this._currentResults.value,
      filters: this._currentFilters.value,
      isSearching: this._isSearching.value,
      lastUpdated: new Date()
    };
  }

  private addToHistory(event: SearchEvent): void {
    this._eventHistory.push(event);
    
    // Limit history size
    if (this._eventHistory.length > this._config.maxEventHistory!) {
      this._eventHistory = this._eventHistory.slice(-this._config.maxEventHistory!);
    }
  }

  private generateCorrelationId(): string {
    return `${this._config.moduleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadPersistedState(): void {
    if (!this._config.enablePersistence || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const key = this._config.persistenceKey || `search-state-${this._config.moduleId}`;
      const persistedState = localStorage.getItem(key);
      
      if (persistedState) {
        const state: SearchState = JSON.parse(persistedState);
        
        this._currentQuery.next(state.query || '');
        this._currentResults.next(state.results || []);
        this._currentFilters.next(state.filters || {});
        this._isSearching.next(state.isSearching || false);
      }
    } catch (error) {
      console.warn('[SearchEventBridge] Failed to load persisted state:', error);
    }
  }

  private persistCurrentState(): void {
    if (!this._config.enablePersistence || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const key = this._config.persistenceKey || `search-state-${this._config.moduleId}`;
      const state = this.getCurrentState();
      
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('[SearchEventBridge] Failed to persist state:', error);
    }
  }
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  isSearching: boolean;
  lastUpdated: Date;
}
```

## Cách sử dụng

### Shell Application Setup

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchEventBridgeService, SearchEventType } from '@cci-web/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-shell',
  template: `
    <div class="shell-container">
      <!-- Global Search Header -->
      <header class="shell-header">
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input matInput
                   [(ngModel)]="searchQuery"
                   (input)="onSearchInput($event)"
                   (focus)="onSearchFocus()"
                   (blur)="onSearchBlur()"
                   (keydown.enter)="onSearchSubmit()"
                   placeholder="Search across all modules...">
            <mat-icon matPrefix>search</mat-icon>
            <button mat-icon-button
                    matSuffix
                    *ngIf="searchQuery"
                    (click)="clearSearch()">
              <mat-icon>clear</mat-icon>
            </button>
          </mat-form-field>
          
          <!-- Search Suggestions -->
          <div class="search-suggestions"
               *ngIf="showSuggestions && suggestions.length > 0">
            <div class="suggestion-category"
                 *ngFor="let category of suggestionCategories">
              <div class="category-header">{{ category.label }}</div>
              <div class="suggestion-item"
                   *ngFor="let suggestion of category.suggestions"
                   (click)="selectSuggestion(suggestion)">
                <mat-icon>{{ getSuggestionIcon(suggestion.type) }}</mat-icon>
                <span class="suggestion-text">{{ suggestion.text }}</span>
                <span class="suggestion-count" *ngIf="suggestion.count">
                  ({{ suggestion.count }})
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Search Status -->
        <div class="search-status" *ngIf="isSearching">
          <mat-spinner diameter="20"></mat-spinner>
          <span>Searching...</span>
        </div>
        
        <!-- Applied Filters -->
        <div class="applied-filters" *ngIf="appliedFilters.length > 0">
          <span class="filters-label">Filters:</span>
          <mat-chip-list>
            <mat-chip *ngFor="let filter of appliedFilters"
                     [removable]="filter.removable"
                     (removed)="removeFilter(filter)">
              {{ filter.label }}
              <mat-icon matChipRemove *ngIf="filter.removable">cancel</mat-icon>
            </mat-chip>
          </mat-chip-list>
        </div>
      </header>
      
      <!-- MFE Container -->
      <main class="mfe-container">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Global Search Results Overlay -->
      <div class="global-search-overlay"
           *ngIf="showGlobalResults"
           (click)="hideGlobalResults()">
        <div class="global-results-panel" (click)="$event.stopPropagation()">
          <div class="results-header">
            <h3>Search Results for "{{ currentQuery }}"</h3>
            <button mat-icon-button (click)="hideGlobalResults()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="results-content">
            <div class="result-group"
                 *ngFor="let group of groupedResults">
              <h4>{{ group.category }}</h4>
              <div class="result-item"
                   *ngFor="let result of group.results"
                   (click)="navigateToResult(result)">
                <div class="result-title">{{ result.title }}</div>
                <div class="result-description">{{ result.description }}</div>
                <div class="result-metadata">
                  <span class="result-type">{{ result.type }}</span>
                  <span class="result-score" *ngIf="result.score">
                    Score: {{ result.score | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .shell-header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 1rem 2rem;
      position: relative;
      z-index: 100;
    }
    
    .search-container {
      position: relative;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .search-field {
      width: 100%;
    }
    
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
    }
    
    .suggestion-category {
      border-bottom: 1px solid #f0f0f0;
    }
    
    .suggestion-category:last-child {
      border-bottom: none;
    }
    
    .category-header {
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      font-weight: 500;
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
    }
    
    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .suggestion-item:hover {
      background-color: #f5f5f5;
    }
    
    .suggestion-text {
      flex: 1;
    }
    
    .suggestion-count {
      color: #666;
      font-size: 0.875rem;
    }
    
    .search-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      color: #666;
    }
    
    .applied-filters {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .filters-label {
      font-weight: 500;
      color: #666;
    }
    
    .mfe-container {
      flex: 1;
      overflow: auto;
    }
    
    .global-search-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    
    .global-results-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      max-width: 800px;
      width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .results-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 2rem 2rem;
    }
    
    .result-group {
      margin-bottom: 2rem;
    }
    
    .result-group h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }
    
    .result-item {
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .result-item:hover {
      border-color: #2196f3;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
    }
    
    .result-title {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .result-description {
      color: #666;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    
    .result-metadata {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #888;
    }
    
    .result-type {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 500;
    }
  `]
})
export class ShellComponent implements OnInit, OnDestroy {
  searchQuery = '';
  currentQuery = '';
  isSearching = false;
  showSuggestions = false;
  showGlobalResults = false;
  
  suggestions: any[] = [];
  suggestionCategories: any[] = [];
  appliedFilters: any[] = [];
  groupedResults: any[] = [];
  
  private destroy$ = new Subject<void>();
  private searchInput$ = new Subject<string>();

  constructor(private searchEventBridge: SearchEventBridgeService) {}

  ngOnInit() {
    // Configure search event bridge for shell
    this.searchEventBridge.configure({
      moduleId: 'shell',
      enableLogging: true,
      debounceTime: 300,
      enablePersistence: true
    });

    // Subscribe to search state changes
    this.searchEventBridge.currentQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        this.currentQuery = query;
        if (query !== this.searchQuery) {
          this.searchQuery = query;
        }
      });

    this.searchEventBridge.isSearching$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSearching => {
        this.isSearching = isSearching;
      });

    // Handle search input with debouncing
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchEventBridge.updateQuery(query, 'user-input', {
        module: 'shell',
        page: 'global-search'
      });
      
      if (query.length >= 2) {
        this.searchEventBridge.requestSuggestions(query);
      } else {
        this.hideSuggestions();
      }
    });

    // Subscribe to suggestions
    this.searchEventBridge.suggestionsEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.suggestions = event.payload.suggestions;
        this.suggestionCategories = event.payload.categories || [];
        this.showSuggestions = this.suggestions.length > 0;
      });

    // Subscribe to results from MFEs
    this.searchEventBridge.resultsEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.processSearchResults(event.payload);
      });

    // Subscribe to filter changes
    this.searchEventBridge.filtersEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.appliedFilters = event.payload.appliedFilters || [];
      });

    // Load initial state
    const currentState = this.searchEventBridge.getCurrentState();
    if (currentState.query) {
      this.searchQuery = currentState.query;
      this.currentQuery = currentState.query;
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchInput$.next(query);
  }

  onSearchFocus() {
    this.searchEventBridge.emit(SearchEventType.SEARCH_FOCUSED, {
      source: 'shell',
      timestamp: new Date()
    });
    
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur() {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
    
    this.searchEventBridge.emit(SearchEventType.SEARCH_BLURRED, {
      source: 'shell',
      timestamp: new Date()
    });
  }

  onSearchSubmit() {
    this.searchEventBridge.emit(SearchEventType.SEARCH_SUBMITTED, {
      query: this.searchQuery,
      source: 'shell',
      timestamp: new Date()
    });
    
    this.hideSuggestions();
    this.showGlobalResults = true;
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.text;
    this.searchEventBridge.updateQuery(suggestion.text, 'suggestion');
    this.hideSuggestions();
    this.onSearchSubmit();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchEventBridge.clearSearch('shell');
    this.hideSuggestions();
    this.hideGlobalResults();
  }

  removeFilter(filter: any) {
    // Emit filter removal event
    this.searchEventBridge.emit(SearchEventType.SEARCH_FILTERS_APPLIED, {
      filters: this.getCurrentFiltersWithoutFilter(filter),
      appliedFilters: this.appliedFilters.filter(f => f !== filter),
      removedFilter: filter
    });
  }

  hideGlobalResults() {
    this.showGlobalResults = false;
  }

  hideSuggestions() {
    this.showSuggestions = false;
  }

  navigateToResult(result: any) {
    // Navigate to result and close overlay
    console.log('Navigating to result:', result);
    this.hideGlobalResults();
  }

  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'query': return 'search';
      case 'result': return 'description';
      case 'category': return 'category';
      default: return 'help';
    }
  }

  private processSearchResults(resultsEvent: any) {
    // Group results by category/module
    const grouped = this.groupResultsByCategory(resultsEvent.results);
    this.groupedResults = grouped;
  }

  private groupResultsByCategory(results: any[]): any[] {
    const groups = new Map<string, any[]>();
    
    results.forEach(result => {
      const category = result.category || result.type || 'Other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(result);
    });
    
    return Array.from(groups.entries()).map(([category, results]) => ({
      category,
      results
    }));
  }

  private getCurrentFiltersWithoutFilter(filterToRemove: any): any {
    // Implementation to remove specific filter
    return {}; // Simplified
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### MFE Module Implementation

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchEventBridgeService, SearchEventType } from '@cci-web/core';
import { Subject, takeUntil, switchMap, catchError } from 'rxjs';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-search-mfe',
  template: `
    <div class="product-search-mfe">
      <div class="search-header">
        <h2>Product Search</h2>
        <div class="search-info" *ngIf="currentQuery">
          Searching for: <strong>"{{ currentQuery }}"</strong>
        </div>
      </div>
      
      <!-- Local Search Filters -->
      <div class="search-filters">
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(value)]="selectedCategory" (selectionChange)="onCategoryChange()">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category.value">
              {{ category.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Price Range</mat-label>
          <mat-select [(value)]="selectedPriceRange" (selectionChange)="onPriceRangeChange()">
            <mat-option value="">Any Price</mat-option>
            <mat-option value="0-50">$0 - $50</mat-option>
            <mat-option value="50-100">$50 - $100</mat-option>
            <mat-option value="100-200">$100 - $200</mat-option>
            <mat-option value="200+">$200+</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Sort By</mat-label>
          <mat-select [(value)]="sortBy" (selectionChange)="onSortChange()">
            <mat-option value="relevance">Relevance</mat-option>
            <mat-option value="price-asc">Price: Low to High</mat-option>
            <mat-option value="price-desc">Price: High to Low</mat-option>
            <mat-option value="name">Name</mat-option>
            <mat-option value="rating">Rating</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      <!-- Search Results -->
      <div class="search-results">
        <div class="results-header" *ngIf="searchResults.length > 0">
          <span>{{ totalResults }} products found</span>
          <span class="search-time" *ngIf="searchTime">
            ({{ searchTime }}ms)
          </span>
        </div>
        
        <div class="loading-indicator" *ngIf="isSearching">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Searching products...</span>
        </div>
        
        <div class="no-results" *ngIf="!isSearching && searchResults.length === 0 && currentQuery">
          <mat-icon>search_off</mat-icon>
          <h3>No products found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
        
        <div class="product-grid" *ngIf="searchResults.length > 0">
          <div class="product-card"
               *ngFor="let product of searchResults; trackBy: trackByProductId"
               (click)="viewProduct(product)">
            <div class="product-image">
              <img [src]="product.imageUrl" [alt]="product.name" loading="lazy">
            </div>
            <div class="product-info">
              <h3 class="product-name" [innerHTML]="highlightSearchTerms(product.name)"></h3>
              <p class="product-description" [innerHTML]="highlightSearchTerms(product.description)"></p>
              <div class="product-metadata">
                <span class="product-price">${{ product.price | number:'1.2-2' }}</span>
                <span class="product-rating" *ngIf="product.rating">
                  <mat-icon>star</mat-icon>
                  {{ product.rating | number:'1.1-1' }}
                </span>
                <span class="product-category">{{ product.category }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <mat-paginator
          *ngIf="searchResults.length > 0"
          [length]="totalResults"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .product-search-mfe {
      padding: 2rem;
    }
    
    .search-header {
      margin-bottom: 2rem;
    }
    
    .search-info {
      margin-top: 0.5rem;
      color: #666;
    }
    
    .search-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .search-filters mat-form-field {
      min-width: 200px;
    }
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .search-time {
      color: #666;
      font-size: 0.875rem;
    }
    
    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      color: #666;
    }
    
    .no-results {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .product-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .product-card:hover {
      border-color: #2196f3;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
      transform: translateY(-2px);
    }
    
    .product-image {
      height: 200px;
      overflow: hidden;
      background: #f5f5f5;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      padding: 1rem;
    }
    
    .product-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 500;
      line-height: 1.3;
    }
    
    .product-description {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-metadata {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .product-price {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2196f3;
    }
    
    .product-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #ff9800;
    }
    
    .product-rating mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .product-category {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 500;
    }
    
    .highlight {
      background-color: #ffeb3b;
      font-weight: 600;
    }
  `]
})
export class ProductSearchMfeComponent implements OnInit, OnDestroy {
  currentQuery = '';
  isSearching = false;
  searchResults: any[] = [];
  totalResults = 0;
  searchTime = 0;
  
  selectedCategory = '';
  selectedPriceRange = '';
  sortBy = 'relevance';
  pageSize = 25;
  currentPage = 0;
  
  categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private searchEventBridge: SearchEventBridgeService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    // Configure search event bridge for this MFE
    this.searchEventBridge.configure({
      moduleId: 'product-search-mfe',
      enableLogging: true,
      debounceTime: 300
    });

    // Subscribe to global search queries
    this.searchEventBridge.subscribeToQuery(
      (query) => {
        this.currentQuery = query;
        if (query) {
          this.performSearch(query);
        } else {
          this.clearResults();
        }
      },
      {
        source: ['shell', 'product-search-mfe'],
        debounceTime: 300
      }
    );

    // Subscribe to search suggestions requests
    this.searchEventBridge.subscribe(
      SearchEventType.SEARCH_SUGGESTIONS_REQUESTED,
      (event) => {
        this.provideSuggestions(event.payload.query);
      },
      {
        debounceTime: 200
      }
    );

    // Subscribe to filter changes from other modules
    this.searchEventBridge.subscribeToFilters(
      (filtersEvent) => {
        this.applyExternalFilters(filtersEvent);
      }
    );

    // Subscribe to search clear events
    this.searchEventBridge.subscribe(
      SearchEventType.SEARCH_CLEARED,
      () => {
        this.clearResults();
      }
    );

    // Load initial state
    const currentState = this.searchEventBridge.getCurrentState();
    if (currentState.query) {
      this.currentQuery = currentState.query;
      this.performSearch(currentState.query);
    }
  }

  private performSearch(query: string) {
    if (!query.trim()) {
      this.clearResults();
      return;
    }

    this.isSearching = true;
    const startTime = Date.now();

    const searchParams = {
      query,
      category: this.selectedCategory,
      priceRange: this.selectedPriceRange,
      sortBy: this.sortBy,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productService.searchProducts(searchParams).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Search error:', error);
        return of({ results: [], totalCount: 0 });
      })
    ).subscribe(response => {
      this.searchTime = Date.now() - startTime;
      this.isSearching = false;
      this.searchResults = response.results;
      this.totalResults = response.totalCount;

      // Emit results to other modules
      this.searchEventBridge.updateResults({
        results: response.results.map(product => ({
          id: product.id,
          title: product.name,
          description: product.description,
          url: `/products/${product.id}`,
          type: 'product',
          category: product.category,
          score: product.relevanceScore,
          metadata: {
            price: product.price,
            rating: product.rating,
            imageUrl: product.imageUrl
          }
        })),
        totalCount: response.totalCount,
        query,
        filters: this.getCurrentFilters(),
        pagination: {
          page: this.currentPage,
          pageSize: this.pageSize,
          totalPages: Math.ceil(response.totalCount / this.pageSize),
          hasNext: (this.currentPage + 1) * this.pageSize < response.totalCount,
          hasPrevious: this.currentPage > 0
        },
        executionTime: this.searchTime
      });
    });
  }

  private provideSuggestions(query: string) {
    if (query.length < 2) return;

    this.productService.getSearchSuggestions(query).pipe(
      takeUntil(this.destroy$),
      catchError(() => of({ suggestions: [], categories: [] }))
    ).subscribe(response => {
      // Emit suggestions
      this.searchEventBridge.emit(SearchEventType.SEARCH_SUGGESTIONS_RECEIVED, {
        query,
        suggestions: response.suggestions,
        categories: [{
          name: 'products',
          label: 'Products',
          suggestions: response.suggestions.filter(s => s.type === 'product'),
          maxSuggestions: 5
        }, {
          name: 'categories',
          label: 'Categories',
          suggestions: response.suggestions.filter(s => s.type === 'category'),
          maxSuggestions: 3
        }]
      });
    });
  }

  onCategoryChange() {
    this.currentPage = 0;
    this.updateFiltersAndSearch();
  }

  onPriceRangeChange() {
    this.currentPage = 0;
    this.updateFiltersAndSearch();
  }

  onSortChange() {
    this.currentPage = 0;
    this.updateFiltersAndSearch();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  private updateFiltersAndSearch() {
    // Emit filter changes
    this.searchEventBridge.updateFilters({
      filters: this.getCurrentFilters(),
      appliedFilters: this.getAppliedFilters(),
      availableFilters: this.getAvailableFilters()
    });

    // Perform search with new filters
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  private getCurrentFilters(): any {
    return {
      categories: this.selectedCategory ? [this.selectedCategory] : [],
      priceRange: this.selectedPriceRange || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortBy.includes('desc') ? 'desc' : 'asc'
    };
  }

  private getAppliedFilters(): any[] {
    const filters = [];
    
    if (this.selectedCategory) {
      const category = this.categories.find(c => c.value === this.selectedCategory);
      filters.push({
        key: 'category',
        value: this.selectedCategory,
        label: `Category: ${category?.label}`,
        removable: true
      });
    }
    
    if (this.selectedPriceRange) {
      filters.push({
        key: 'priceRange',
        value: this.selectedPriceRange,
        label: `Price: $${this.selectedPriceRange}`,
        removable: true
      });
    }
    
    return filters;
  }

  private getAvailableFilters(): any[] {
    return [
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: this.categories.map(c => ({ value: c.value, label: c.label }))
      },
      {
        key: 'priceRange',
        label: 'Price Range',
        type: 'select',
        options: [
          { value: '0-50', label: '$0 - $50' },
          { value: '50-100', label: '$50 - $100' },
          { value: '100-200', label: '$100 - $200' },
          { value: '200+', label: '$200+' }
        ]
      }
    ];
  }

  private applyExternalFilters(filtersEvent: any) {
    // Apply filters from other modules
    const filters = filtersEvent.filters;
    
    if (filters.categories && filters.categories.length > 0) {
      this.selectedCategory = filters.categories[0];
    }
    
    if (filters.priceRange) {
      this.selectedPriceRange = filters.priceRange;
    }
    
    // Refresh search with new filters
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  private clearResults() {
    this.searchResults = [];
    this.totalResults = 0;
    this.searchTime = 0;
    this.isSearching = false;
    this.currentPage = 0;
  }

  viewProduct(product: any) {
    // Navigate to product detail
    console.log('Viewing product:', product);
  }

  highlightSearchTerms(text: string): string {
    if (!this.currentQuery || !text) return text;
    
    const regex = new RegExp(`(${this.currentQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  trackByProductId(index: number, product: any): any {
    return product.id;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Product Service (simplified)
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  searchProducts(params: any): Observable<any> {
    // Implementation for product search API
    return of({
      results: [],
      totalCount: 0
    });
  }

  getSearchSuggestions(query: string): Observable<any> {
    // Implementation for search suggestions API
    return of({
      suggestions: [],
      categories: []
    });
  }
}
```

## Advanced Usage Patterns

### Event Correlation Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class SearchEventCorrelationService {
  private correlationMap = new Map<string, SearchEvent[]>();
  private maxCorrelationAge = 5 * 60 * 1000; // 5 minutes

  constructor(private searchEventBridge: SearchEventBridgeService) {
    this.initializeCorrelationTracking();
  }

  private initializeCorrelationTracking() {
    this.searchEventBridge.events$.subscribe(event => {
      if (event.correlationId) {
        this.addToCorrelation(event.correlationId, event);
      }
    });

    // Cleanup old correlations
    setInterval(() => {
      this.cleanupOldCorrelations();
    }, 60000); // Every minute
  }

  private addToCorrelation(correlationId: string, event: SearchEvent) {
    if (!this.correlationMap.has(correlationId)) {
      this.correlationMap.set(correlationId, []);
    }
    this.correlationMap.get(correlationId)!.push(event);
  }

  getCorrelatedEvents(correlationId: string): SearchEvent[] {
    return this.correlationMap.get(correlationId) || [];
  }

  private cleanupOldCorrelations() {
    const now = Date.now();
    for (const [correlationId, events] of this.correlationMap.entries()) {
      const oldestEvent = events[0];
      if (now - oldestEvent.timestamp.getTime() > this.maxCorrelationAge) {
        this.correlationMap.delete(correlationId);
      }
    }
  }
}
```

### Search Analytics Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class SearchAnalyticsService {
  private analytics: SearchAnalytics[] = [];
  private maxAnalyticsAge = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private searchEventBridge: SearchEventBridgeService) {
    this.initializeAnalyticsTracking();
  }

  private initializeAnalyticsTracking() {
    this.searchEventBridge.queryEvents$.subscribe(event => {
      this.trackSearchQuery(event.payload);
    });

    this.searchEventBridge.resultsEvents$.subscribe(event => {
      this.trackSearchResults(event.payload);
    });
  }

  private trackSearchQuery(queryEvent: SearchQueryEvent) {
    const analytics: SearchAnalytics = {
      id: this.generateAnalyticsId(),
      query: queryEvent.query,
      source: queryEvent.source,
      context: queryEvent.context,
      timestamp: new Date(),
      resultCount: 0,
      executionTime: 0,
      userInteractions: []
    };

    this.analytics.push(analytics);
    this.cleanupOldAnalytics();
  }

  private trackSearchResults(resultsEvent: SearchResultsEvent) {
    const recentAnalytics = this.analytics
      .filter(a => a.query === resultsEvent.query)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (recentAnalytics) {
      recentAnalytics.resultCount = resultsEvent.totalCount;
      recentAnalytics.executionTime = resultsEvent.executionTime || 0;
    }
  }

  getSearchAnalytics(timeRange?: { start: Date; end: Date }): SearchAnalytics[] {
    let analytics = [...this.analytics];

    if (timeRange) {
      analytics = analytics.filter(a => 
        a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
      );
    }

    return analytics;
  }

  getPopularQueries(limit: number = 10): { query: string; count: number }[] {
    const queryCount = new Map<string, number>();
    
    this.analytics.forEach(a => {
      const count = queryCount.get(a.query) || 0;
      queryCount.set(a.query, count + 1);
    });

    return Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private generateAnalyticsId(): string {
    return `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldAnalytics() {
    const now = Date.now();
    this.analytics = this.analytics.filter(a => 
      now - a.timestamp.getTime() < this.maxAnalyticsAge
    );
  }
}

interface SearchAnalytics {
  id: string;
  query: string;
  source: string;
  context?: SearchContext;
  timestamp: Date;
  resultCount: number;
  executionTime: number;
  userInteractions: UserInteraction[];
}

interface UserInteraction {
  type: 'click' | 'view' | 'filter' | 'sort';
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## Best Practices

### 1. Event Naming và Structure

```typescript
// ✅ Good: Descriptive event types
export enum SearchEventType {
  SEARCH_QUERY_CHANGED = 'search-query-changed',
  SEARCH_RESULTS_UPDATED = 'search-results-updated'
}

// ❌ Bad: Generic event types
export enum SearchEventType {
  UPDATE = 'update',
  CHANGE = 'change'
}

// ✅ Good: Structured event payload
interface SearchQueryEvent {
  query: string;
  previousQuery?: string;
  source: 'user-input' | 'programmatic' | 'suggestion';
  context?: SearchContext;
}

// ❌ Bad: Unstructured payload
interface SearchQueryEvent {
  data: any;
}
```

### 2. Module Identification

```typescript
// ✅ Good: Clear module identification
const config: SearchEventBridgeConfig = {
  moduleId: 'product-catalog-mfe',
  enableLogging: environment.production ? false : true
};

// ❌ Bad: Generic or missing module ID
const config: SearchEventBridgeConfig = {
  moduleId: 'module1'
};
```

### 3. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
this.searchEventBridge.subscribe(
  SearchEventType.SEARCH_QUERY_CHANGED,
  (event) => {
    try {
      this.handleSearchQuery(event.payload);
    } catch (error) {
      console.error('Error handling search query:', error);
      // Emit error event for monitoring
      this.searchEventBridge.emit(SearchEventType.SEARCH_ERROR, {
        error: error.message,
        originalEvent: event,
        module: 'product-catalog-mfe'
      });
    }
  },
  {
    debounceTime: 300,
    filterPredicate: (event) => event.source !== 'internal'
  }
);
```

### 4. Memory Management

```typescript
// ✅ Good: Proper subscription management
export class SearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const subscription = this.searchEventBridge.subscribeToQuery(
      (query) => this.handleQuery(query)
    );
    
    this.subscriptions.push(subscription);
    
    // Or use takeUntil pattern
    this.searchEventBridge.currentQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => this.handleQuery(query));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### 5. Performance Optimization

```typescript
// ✅ Good: Debouncing và throttling
this.searchEventBridge.subscribeToQuery(
  (query) => this.performSearch(query),
  {
    debounceTime: 300, // Wait 300ms after last input
    source: ['shell', 'search-widget']
  }
);

// ✅ Good: Conditional event emission
if (this.shouldEmitEvent(newQuery, oldQuery)) {
  this.searchEventBridge.updateQuery(newQuery);
}

private shouldEmitEvent(newQuery: string, oldQuery: string): boolean {
  return newQuery !== oldQuery && newQuery.length >= 2;
}
```

## Performance Considerations

### 1. Event Frequency Management
- Sử dụng debouncing cho user input events
- Implement throttling cho high-frequency events
- Limit event history size để tránh memory leaks

### 2. Payload Optimization
- Chỉ include necessary data trong event payload
- Sử dụng references thay vì full objects khi có thể
- Implement payload compression cho large datasets

### 3. Subscription Management
- Unsubscribe properly để tránh memory leaks
- Sử dụng shareReplay() cho shared observables
- Implement subscription pooling cho similar subscriptions

## Troubleshooting

### Common Issues

**1. Events không được receive**
```typescript
// Check module configuration
console.log('Module ID:', this.searchEventBridge.getConfig().moduleId);

// Check subscription filters
this.searchEventBridge.subscribe(
  SearchEventType.SEARCH_QUERY_CHANGED,
  (event) => console.log('Received event:', event),
  {
    source: ['shell'], // Make sure source matches
    enableLogging: true
  }
);
```

**2. Memory leaks**
```typescript
// Monitor subscription count
console.log('Active subscriptions:', this.subscriptions.length);

// Check for unsubscribed observables
this.searchEventBridge.events$
  .pipe(
    takeUntil(this.destroy$), // Always use takeUntil
    tap(() => console.log('Event received'))
  )
  .subscribe();
```

**3. Performance issues**
```typescript
// Monitor event frequency
this.searchEventBridge.events$
  .pipe(
    tap(() => console.log('Event at:', new Date())),
    throttleTime(100) // Add throttling if needed
  )
  .subscribe();
```

## Dependencies

- `@angular/core`: Angular framework
- `rxjs`: Reactive programming
- `@cci-web/shared`: Shared utilities và types
- `@cci-web/core`: Core services và adapters

## Related Services

- **API Service**: Thực hiện search requests
- **Loading Spinner Service**: Hiển thị loading states
- **Notification Service**: Hiển thị search errors
- **Responsive Service**: Responsive search UI
- **Browser Refresh Service**: Persist search state