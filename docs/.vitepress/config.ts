export default {
  title: "CCI Web",
  description: "An awesome docs template built by me",
  lang: "en-US",
  cleanUrls: true,
  // If this is disabled, when building it it will give deadlink errors if your markdown has the wrong links
  ignoreDeadLinks: true,

  themeConfig: {
    logo: "https://cdn1.concung.com/themes/desktop4.1/image/logo-concung.png",
    siteTitle: false,
    search: {
      provider: "local",
    },
    // Navbar Link
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/version/v0.0.1" },
      {
        // Dropdown Menu
        text: "Version",
        items: [{ text: "v0.0.1", link: "/version/v0.0.1" }],
      },
    ],
    // Social Icons
    socialLinks: [{ icon: "github", link: "https://www.npmjs.com/package/@cci-web/core" }],
    // Sidebar
    sidebar: [
      {
        text: "Getting Started",
        collapsible: true,
        collapsed: false,
        items: [
          { text: "Introduction", link: "/version/v0.0.1/get-started/introduction" },
          { text: "Installation", link: "/version/v0.0.1/get-started/installation" },
          { text: "Provider Setup", link: "/version/v0.0.1/get-started/provider-setup" },
        ],
      },
      {
        text: "Library",
        collapsible: true,
        collapsed: true,
        items: [
          {
            text: "@cci-web/core",
            collapsed: true,
            items: [
              { text: "Introduction", link: "/version/v0.0.1/core/introduction" },
              { text: "Installation & Requirements", link: "/version/v0.0.1/core/installation" },
              {
                text: "Config Module",
                collapsible: true,
                collapsed: false,
                items: [
                  {
                    text: "Introduction",
                    link: "/version/v0.0.1/core/config/introduction",
                  },
                  { text: "Constants", link: "/version/v0.0.1/core/config/constants" },
                  { text: "Interceptors", link: "/version/v0.0.1/core/config/interceptors/interceptors" },
                  { text: "Models", link: "/version/v0.0.1/core/config/models/models" },
                  { text: "Providers", link: "/version/v0.0.1/core/config/providers" },

                  {
                    text: "Services",
                    collapsible: true,
                    collapsed: true,
                    items: [
                      {
                        text: "UI Services",
                        collapsible: true,
                        collapsed: true,
                        items: [
                          { text: "Breakpoint Service", link: "/version/v0.0.1/core/config/services/ui/breakpoint" },
                          { text: "Loading Spinner Service", link: "/version/v0.0.1/core/config/services/ui/loading-spinner" },
                          { text: "Notification Service", link: "/version/v0.0.1/core/config/services/ui/notification" },
                          { text: "Open Menu Service", link: "/version/v0.0.1/core/config/services/ui/open-menu" },
                          { text: "Overlay Service", link: "/version/v0.0.1/core/config/services/ui/overlay" },
                          { text: "Responsive Service", link: "/version/v0.0.1/core/config/services/ui/responsive" },
                          { text: "Search Event Bridge Service", link: "/version/v0.0.1/core/config/services/ui/search-event-bridge" },
                        ],
                      },
                      {
                        text: "Common Services",
                        collapsible: true,
                        collapsed: true,
                        items: [
                          { text: "API Service", link: "/version/v0.0.1/core/config/services/common/api" },
                          { text: "Auth Service", link: "/version/v0.0.1/core/config/services/common/auth" },
                          { text: "Base API Service", link: "/version/v0.0.1/core/config/services/common/base-api" },
                          { text: "Browser Refresh Service", link: "/version/v0.0.1/core/config/services/common/browser-refresh" },
                          { text: "Config Merge Service", link: "/version/v0.0.1/core/config/services/common/config-merge" },
                          { text: "Cookie Service", link: "/version/v0.0.1/core/config/services/common/cookie" },
                          { text: "Document Service", link: "/version/v0.0.1/core/config/services/common/document" },
                          { text: "Platform Service", link: "/version/v0.0.1/core/config/services/common/platform" },
                          { text: "Request Cache Service", link: "/version/v0.0.1/core/config/services/common/request-cache" },
                          { text: "SEO Service", link: "/version/v0.0.1/core/config/services/common/seo" },
                          { text: "Window Service", link: "/version/v0.0.1/core/config/services/common/window" },
                        ],
                      },
                      {
                        text: "Remote Services",
                        collapsible: true,
                        collapsed: true,
                        items: [
                          { text: "App Initialize Service", link: "/version/v0.0.1/core/config/services/remote/app-initialize" },
                          { text: "Loader Service", link: "/version/v0.0.1/core/config/services/remote/loader" },
                          { text: "Remote CSS Service", link: "/version/v0.0.1/core/config/services/remote/remote-css" },
                        ],
                      },
                    ],
                  },
                  { text: "Storage", link: "/version/v0.0.1/core/config/storage" },
                  { text: "Utils", link: "/version/v0.0.1/core/config/utils" },
                ],
              },
            ],
          },
          {
            text: "@cci-web/shared",
            collapsed: true,
            items: [
              { text: "Introduction", link: "/version/v0.0.1/shared/introduction" },
              { text: "Installation & Requirements", link: "/version/v0.0.1/shared/installation" },
              { text: "Components", link: "/version/v0.0.1/shared/components" },
              { text: "Directives", link: "/version/v0.0.1/shared/directives" },
              { text: "Pipes", link: "/version/v0.0.1/shared/pipes" },
              { text: "Provider", link: "/version/v0.0.1/shared/provider" },
              { text: "Utils", link: "/version/v0.0.1/shared/utils" },
            ],
          },
          {
            text: "@cci-web/server",
            collapsed: true,
            items: [
              { text: "Introduction", link: "/version/v0.0.1/server/introduction" },
              { text: "Installation & Requirements", link: "/version/v0.0.1/server/installation" },
              { text: "Node Server", link: "/version/v0.0.1/server/node-server" },
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
      message: 'A library created with ❤️ by <a href="https://github.com/your-username" target="_blank">this guy</a>',
      copyright: "© 2023 CCI Web",
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
