import { defineStore } from "pinia";
import { useApiFetch } from "~/composables/useApiFetch";

type User = {
  _id: string;
  email: string;
  username: string;
  profilePicture: string;
  bio: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  handle: string;
  verified: boolean;
};

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const isLoggedIn = computed(() => !!user.value);
    const token = ref<string | null>(null);

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
      logout,
      token,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  }
);
