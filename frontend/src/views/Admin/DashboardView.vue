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
          <a class="nav-link" href="#">
            <i class="fas fa-tachometer-alt"></i>
            Dashboard</a
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
      </ul>
    </div>
  </nav>

  <!-- Main content -->
  <div id="main">
    <!-- Show current version -->
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="card mb-3">
            <div class="card-header">
              <h4>Camphouse Admin Panel</h4>
            </div>
            <div class="card-body">
              <p class="card-text">
                <strong>Version: </strong> {{ appVersion }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  background-color: #343a40; /* Bootstrap dark background color */
  color: #fff;
}

.navbar-dark .navbar-brand {
  color: #ffc107; /* Bootstrap yellow color for contrast */
}

.card-header {
  background-color: #212529; /* Slightly darker than body background */
  border-bottom: 1px solid #495057; /* Gives a slight border to separate */
}

.card {
  background-color: #212529; /* Slightly darker than body background */
  border: none;
}

.card-body {
  border-top: 1px solid #495057; /* Gives a slight border to separate from header */
}
</style>

<script>
import axios from "axios";

export default {
  name: "DashboardView",
  data() {
    return {
      appVersion: "",
    };
  },
  methods: {
    // Get the current version of the app
    getAppVersion() {
      axios
        .get("/v1/misc/health")
        .then((res) => {
          this.appVersion = res.data.data.version;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.getAppVersion();
  },
};
</script>
