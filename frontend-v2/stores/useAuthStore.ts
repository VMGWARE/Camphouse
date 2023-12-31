import { defineStore } from "pinia";
import { useApiFetch } from "~/composables/useApiFetch";

type User = {
  id: string;
  name: string;
  email: string;
};

type Credentials = {
  email: string;
  password: string;
};

type RegistrationInfo = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
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

    async function login(credentials: Credentials) {
      const login = await useApiFetch("/auth/login", {
        method: "POST",
        body: credentials,
      });

      await fetchUser();

      return login;
    }

    async function register(info: RegistrationInfo) {
      const register = await useApiFetch("/auth/register", {
        method: "POST",
        body: info,
      });

      return register;
    }

    return {
      user,
      login,
      isLoggedIn,
      fetchUser,
      logout,
      register,
      token,
    };
  },
  {
    persist: {
      storage: persistedState.cookiesWithOptions({
        sameSite: "strict",
      }),
    },
  },
);
