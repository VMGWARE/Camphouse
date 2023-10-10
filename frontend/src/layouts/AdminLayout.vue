<template>
  <!-- Navigation bar -->
  <nav
    class="navbar navbar-expand-lg navbar-dark bg-dark mb-3"
    style="padding-left: 20px"
  >
    <router-link class="navbar-brand" to="/admin">
      <img
        src="@/assets/images/branding/Camphouse-v2.png"
        alt="Camphouse Logo"
        height="30"
        width="30"
      />
      Admin Panel
    </router-link>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item active">
          <router-link class="nav-link" to="/admin">
            <i class="fas fa-tachometer-alt"></i>
            Dashboard</router-link
          >
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#!">
            <i class="fas fa-user"></i>
            Users</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#!">
            <i class="fas fa-file-alt"></i>
            Posts</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#!">
            <i class="fas fa-comments"></i>
            Comments</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#!">
            <i class="fas fa-envelope"></i>
            Reports</a
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
            <div class="dropdown-menu">
              <router-link class="dropdown-item" to="/messages"
                ><i class="fa fa-envelope"></i> Messages</router-link
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
      </ul>
    </div>
  </nav>

  <!-- Main content -->
  <div id="main" class="container-fluid">
    <slot />
  </div>

  <!-- Footer -->
  <footer class="footer py-3 bg-dark">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <small>
            Licensed under
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              >CC BY-NC-SA 4.0</a
            >
            |
            <a href="https://github.com/VMGWARE/Camphouse" target="_blank"
              >GitHub Repo</a
            >
          </small>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
body {
  background-color: #343a40; /* Bootstrap dark background color */
  color: #fff;
}

.navbar-dark .navbar-brand {
  color: #ffc107; /* Bootstrap yellow color for contrast */
}

.footer a {
  color: #ffc107; /* Using Bootstrap's yellow color for contrast */
  text-decoration: none;
  margin-left: 10px;
  margin-right: 10px;
}

.footer a:hover {
  text-decoration: underline;
}
.fake-link {
  cursor: pointer;
}
</style>

<script>
export default {
  methods: {
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
  },
};
</script>
