import { defineStore } from "pinia";
import { useApiFetch } from "~/composables/useApiFetch";

type User = {
  _id: string;
  admin: boolean;
  handle: string;
};

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const isLoggedIn = computed(() => !!user.value);

    async function logout() {
      // Logout the user
      await useApiFetch("/v1/auth/logout", { method: "POST" });

      // Clear the user and token cookies
      user.value = null;
      const tokenCookie = useCookie("token");
      tokenCookie.value = "";

      // Redirect to the login page
      navigateTo("/login");
    }

    async function fetchUser() {
      const { data } = await useApiFetch("/auth/me");
      user.value = data.value as User;
    }

    return {
      user,
      isLoggedIn,
      fetchUser,
      logout,
    };
  },
  {
    persist: {
      storage: persistedState.cookiesWithOptions({
        sameSite: "strict",
      }),
    },
  }
);
