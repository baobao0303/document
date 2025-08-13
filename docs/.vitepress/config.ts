export default {
  title: "CCI Web",
  description: "An awesome docs template built by me",
  lang: "en-US",
  cleanUrls: true,
  // If this is disabled, when building it it will give deadlink errors if your markdown has the wrong links
  ignoreDeadLinks: true,

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "CCI Web",
    search: {
      provider: "local",
    },
    // Navbar Link
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/docs" },

      // { text: "About", link: "/about" },
      // { text: "Contact", link: "/contact" },
      // { text: "Guide", link: "/guide" },
      // { text: "Configs", link: "/configs" },
      {
        // Dropdown Menu
        text: "Version",
        items: [
          { text: "v0.0.1", link: "/item-1" },
          { text: "v0.0.2", link: "/item-2" },
          { text: "v0.0.3", link: "/item-3" },
        ],
      },
    ],
    // Social Icons
    socialLinks: [{ icon: "github", link: "https://www.npmjs.com/package/@cci-web/core" }],
    // Sidebar
    sidebar: [
      {
        text: "Library",
        collapsible: true,
        collapsed: false,
        items: [
          {
            text: "@cci-web/core",
            collapsed: false,
            items: [
              { text: "Introduction", link: "/core/introduction" },
              { text: "Installation & Requirements", link: "/core/installation" },
              { text: "Quick Start", link: "/core/quick-start" },
              {
                text: "Configuration & Initialization",
                items: [
                  { text: "AppAggregateConfig", link: "/core/config/app-aggregate-config" },
                  { text: "Runtime Access", link: "/core/config/runtime-access" },
                ],
              },
              {
                text: "Services & API",
                items: [
                  { text: "HTTP Interceptors", link: "/core/http/interceptors" },
                  { text: "ApiService", link: "/core/http/api-service" },
                  { text: "RequestCacheService", link: "/core/http/request-cache-service" },
                  { text: "Overlay & Loader", link: "/core/services/overlay-loader" },
                  { text: "SEOService", link: "/core/services/seo-service" },
                  { text: "ResponsiveService", link: "/core/services/responsive-service" },
                ],
              },
              {
                text: "Storage & Responsive",
                items: [
                  { text: "LocalStorageService", link: "/core/storage/local-storage-service" },
                  { text: "SessionStorageService", link: "/core/storage/session-storage-service" },
                  { text: "CookieService", link: "/core/storage/cookie-service" },
                  { text: "BreakpointService", link: "/core/responsive/breakpoint-service" },
                  { text: "BREAKPOINTS_VALUE", link: "/core/responsive/breakpoints-value" },
                ],
              },
              {
                text: "Utilities & Helpers",
                items: [
                  { text: "federation-utils", link: "/core/utils/federation-utils" },
                  { text: "provideBaseAppProviders", link: "/core/providers/provide-base-app-providers" },
                  { text: "providePlatformConfig", link: "/core/providers/provide-platform-config" },
                  { text: "provideEnumsFromConfig", link: "/core/providers/provide-enums-from-config" },
                ],
              },
              { text: "Contributing", link: "/core/contributing" },
            ],
          },
          {
            text: "@cci-web/shared",
            collapsed: true,
            items: [
              { text: "Introduction", link: "/shared/introduction" },
              { text: "Installation & Requirements", link: "/shared/installation" },
            ],
          },
        ],
      },
    ],
    // you can disable the previous and next page here
    docFooter: {
      prev: false,
      next: true,
    },
    editLink: {
      pattern: "https://github.com/Evavic44/adocs/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Adocs",
    },
    markdown: {
      theme: "material-palenight",
      lineNumbers: true,
    },
    // Mobile Config only
    returnToTopLabel: "Go to Top",
    sidebarMenuLabel: "Menu",
  },
};
