<template>
  <div class="container mt-5">
    <h2 class="mb-4">Notifications</h2>
    <div v-if="notifications.length === 0" class="no-notifications">
      <p>No notifications available</p>
    </div>
    <div v-else class="card">
      <div v-if="fetchingNotifications" class="text-center mt-3 mb-3">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
      </div>
      <ul class="list-group">
        <li
          class="list-group-item"
          v-for="notification in notifications"
          :key="notification.id"
        >
          <div class="notification d-flex align-items-center">
            <div class="notification-icon mr-3">
              <i class="fas" :class="getIconClass(notification.type)"></i>
            </div>
            <div class="notification-details flex-grow-1">
              <p class="notification-message mb-1">
                {{ notification.message }}
              </p>
              <p class="notification-time text-muted mb-0">
                {{ timeAgo(notification.createdAt) }}
              </p>
            </div>
            <div class="notification-action">
              <button class="btn btn-primary" @click="goToAction(notification)">
                View
              </button>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="notifications.length > 0" class="pagination-controls">
        <button
          :disabled="currentPage === 1"
          @click="
            currentPage--;
            getNotifications();
          "
          class="mr-2 btn btn-primary"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="
            currentPage++;
            getNotifications();
          "
          class="ml-2 btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NotificationsView",
  data() {
    return {
      notifications: [],
      currentPage: 1,
      totalPages: 0,
      limit: 10,
      fetchingNotifications: false,
    };
  },

  methods: {
    async getNotifications() {
      this.fetchingNotifications = true;

      // Set authorization header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;

      await axios
        .get(`/v1/notifications?page=${this.currentPage}&limit=${this.limit}`)
        .then((response) => {
          this.notifications = response.data.data.notifications;
          this.totalPages = response.data.data.maxPage;
          this.fetchingNotifications = false;
        })
        .catch((error) => {
          console.log(error);
          this.fetchingNotifications = false;
        });
    },

    async goToAction(notification) {
      // If it was a message, send to messages
      if (notification.type === "MESSAGE") {
        this.$router.push({
          name: "Messages",
          params: { userId: notification.sender },
        });
      }
      // If it was a like, send to post
      else if (notification.type === "LIKE") {
        this.$router.push({
          name: "post",
          params: { id: notification.referenceId },
        });
      }
      // If it was a comment, send to post
      else if (notification.type === "COMMENT") {
        this.$router.push({
          name: "post",
          params: { id: notification.referenceId },
        });
      }
      // If it was a follow, send to user profile
      else if (notification.type === "FOLLOW") {
        // Make request to get user handle from id
        const response = await axios.get(`/v1/users/${notification.sender}`);

        // Make sure response is not null or error
        if (response.data.data) {
          // Then push to user profile
          this.$router.push({
            name: "profile",
            params: { handle: response.data.data.handle },
          });
        }
      }
    },
    timeAgo(date) {
      const now = new Date();
      const notificationDate = new Date(date);
      const secondsPast = (now.getTime() - notificationDate.getTime()) / 1000;

      if (secondsPast < 60)
        return `${parseInt(secondsPast)} second${
          parseInt(secondsPast) > 1 ? "s" : ""
        } ago`;
      if (secondsPast < 3600)
        return `${parseInt(secondsPast / 60)} minute${
          parseInt(secondsPast / 60) > 1 ? "s" : ""
        } ago`;
      if (secondsPast <= 86400)
        return `${parseInt(secondsPast / 3600)} hour${
          parseInt(secondsPast / 3600) > 1 ? "s" : ""
        } ago`;
      if (secondsPast > 86400) {
        const days = parseInt(secondsPast / 86400);
        if (days <= 1) return "yesterday";
        return `${days} day${days > 1 ? "s" : ""} ago`;
      }
    },
    getIconClass(type) {
      switch (type) {
        case "MESSAGE":
          return "fa-mail-bulk";
        case "COMMENT":
          return "fa-comment";
        case "LIKE":
          return "fa-heart";
        case "FOLLOW":
          return "fa-user-plus";
        default:
          return "fa-bell"; // default icon
      }
    },
  },
  created() {
    this.getNotifications();
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  color: #ddd;
}

h2 {
  font-weight: 700;
  color: #ffffff; /* White Color for Heading */
}

.no-notifications {
  text-align: center;
  color: #aaa;
}

.card {
  background-color: #333;
  border: none;
  border-radius: 8px;
  box-shadow: 0px 0px 5px #111;
}

.list-group-item {
  border: none;
  background-color: #444; /* Dark Background Color */
  padding: 20px;
  transition: background-color 0.3s ease;
}

.list-group-item:hover {
  background-color: #555; /* Slightly lighter dark color on hover */
}

.notification-icon i {
  font-size: 20px;
  color: #cc9c3d; /* Bright color for icons for better visibility on dark background */
}

.notification-details {
  font-size: 16px;
}

.notification-message {
  font-weight: 600;
}

.notification-time {
  font-size: 14px;
}

.notification-action button {
  background-color: #cc9c3d; /* Matching bright color for button */
  border: none;
  color: #ffffff; /* White text color for button */
  padding: 6px 12px;
}

.notification-action button:hover {
  background-color: #ddae4c; /* Slightly lighter color on hover */
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}
</style>
