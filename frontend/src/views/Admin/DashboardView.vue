<template>
  <!-- Welcome message -->
  <div class="row">
    <div class="col-md-12">
      <div class="card mb-3">
        <div class="card-header">
          <h4>Camphouse Admin Panel</h4>
        </div>
        <div class="card-body">
          <p>
            Welcome to the Camphouse Admin Panel. This is where you can manage
            the Camphouse application.
          </p>
          <p>
            The current version of the application is
            <strong>{{ appVersion }}</strong
            >.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Number of users, posts, messages, comments, and notifications. -->
  <div class="row">
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-users"></i>
            Users
          </h5>
        </div>
        <div class="card-body">
          <h1 v-if="analytics.users === null">
            <i class="fas fa-spinner fa-spin"></i>
          </h1>
          <h1 v-else>{{ analytics.users }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-file-alt"></i>
            Posts
          </h5>
        </div>
        <div class="card-body">
          <h1 v-if="analytics.posts === null">
            <i class="fas fa-spinner fa-spin"></i>
          </h1>
          <h1 v-else>{{ analytics.posts }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-comments"></i>
            Messages
          </h5>
        </div>
        <div class="card-body">
          <h1 v-if="analytics.messages === null">
            <i class="fas fa-spinner fa-spin"></i>
          </h1>
          <h1 v-else>{{ analytics.messages }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-envelope"></i>
            Comments
          </h5>
        </div>
        <div class="card-body">
          <h1 v-if="analytics.comments === null">
            <i class="fas fa-spinner fa-spin"></i>
          </h1>
          <h1 v-else>{{ analytics.comments }}</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- Number of blocked email domains and audit logs -->
  <div class="row">
    <!-- Number of Blocked Email Domains -->
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-envelope"></i>
            Blocked Email Domains
          </h5>
        </div>
        <div class="card-body">
          <h1 v-if="analytics.blockedEmailDomains === null">
            <i class="fas fa-spinner fa-spin"></i>
          </h1>
          <h1 v-else>{{ analytics.blockedEmailDomains }}</h1>
        </div>
      </div>
    </div>
    <!-- Total Audit Logs -->
    <div class="col-md-3">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-file-alt"></i>
            Audit Logs
          </h5>
        </div>
        <div class="card-body">
          <h1 v-if="analytics.auditLogs === null">
            <i class="fas fa-spinner fa-spin"></i>
          </h1>
          <h1 v-else>{{ analytics.auditLogs }}</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent posts and reports -->
  <div class="row">
    <!-- Show the latest 3 posts -->
    <div class="col-md-6">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-file-alt"></i>
            Recent Posts
          </h5>
        </div>
        <div class="card-body">
          <div v-for="post in recentPosts" :key="post._id" class="post-item">
            <h6>{{ post.title }}</h6>
            <p>{{ limitedContent(post.content) }}</p>
            <small>By {{ post.user.handle }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Show the latest 3 unresolved reports -->
    <div class="col-md-6">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-envelope"></i>
            Recent Reports
          </h5>
        </div>
        <div class="card-body">
          <div
            v-for="report in recentReports"
            :key="report._id"
            class="report-item"
          >
            <h6>{{ report.description }}</h6>
            <div
              class="report-details d-flex justify-content-between align-items-center"
            >
              <img
                :src="report.reportedBy.profilePicture"
                alt="reporter's profile picture"
                class="reporter-pic"
              />
              <span>Reported by {{ report.reportedBy.handle }}</span>
              <a :href="'/view-report/' + report._id" class="view-report-link"
                >View Full Report</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/stylesheets/admin.css"></style>

<script>
import axios from "axios";

export default {
  name: "DashboardView",
  data() {
    return {
      appVersion: "",
      analytics: {
        users: null,
        posts: null,
        messages: null,
        comments: null,
        blockedEmailDomains: null,
        auditLogs: null,
      },
      recentPosts: [],
      recentReports: [],
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
    // Get the analytics for the admin dashboard
    getAnalytics() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/admin/analytics")
        .then((res) => {
          this.analytics = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // Get the latest 3 posts
    getRecentPosts() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/posts?limit=3")
        .then((res) => {
          this.recentPosts = res.data.data.posts;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    limitedContent(content) {
      const maxLength = 100; // adjust this based on your requirements
      if (content.length > maxLength) {
        return content.substring(0, maxLength) + "...";
      }
      return content;
    },
    // Get the latest 3 unresolved reports
    getRecentReports() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/reports?limit=3")
        .then((res) => {
          this.recentReports = res.data.data.reports;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.getAppVersion();
    this.getAnalytics();
    this.getRecentPosts();
    this.getRecentReports();
  },
};
</script>
