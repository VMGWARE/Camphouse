import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "~/stores/useAuthStore";

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();

  if (auth.isLoggedIn || auth.token) {
    // Decode the token
    let decoded = null;
    try {
      decoded = auth.token ? jwtDecode(auth.token) : null;
    } catch (e) {}

    // Check if the token is invalid or expired
    if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
      console.log("Token is invalid or expired");
    } else {
      return navigateTo("/", { replace: true });
    }
  }
});
