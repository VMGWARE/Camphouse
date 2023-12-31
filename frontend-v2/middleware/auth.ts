import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "~/stores/useAuthStore";

export default defineNuxtRouteMiddleware((to) => {
  try {
    const auth = useAuthStore();

    const goToLogin = () => {
      const originalDestination = to.fullPath;

      return navigateTo({
        path: "/login",
        query: { redirect: originalDestination },
      });
    };

    if (!auth.isLoggedIn || !auth.token) {
      return goToLogin();
    }

    // Decode the token
    let decoded = null;
    try {
      decoded = jwtDecode(auth.token);
    } catch (e) {
      return goToLogin();
    }

    // Check if the token is invalid or expired
    if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
      return goToLogin();
    }
  } catch (e) {
    console.error(e);
    return navigateTo({ path: "/login" });
  }
});
