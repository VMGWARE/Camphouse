<template>
  <!-- Welcome message -->
  <div class="row">
    <div class="col-md-12">
      <div class="card mb-3">
        <div class="card-header">
          <h4>Audit Log Dashboard</h4>
        </div>
        <div class="card-body">
          <p>
            Welcome to the Audit Log Dashboard. This is where you can view the
            audit logs of the Camphouse application.
          </p>
        </div>
      </div>
    </div>
  </div>

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

  <!-- Line chart that can filter between each action, pie chart that shows the percentage of each action -->
  <div class="row">
    <div class="col-md-6">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-chart-line"></i>
            Audit Log Line Chart
          </h5>
        </div>
        <div class="card-body">
          <!-- TODO: Make line chart -->
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-chart-pie"></i>
            Audit Log Pie Chart
          </h5>
        </div>
        <div class="card-body">
          <!-- TODO: Make pie chart -->
        </div>
      </div>
    </div>
  </div>

  <!-- Table of all audit logs -->
  <div class="row">
    <div class="col-md-12">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-table"></i>
            Audit Log Table
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-dark">
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">User</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
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

<style scoped src="@/assets/stylesheets/admin.css"></style>
