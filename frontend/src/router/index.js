import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import store from "../store/index";

const router = createRouter({
  mode: "history",
  linkActiveClass: "active",
  linkExactActiveClass: "active",
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

const updateDocumentTitle = (to, from) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);
  const previousNearestWithMeta = from.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);

  if (nearestWithTitle) {
    document.title = `${nearestWithTitle.meta.title} - Camphouse`;
  } else if (previousNearestWithMeta) {
    document.title = previousNearestWithMeta.meta.title;
  }
};

const updateMetaTags = (to) => {
  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);

  Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map(
    (el) => el.parentNode.removeChild(el)
  );

  if (!nearestWithMeta) return;

  nearestWithMeta.meta.metaTags
    .map((tagDef) => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key]);
      });

      tag.setAttribute("data-vue-router-controlled", "");

      return tag;
    })
    .forEach((tag) => document.head.appendChild(tag));
};

/* eslint-disable */

const handleAuthRedirection = (to, from, next) => {
  const isLoggedIn = store.getters.loggedIn;

  const publicPaths = ["/login", "/signup", "/about", "/"];
  const publicPathPatterns = [
    /^\/@[^/]+$/,       // Matches paths like /@RollViral
    /^\/post\/[^/]+$/   // Matches paths like /post/65faff92ebc47fed0299246c
  ];

  const isPublicPath = publicPaths.includes(to.path) || publicPathPatterns.some((pattern) => pattern.test(to.path));

  if (!isLoggedIn && !isPublicPath) {
    console.log("Redirecting to login");
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (isLoggedIn && publicPaths.includes(to.path)) {
    console.log("Redirecting to home");
    return next({ path: "/" });
  }

  next();
};

router.beforeEach((to, from, next) => {
  updateDocumentTitle(to, from);
  updateMetaTags(to);
  handleAuthRedirection(to, from, next);
});

export default router;
