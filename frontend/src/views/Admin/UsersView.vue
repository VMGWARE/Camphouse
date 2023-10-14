<template>
  <div class="container my-4">
    <h1 class="mb-4">Admin Users</h1>

    <div class="card mb-3">
      <div class="table-responsive">
        <table class="table table-dark">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
        const response = await axios.get("/v1/users"); // Updated API endpoint
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
  border-radius: 5px;
}

/* Additional styles for the admin page */
.card {
  background-color: #343a40;
  border: 1px solid #343a40;
  color: #ffffff;
}

/* Style the table header */
.table-dark th {
  background-color: #212529;
  color: #ffffff;
  border-color: #343a40;
}

/* Style table rows */
.table-dark tbody tr {
  background-color: #343a40;
  color: #ffffff;
}

/* Style alternating rows for better readability */
.table-dark tbody tr:nth-child(even) {
  background-color: #292e33;
}

/* Style table cells */
.table-dark td {
  border-color: #343a40;
}
</style>
