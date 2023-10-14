<template>
  <div class="container my-4">
    <h1 class="mb-4">Users</h1>

    <!-- Users Table wrapped inside card for consistency -->
    <div class="card mb-3">
      <table class="table table-striped mb-0 table-dark">
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Profile Picture</th>
            <th>Bio</th>
            <th>Admin</th>
            <th>Verified</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.email }}</td>
            <td>{{ user.username }}</td>
            <td>
              <img :src="user.profilePicture" alt="" class="profile-picture" />
            </td>
            <td>{{ user.bio }}</td>
            <td>{{ user.admin ? "Yes" : "No" }}</td>
            <td>{{ user.verified ? "Yes" : "No" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      users: [],
    };
  },
  methods: {
    async fetchUsers() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("/v1/users");
        this.users = response.data.data.users;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}
.profile-picture:before {
  content: " ";
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  background-color: #ffc34d;
}

.table.table-dark {
  background-color: #212529;
  color: #ffffff;
}
</style>

<!-- Additional styles from the provided design can be added if necessary -->
