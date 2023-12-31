<template>
  <div>
    <!-- Navbar -->
    <nav
      class="navbar navbar-expand-lg navbar-dark bg-dark mb-3 sticky-top"
      style="padding-left: 20px"
    >
      <!-- Logo and Branding -->
      <NuxtLink class="navbar-brand" to="/">
        <img
          src="~/assets/images/branding/Camphouse-v2.png"
          alt="Camphouse Logo"
          height="30"
          width="30"
        />
        <img
          src="~/assets/images/branding/Camphouse-Icon-Light.png"
          alt="Camphouse Logo"
          height="30"
          width="150"
        />
        <!-- <span class="badge alpha-badge" v-if="git.type == 'commit'">
          {{ git.version }}
        </span>
        <span class="badge bg-success" v-else>
          {{ git.version }}
        </span> -->
      </NuxtLink>

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
        <ul class="navbar-nav ms-auto" v-if="!useAuthStore().isLoggedIn">
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/login"
              ><i class="fa fa-user"></i> Login</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/signup"
              ><i class="fa fa-user-plus"></i> Sign Up</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/about" active-class="active">
              <i class="fa fa-info-circle"></i> About</NuxtLink
            >
          </li>
        </ul>

        <ul class="navbar-nav ms-auto" v-else>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/"
              ><i class="fa fa-home"></i> Home</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/search"
              ><i class="fa fa-search"></i> Search</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" :to="'/@' + user.handle"
              ><i class="fa fa-user"></i> Profile</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/notifications"
              ><i class="fa fa-bell"></i> Notifications</NuxtLink
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
                <NuxtLink class="dropdown-item" to="/admin" v-if="user.admin"
                  ><i class="fa fa-user-shield"> </i> Admin</NuxtLink
                >
                <NuxtLink class="dropdown-item" to="/settings"
                  ><i class="fa fa-cog"></i> Settings</NuxtLink
                >
                <p
                  class="fake-link dropdown-item"
                  @click="logout"
                  v-if="!processingSignOut"
                >
                  <i class="fas fa-sign-out-alt"></i> Logout
                </p>
              </div>
            </div>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link btn btn-secondary" to="/new-post"
              ><i class="fa fa-plus"></i> New Post</NuxtLink
            >
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <div id="main">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";
const route = useRoute();
const user = useAuthStore().user;
const processingSignOut = ref(false);
</script>
