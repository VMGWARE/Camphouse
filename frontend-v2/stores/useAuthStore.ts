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

    function logout() {
      // No call made as we are using JWT
      // await useApiFetch("/logout", { method: "POST" });
      user.value = null;
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
      logout
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
