<template>
  <div class="view-report-container" v-if="report._id">
    <h2>Report Details</h2>

    <!-- Report Information -->
    <div class="report-info">
      <p><strong>Description:</strong> {{ report.description }}</p>
      <p><strong>Status:</strong> {{ report.status }}</p>
      <p><strong>Reported At:</strong> {{ report.createdAt }}</p>
    </div>

    <!-- Reported By -->
    <div class="user-section">
      <h3>Reported By:</h3>
      <img
        :src="report.reportedBy.profilePicture"
        alt="Reporter's Profile Picture"
        class="profile-pic"
      />
      <p>{{ report.reportedBy.username }} ({{ report.reportedBy.handle }})</p>
      <p>Email: {{ report.reportedBy.email }}</p>
    </div>

    <!-- Reported User -->
    <div class="user-section">
      <h3>Reported User:</h3>
      <img
        :src="report.reported.profilePicture"
        alt="Reported User's Profile Picture"
        class="profile-pic"
      />
      <p>{{ report.reported.username }} ({{ report.reported.handle }})</p>
      <p>Email: {{ report.reported.email }}</p>
    </div>

    <!-- Reported Content -->
    <div class="content-section">
      <h3>Reported Content:</h3>
      <p><strong>Title:</strong> {{ report.snapshot.title }}</p>
      <p><strong>Content:</strong> {{ report.snapshot.content }}</p>
    </div>
  </div>
</template>

<style scoped>
.view-report-container {
  padding: 20px;
  background-color: #2a2e33;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.report-info,
.user-section,
.content-section {
  background-color: #3a3e43;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
}

.profile-pic {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      report: {},
    };
  },
  methods: {
    fetchReport() {
      const reportId = this.$route.params.id; // Assuming you're using Vue Router
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/reports/" + reportId)
        .then((res) => {
          this.report = res.data.data;
        })
        .catch((err) => {
          console.error("Error fetching the report:", err);
        });
    },
  },
  mounted() {
    this.fetchReport();
  },
};
</script>
