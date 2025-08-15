export default {
  title: "CCI Web",
  description: "An awesome docs template built by me",
  lang: "en-US",
  cleanUrls: true,
  // If this is disabled, when building it it will give deadlink errors if your markdown has the wrong links
  ignoreDeadLinks: true,

  themeConfig: {
    logo: "/logo.png",
    siteTitle: "CCI Web",
    search: {
      provider: "local",
    },
    // Navbar Link
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/docs" },
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
          { text: "Overview", link: "/version/v0.0.1/overview" },
          { text: "Installation", link: "/version/v0.0.1/installation" },
          { text: "Usage Guide", link: "/version/v0.0.1/usage" },
          { text: "Examples", link: "/version/v0.0.1/examples" },
          { text: "Troubleshooting", link: "/version/v0.0.1/troubleshooting" },
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
              { text: "Quick Start", link: "/version/v0.0.1/core/quick-start" },
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
                  { text: "Interceptors", link: "/version/v0.0.1/core/config/interceptors" },
                  { text: "Models", link: "/version/v0.0.1/core/config/models" },
                  { text: "Providers", link: "/version/v0.0.1/core/config/providers" },
                  { text: "Services", link: "/version/v0.0.1/core/config/services" },
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
      message: "Được phát triển bởi team CCI",
      copyright: "Copyright © 2025-present Adocs",
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
