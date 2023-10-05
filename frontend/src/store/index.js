import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
// import * as Cookies from "js-cookie";
import axios from "axios";
import router from "@/router";
// If in development mode, use localhost, else use the production url
if (process.env.NODE_ENV === "development") {
  axios.defaults.baseURL = "http://localhost:3000/api";
} else {
  axios.defaults.baseURL = "/api";
}

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || [],
    token: localStorage.getItem("token") || null,
    loggedIn: !!localStorage.getItem("token"),
  },
  getters: {
    loggedIn(state) {
      return state.loggedIn;
    },
    getUser(state) {
      return state.user;
    },
    getToken(state) {
      return state.token;
    },
  },
  mutations: {
    setToken(state, token) {
      axios.defaults.headers.common["Authorization"] = token
        ? `Bearer ${token}`
        : null;
      state.token = token;
    },
    setUser(state, user) {
      state.user = user;
    },
    setLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post("/v1/auth/login", credentials);
        var resp = response.data;

        if (resp.code != 200) {
          return resp;
        } else {
          const token = resp.data.token;
          const user = resp.data.user;

          // Set the vuex values
          commit("setToken", token);
          commit("setUser", user);
          commit("setLoggedIn", true);

          // Store the token and user in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Set the axios defaults for headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Set the token cookie for aslong as the token is valid, default is 1 day
          const date = new Date();
          date.setDate(date.getDate() + 1);
          document.cookie = `token=${token}; expires=${date.toUTCString()}`;

          // Return the response
          return resp;
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    // eslint-disable-next-line no-unused-vars
    async register({ commit }, credentials) {
      try {
        const response = await axios.post("/v1/auth/register", credentials);
        var resp = response.data;

        return resp;
      } catch (error) {
        console.log(error);
      }
    },
    async logout({ commit }) {
      // Even if the request fails, logout the user
      // As the request may fail due to network issues or server issues
      // The userToken is only part of the validation process so it should be fine
      try {
        await axios.post("/v1/auth/logout");
      } catch (error) {
        // eslint-disable-next-line no-empty
      }

      commit("setToken", null);
      commit("setUser", null);
      commit("setLoggedIn", false);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      axios.defaults.headers.common["Authorization"] = null;

      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      router.push("/login");
    },
    // eslint-disable-next-line no-unused-vars
    async getPosts({ commit }, request) {
      try {
        if (this.state.token) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${this.state.token}`;
        }
        const response = await axios.get(`/v1/posts`, {
          params: {
            page: request.page,
            limit: request.limit,
            search: request.search,
            userid: request.userid,
          },
        });
        var resp = response.data;

        return resp;
      } catch (error) {
        console.log(error);
      }
    },
    // eslint-disable-next-line no-unused-vars
    async createPost({ commit }, post) {
      try {
        if (this.state.token) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${this.state.token}`;
        }

        const response = await axios.post("/v1/posts", post);
        var resp = response.data;

        return resp;
      } catch (error) {
        return error;
      }
    },
  },
  modules: {},
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    }),
  ],
});
