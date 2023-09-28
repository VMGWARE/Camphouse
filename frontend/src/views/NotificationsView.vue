<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-muted">Notifications</h2>

    <div class="card bg-dark">
      <div class="card-body">
        <ul class="list-group bg-dark">
          <li
            class="list-group-item bg-dark text-light border-bottom"
            v-for="notification in notifications"
            :key="notification.id"
          >
            <div class="notification d-flex align-items-center">
              <div class="notification-icon mr-3">
                <i
                  class="fas fa-mail-bulk"
                  v-if="notification.type === 'MESSAGE'"
                ></i>
                <i
                  class="fas fa-comment"
                  v-else-if="notification.type === 'COMMENT'"
                ></i>
                <i
                  class="fas fa-heart"
                  v-else-if="notification.type === 'LIKE'"
                ></i>
                <i
                  class="fas fa-user-plus"
                  v-else-if="notification.type === 'FOLLOW'"
                ></i>
              </div>
              <div class="notification-details">
                <p class="notification-message mb-1">
                  {{ notification.message }}
                </p>
                <p class="notification-time text-muted mb-0">
                  {{ timeAgo(notification.createdAt) }}
                </p>
              </div>
              <div class="notification-action">
                <button
                  class="btn btn-sm btn-primary"
                  @click="goToAction(notification)"
                >
                  View
                </button>
              </div>
            </div>
          </li>
        </ul>
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
    };
  },
  methods: {
    async getNotifications() {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      await axios
        .get("/v1/notifications")
        .then((response) => {
          this.notifications = response.data.data.notifications;
        })
        .catch((error) => {
          console.log(error);
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
  },
  created() {
    this.getNotifications();
  },
};
</script>

<style scoped>
.notification-icon i {
  font-size: 20px;
  color: #ffc34d;
}

.notification-details {
  flex-grow: 1;
}

.notification-message {
  font-size: 16px;
  font-weight: 600;
}

.notification-time {
  font-size: 14px;
}

.list-group-item {
  transition: background-color 0.3s ease;
}

.list-group-item:hover {
  background-color: #333;
}
</style>
