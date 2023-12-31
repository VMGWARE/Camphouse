// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    buildAssetsDir: "/_static/",
    head: {
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          charset: "utf-8",
        },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/img/icons/favicon.png" },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
          integrity:
            "sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
          crossorigin: "anonymous",
        },
      ],
    },
  },
  modules: [
    "nuxt-icon",
    ["@nuxtjs/robots", { configPath: "~/config/robots.js" }],
    "nuxt-simple-sitemap",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
  ],
  runtimeConfig: {
    public: {
      backendApi: "http://127.0.0.1:5000", // can be overridden by NUXT_PUBLIC_BACKEND_API environment variable
      baseUrl: "http://localhost:3000", // can be overridden by NUXT_PUBLIC_BASE_URL environment variable
    },
  },
  css: [
    "~/assets/stylesheets/style.css",
    "vue-toastification/dist/index.css",
    "vue-final-modal/style.css",
  ],
  piniaPersistedstate: {
    cookieOptions: {
      sameSite: "strict",
    },
    storage: "localStorage",
  },
  sourcemap: {
    server: true,
    client: true,
  },
});
