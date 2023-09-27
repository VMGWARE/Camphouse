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
                  class="fas fa-heart"
                  v-else-if="notification.type === 'LIKE'"
                ></i>
                <i
                  class="fas fa-comment"
                  v-else-if="notification.type === 'COMMENT'"
                ></i>
              </div>
              <div class="notification-details">
                <p class="notification-message mb-1">
                  {{ notification.message }}
                </p>
                <p class="notification-time text-muted mb-0">
                  {{ new Date(notification.createdAt).toLocaleString() }}
                </p>
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
          let notifications = response.data.data.notifications;
          // Flip the order of the notifications so the newest is first
          notifications = notifications.reverse();
          this.notifications = notifications;
        })
        .catch((error) => {
          console.log(error);
        });
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
