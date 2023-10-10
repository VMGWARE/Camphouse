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
          <h1>
            {{ analytics.users }}
          </h1>
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
          <h1>{{ analytics.posts }}</h1>
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
          <h1>{{ analytics.messages }}</h1>
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
          <h1>{{ analytics.comments }}</h1>
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
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-item {
  background-color: #2a2e33; /* A shade darker than the card for visual separation */
  border-radius: 5px; /* Rounded corners */
  padding: 15px; /* Inner spacing */
  margin-bottom: 20px; /* Spacing between posts */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2); /* A subtle shadow */
}

.post-item h6 {
  margin-bottom: 10px;
}

.post-item p {
  margin-bottom: 5px;
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
      analytics: {
        users: 0,
        posts: 0,
        messages: 0,
        comments: 0,
      },
      recentPosts: [],
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
  },
  mounted() {
    this.getAppVersion();
    this.getAnalytics();
    this.getRecentPosts();
  },
};
</script>
