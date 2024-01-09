<template>
  <div>
    <AdminLayout v-if="this.$route.meta.layout == 'admin'">
      <router-view />
    </AdminLayout>
    <div v-else>
      <nav
        class="navbar navbar-expand-lg navbar-dark bg-dark mb-3 sticky-top"
        style="padding-left: 20px"
      >
        <!-- Logo and Branding -->
        <router-link class="navbar-brand" to="/">
          <img
            src="@/assets/images/branding/Camphouse-v2.png"
            alt="Camphouse Logo"
            height="30"
            width="30"
          />
          <img
            src="@/assets/images/branding/Camphouse-Icon-Light.png"
            alt="Camphouse Logo"
            height="30"
            width="150"
          />
          <span class="badge alpha-badge" v-if="git.type == 'commit'">
            {{ git.version }}
          </span>
          <span class="badge bg-success" v-else>
            {{ git.version }}
          </span>
        </router-link>

        <!-- Navigation Toggler for Mobile -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Items -->
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto" v-if="!this.$store.state.loggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login"
                ><i class="fa fa-user"></i> Login</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/signup"
                ><i class="fa fa-user-plus"></i> Sign Up</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">
                <i class="fa fa-info-circle"></i> About</router-link
              >
            </li>
          </ul>

          <ul class="navbar-nav ms-auto" v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/"
                ><i class="fa fa-home"></i> Home</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/search"
                ><i class="fa fa-search"></i> Search</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="'/@' + this.$store.state.user.handle"
                ><i class="fa fa-user"></i> Profile</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/notifications"
                ><i class="fa fa-bell"></i> Notifications</router-link
              >
            </li>
            <li class="nav-item">
              <!-- Dropdown for Additional Options -->
              <div class="dropdown">
                <button
                  class="nav-link btn btn-secondary dropdown-toggle px-3"
                  type="button"
                  id="userOptions"
                  data-bs-toggle="dropdown"
                >
                  Options
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                  <router-link
                    class="dropdown-item"
                    to="/admin"
                    v-if="this.$store.state.user.admin"
                    ><i class="fa fa-user-shield"> </i> Admin</router-link
                  >
                  <router-link class="dropdown-item" to="/settings"
                    ><i class="fa fa-cog"></i> Settings</router-link
                  >
                  <p
                    class="fake-link dropdown-item"
                    @click="logout"
                    v-if="!isLoading"
                  >
                    <i class="fas fa-sign-out-alt"></i> Logout
                  </p>
                </div>
              </div>
            </li>
            <li class="nav-item">
              <router-link class="nav-link btn btn-secondary" to="/new-post"
                ><i class="fa fa-plus"></i> New Post</router-link
              >
            </li>
          </ul>
        </div>
      </nav>
      <div id="main">
        <router-view />
      </div>
    </div>
    <ModalsContainer />
  </div>
</template>

<script>
import jwtDecode from "jwt-decode";
import axios from "axios";
import { ModalsContainer } from "vue-final-modal";
import AdminLayout from "./layouts/AdminLayout.vue";

export default {
  data() {
    return {
      isLoading: false,
      tokenRefreshTimer: null,
      git: {
        version: null,
        type: null,
      },
    };
  },
  methods: {
    check_token() {
      console.log("Checking JWT token");
      const token = this.$store.state.token;
      if (!token || token == null) {
        console.log("No token found");
        let redirect = window.location.pathname;

        // If redirect does not contain login or signup, redirect to login
        if (
          redirect != "/login" &&
          redirect != "/signup" &&
          redirect != "/about"
        ) {
          redirect = "/login?redirect=" + redirect;
        }

        // Redirect to login page
        this.$router.push(redirect);
        return;
      }
      let exp;
      try {
        const { exp: fixAttemptExp } = jwtDecode(token);
        exp = fixAttemptExp;
      } catch (e) {
        console.log("Invalid token");
        this.logout();
        return;
      }
      console.log("Your JWT is", exp - Date.now() / 1000, "seconds to expiry");
      if (exp - Date.now() / 1000 < 0) {
        console.log("Token has expired");
        clearTimeout(this.tokenRefreshTimer);
        this.logout();
        return;
      }
      if (exp - Date.now() / 1000 < 600 && exp - Date.now() / 1000 > 0) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axios({
          method: "post",
          url: "/v1/auth/refresh-token",
        }).then((response) => {
          this.$store.commit("setToken", response.data.data.token);
          localStorage.setItem("token", response.data.data.token);
          console.log("token refreshed");
        });
      } else {
        console.log("token not expired yet");
        this.setupTokenRefresh();
      }
    },
    setupTokenRefresh() {
      console.log("Setup token refresh");

      // Clear any existing timer before setting up a new one
      const existingTimerId = localStorage.getItem("tokenRefreshTimer");
      if (existingTimerId) {
        console.log("Clearing existing timer", existingTimerId);
        clearTimeout(existingTimerId);
        localStorage.removeItem("tokenRefreshTimer");
      }

      // Setup new timer
      const token = this.$store.state.token;
      const { exp } = jwtDecode(token);
      const newTimerId = setTimeout(
        this.check_token,
        (exp - Date.now() / 1000 - 600) * 1000
      );

      // Store new timer ID in localStorage
      localStorage.setItem("tokenRefreshTimer", newTimerId);

      console.log(
        "New token refresh timer set for",
        exp - Date.now() / 1000 - 600,
        "seconds, timerId:",
        newTimerId
      );
    },
    logout() {
      this.isLoading = true;
      this.$store
        .dispatch("logout")
        .then(() => {
          this.isLoading = false;
        })
        .catch(() => {
          this.isLoading = false;
          //
        });
    },
    async getGitTag() {
      // If it is empty, we will instead call the API to get the latest commit
      if (!process.env.VUE_APP_GIT_VERSION) {
        const response = await axios.get("/v1/misc/health");
        this.git = {
          version: response.data.data.version,
          type: "commit",
        };
      }
      // If tag is a version number, return it
      else if (process.env.VUE_APP_GIT_VERSION.match(/^v\d+\.\d+\.\d+$/)) {
        this.git = {
          version: process.env.VUE_APP_GIT_VERSION,
          type: "version",
        };
      } else {
        this.git = {
          version: process.env.VUE_APP_GIT_VERSION,
          type: "commit",
        };
      }

      console.log("Git version:", this.git.version);
    },
  },
  created() {
    this.getGitTag();
    this.check_token();
  },
  unmounted() {
    console.log("Remove token refresh timer");
    const timerId = localStorage.getItem("tokenRefreshTimer");
    if (timerId) {
      clearTimeout(timerId);
      localStorage.removeItem("tokenRefreshTimer");
    }
  },
  // Watch for changes in the store that are relevant to the token
  watch: {
    "$store.state.token": function () {
      this.check_token();
    },
  },
  components: {
    ModalsContainer,
    AdminLayout,
  },
};
</script>

<style scoped>
.fake-link {
  cursor: pointer;
}
#main {
  min-height: 100%;
  /* overflow: auto; */
}
.alpha-badge {
  background-color: #ff4500; /* orange-red color */
  color: #ffffff; /* white text color */
  padding: 2px 8px; /* some padding for spacing */
  border-radius: 4px; /* rounded corners */
  font-size: 0.8em; /* smaller font size than regular text */
  font-weight: bold; /* bold text */
  vertical-align: middle; /* align it with the logo and site name */
  margin-left: 5px; /* spacing from the logo or site name */
}

.production-badge {
  background-color: #00ff00; /* green color */
  color: #ffffff; /* white text color */
  padding: 2px 8px; /* some padding for spacing */
  border-radius: 4px; /* rounded corners */
  font-size: 0.8em; /* smaller font size than regular text */
  font-weight: bold; /* bold text */
  vertical-align: middle; /* align it with the logo and site name */
  margin-left: 5px; /* spacing from the logo or site name */
}

.badge {
  margin-left: 5px;
}
</style>
