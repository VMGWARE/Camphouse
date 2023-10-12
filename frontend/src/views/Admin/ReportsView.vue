<template>
  <div class="container my-4">
    <h1 class="mb-4">Reports</h1>
    <div
      v-for="report in reports"
      :key="report.reportedContentId"
      class="card mb-3"
    >
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <div class="reporter-info d-flex align-items-center">
          <img
            :src="report.reportedBy.profilePicture"
            alt=""
            class="rounded-circle profile-picture"
            width="40"
            height="40"
          />
          <span class="ml-2">{{ report.reportedBy.username }}</span>
        </div>
        <span class="badge" :class="statusClass(report.status)">{{
          report.status
        }}</span>
      </div>
      <div class="card-body">
        <div class="reported-info mb-3 d-flex align-items-center">
          <img
            :src="report.reported.profilePicture"
            alt=""
            class="rounded-circle profile-picture"
            width="40"
            height="40"
          />
          <span class="ml-2">{{ report.reported.username }}</span>
        </div>
        <p class="card-text">{{ report.description }}</p>
        <router-link
          :to="`/admin/reports/${report._id}`"
          class="btn btn-view-report btn-sm"
          >View Full Report</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      reports: [], // Assume this data is fetched from your API
    };
  },
  methods: {
    statusClass(status) {
      return {
        "badge-warning": status === "Pending",
        "badge-success": status === "Resolved",
        "badge-danger": status === "Dismissed",
      };
    },
    async resolveReport() {
      // Resolve report logic here
    },
    async dismissReport() {
      // Dismiss report logic here
    },
    async fetchReports() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/reports")
        .then((res) => {
          this.reports = res.data.data.reports;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.fetchReports();
  },
};
</script>

<style scoped>
.reports-page {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.report-card {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 10px;
}

.report-header,
.report-content {
  display: flex;
  justify-content: space-between;
}

.reporter-info,
.reported-info {
  display: flex;
  align-items: center;
}

.profile-picture {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.report-description {
  margin: 10px 0;
}

.report-status span {
  padding: 5px 10px;
  border-radius: 4px;
}

.Pending {
  background-color: #ffc34d;
}

.Resolved {
  background-color: #28a745;
}

.Dismissed {
  background-color: #dc3545;
}

.report-actions button {
  margin-right: 10px;
}

.btn-resolve {
  background-color: #28a745;
  color: white;
}

.btn-dismiss {
  background-color: #dc3545;
  color: white;
}

.badge.badge-warning {
  background-color: #ffc34d;
}

.badge.badge-success {
  background-color: #28a745;
}

.badge.badge-danger {
  background-color: #dc3545;
}

.btn-view-report {
  background-color: #ffc34d;
  color: black;
}
</style>

<style scoped src="@/assets/stylesheets/admin.css"></style>
