import { defineConfig } from "vitepress";

export default defineConfig({
  title: "CCI Web Docs",
  description: "Documentation for CCI Web micro frontends",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Core", link: "/core/overview" },
      { text: "Shared", link: "/shared/overview" },
    ],
    sidebar: {
      "/core/": [
        {
          text: "Core",
          items: [
            { text: "Overview", link: "/core/overview" },
            { text: "Getting Started", link: "/core/getting-started" },
            { text: "Providers", link: "/core/providers" },
            { text: "Services", link: "/core/services" },
            { text: "Interceptors", link: "/core/interceptors" },
          ],
        },
      ],
      "/shared/": [
        {
          text: "Shared",
          items: [{ text: "Overview", link: "/shared/overview" }],
        },
      ],
      "/": [
        {
          text: "Guide",
          items: [{ text: "Introduction", link: "/" }],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/" }],
  },
});
