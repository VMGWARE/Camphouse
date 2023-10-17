<template>
  <!-- Stats: Sign In, Logout, etc -->
  <div class="row">
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-sign-in-alt"></i>
            Sign In
          </h5>
        </div>
        <div class="card-body">
          <h1>{{ stats.totalSignIns }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </h5>
        </div>
        <div class="card-body">
          <h1>{{ stats.totalLogouts }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-user-plus"></i>
            Account Created
          </h5>
        </div>
        <div class="card-body">
          <h1>{{ stats.totalAccountCreated }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-user-minus"></i>
            Account Deleted
          </h5>
        </div>
        <div class="card-body">
          <h1>{{ stats.totalAccountDeleted }}</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- Line chart that can filter between each action -->

  <!-- Table of all audit logs -->
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      stats: {},
    };
  },
  methods: {
    getStats() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/audit-logs/stats")
        .then((res) => {
          this.stats = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.getStats();
  },
};
</script>
