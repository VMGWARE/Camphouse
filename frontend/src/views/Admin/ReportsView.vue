<template>
  <div class="reports-page">
    <div class="header">
      <h1>Reports</h1>
    </div>
    <div class="reports-list">
      <div
        v-for="report in reports"
        :key="report.reportedContentId"
        class="report-card"
      >
        <div class="report-header">
          <div class="reporter-info">
            <img
              :src="report.reportedBy.profilePicture"
              alt=""
              class="profile-picture"
            />
            <span>{{ report.reportedBy.username }}</span>
          </div>
          <div class="report-status">
            <span :class="report.status">{{ report.status }}</span>
          </div>
        </div>
        <div class="report-content">
          <div class="reported-info">
            <img
              :src="report.reported.profilePicture"
              alt=""
              class="profile-picture"
            />
            <span>{{ report.reported.username }}</span>
          </div>
          <div class="report-description">
            <p>{{ report.description }}</p>
          </div>
          <div class="report-actions">
            <button
              @click="resolveReport(report.reportedContentId)"
              class="btn-resolve"
            >
              Resolve
            </button>
            <button
              @click="dismissReport(report.reportedContentId)"
              class="btn-dismiss"
            >
              Dismiss
            </button>
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
      reports: [], // Assume this data is fetched from your API
    };
  },
  methods: {
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
</style>

<style scoped src="@/assets/stylesheets/admin.css"></style>
