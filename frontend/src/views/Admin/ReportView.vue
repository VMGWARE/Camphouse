<template>
  <div class="container my-4">
    <h1 class="mb-4">Report Detail</h1>
    <div v-if="report" class="card">
      <div class="card-header">
        Report Status:
        <select v-model="report.status" class="ml-2 form-control">
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>
      <div class="card-body">
        <h5 class="card-title">Reported by {{ report.reportedBy.username }}</h5>
        <p class="card-text">{{ report.description }}</p>
        <h5 class="mt-4">Content Snapshot</h5>
        <pre class="bg-dark p-3">{{
          JSON.stringify(report.snapshot, null, 2)
        }}</pre>
        <!-- TODO: Add moderator note. -->
        <!-- TODO: Actions to be taken place once report is approved, such as deletion, or a warning sent via notification to the owner -->
        <button @click="updateStatus" class="btn btn-primary mt-3">
          Update Status
        </button>
        <button @click="takeAction" class="btn btn-danger mt-3 ml-2">
          Take Action
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      report: null,
    };
  },
  methods: {
    async fetchReport() {
      try {
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + localStorage.getItem("token");
        const response = await axios.get(
          `/v1/reports/${this.$route.params.id}`
        );
        this.report = response.data.data;
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    },
    async updateStatus() {
      try {
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + localStorage.getItem("token");
        const response = await axios.patch(
          `/v1/reports/${this.$route.params.id}`,
          {
            status: this.report.status,
          }
        );
        if (response.status === 200) {
          // Notify user of success
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    },
  },
  mounted() {
    this.fetchReport();
  },
};
</script>
