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
                text: "Constants",
                collapsible: true,
                collapsed: false,
                items: [
                  {
                    text: "Introduction",
                    link: "/core/config/introduction",
                  },
                  { text: "AppAggregateConfig", link: "/core/config/app-aggregate-config" },
                  { text: "Runtime Access", link: "/core/config/runtime-access" },
                  { text: "BREAKPOINTS_VALUE", link: "/core/constants/breakpoint-constants" },
                  { text: "ConfigValues", link: "/core/constants/config-enum" },
                  { text: "ViewType", link: "/core/constants/view-type-enum" },
                ],
              },
              {
                text: "Helpers",
                collapsible: false,
                collapsed: false,
                items: [
                  {
                    text: "Introduction",
                    link: "/core/helpers/introduction",
                  },
                  { text: "baseOwlOption", link: "/core/helpers/base-owl-option" },
                  { text: "onDraggingToStopLink", link: "/core/helpers/on-dragging-to-stop-link" },
                ],
              },
              {
                text: "Interceptors",
                collapsible: false,
                collapsed: false,
                items: [
                  {
                    text: "Introduction",
                    link: "/core/interceptors/introduction",
                  },
                  { text: "duplicateRequestInterceptor", link: "/core/interceptors/duplicate-request" },
                  { text: "loadingBarInterceptor", link: "/core/interceptors/loading-bar" },
                ],
              },
              {
                text: "Models",
                collapsible: true,
                collapsed: false,
                items: [
                  { text: "AppUserPrincipal", link: "/core/models/app-user-principal" },
                  { text: "BreadcrumbRes", link: "/core/models/breadcrumb-res" },
                  { text: "Paging", link: "/core/models/paging" },
                  { text: "SeoSocialShareData", link: "/core/models/seo-social-share-data" },
                ],
              },
              {
                text: "Providers",
                collapsible: true,
                collapsed: false,
                items: [
                  { text: "CCI_WEB_APP_NAME", link: "/core/providers/app-config" },
                  { text: "getBaseProviders", link: "/core/providers/base-providers" },
                ],
              },
              {
                text: "Services",
                collapsible: true,
                collapsed: false,
                items: [
                  {
                    text: "Introduction",
                    link: "/core/services/introduction",
                  },
                  { text: "ApiService", link: "/core/services/api-service" },
                  { text: "BreakpointService", link: "/core/services/breakpoint-service" },
                  { text: "CacheService", link: "/core/services/cache-service" },
                  // { text: "CookieService", link: "/core/services/cookie-service" },
                  // { text: "LocalStorageService", link: "/core/services/local-storage-service" },
                  // { text: "SeoService", link: "/core/services/seo-service" },
                ],
              },
              {
                text: "Utils",
                collapsible: true,
                collapsed: false,
                items: [
                  { text: "fetchFederationManifest", link: "/core/utils/fetch-federation-manifest" },
                  { text: "SubSink", link: "/core/utils/sub-sink" },
                  { text: "UnsubscribeOnDestroyAdapter", link: "/core/utils/unsubscribe-on-destroy-adapter" },
                  { text: "FlagBasedPreloadingStrategy", link: "/core/utils/flag-based-preloading-strategy" },
                ],
              },
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
