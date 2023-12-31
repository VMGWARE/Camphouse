import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "~/stores/useAuthStore";

export default defineNuxtRouteMiddleware((to) => {
  try {
    const auth = useAuthStore();
    const token = useCookie("token");

    const goToLogin = () => {
      const originalDestination = to.fullPath;

      return navigateTo({
        path: "/login",
        query: { redirect: originalDestination },
      });
    };

    if (!auth.isLoggedIn || !token.value) {
      return goToLogin();
    }

    // Decode the token
    let decoded = null;
    try {
      decoded = jwtDecode(token.value);
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
