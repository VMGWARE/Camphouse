<template>
  <div class="container">
    <p class="text-danger">This is a demo page.</p>
    <h2>Notifications</h2>

    <div class="card dark-card">
      <div class="card-body">
        <ul class="list-group dark-list">
          <li
            class="list-group-item dark-item"
            v-for="notification in notifications"
            :key="notification.id"
          >
            <div class="notification">
              <div class="notification-icon">
                <i
                  class="fa fa-comment"
                  v-if="notification.type === 'COMMENT'"
                ></i>
                <i class="fa fa-heart" v-if="notification.type === 'LIKE'"></i>
                <i
                  class="fa fa-envelope"
                  v-if="notification.type === 'MESSAGE'"
                ></i>
              </div>
              <div class="notification-details">
                <p class="notification-message">
                  {{ notification.message }}
                </p>
                <p class="notification-time">
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
          this.notifications = response.data.data.notifications;
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
