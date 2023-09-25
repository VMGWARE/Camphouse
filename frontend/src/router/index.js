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

const handleAuthRedirection = (to, from, next) => {
  const isLoggedIn = store.getters.loggedIn;

  const authPaths = ["/login", "/signup"];
  const publicPaths = ["/post/"]; // Define paths that are publicly accessible

  if (
    !isLoggedIn &&
    !authPaths.includes(to.path) &&
    !publicPaths.some((path) => to.path.startsWith(path))
  ) {
    console.log("Redirecting to login");
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (isLoggedIn && authPaths.includes(to.path)) {
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
