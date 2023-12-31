<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Users</h1>

      <!-- Refresh button -->
      <button class="btn btn-secondary" @click="refreshUsers">
        <i class="fas fa-sync-alt" v-if="!refreshingUsers"></i>
        <i class="fas fa-sync-alt fa-spin" v-else></i>

        Refresh
      </button>
    </div>

    <!-- Search input and button -->
    <div class="d-flex justify-content-end mb-3">
      <div class="form-inline">
        <input
          type="text"
          class="form-control"
          placeholder="Search by name or handle"
          v-model="searchQuery"
          @input="fetchUsers"
        />
      </div>
    </div>

    <div class="card mb-3">
      <!-- Users -->
      <div class="table-responsive">
        <table class="table table-dark">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Handle</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>
                <!-- Button to copy user id -->
                <button
                  class="btn btn-sm btn-outline-secondary"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Copy User Id"
                  @click="copyUserId(user._id)"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </td>
              <td>{{ user.username }}</td>
              <td>{{ user.handle }}</td>
              <td>{{ user.email }}</td>
              <!-- Actions Dropdown -->
              <td>
                <div class="dropdown">
                  <button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="actionsDropdown"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Actions
                  </button>
                  <div
                    class="dropdown-menu dropdown-menu-right"
                    aria-labelledby="actionsDropdown"
                  >
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openUpdateUserModal(user)"
                      >Edit</a
                    >
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openDeleteUserModal(user)"
                      >Delete</a
                    >
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <!-- Max Items per Page Dropdown -->
        <div class="form-inline mb-3 mb-md-0">
          <select
            v-model="limit"
            class="form-control"
            @change="changeMaxItemsPerPage(limit)"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <!-- Display number of users being show out of total -->
        <div class="text-muted">
          Showing {{ (currentPage - 1) * limit + 1 }} -
          {{ (currentPage - 1) * limit + users.length }} of
          {{ totalUsers }} users
        </div>

        <!-- Bootstrap Pagination -->
        <nav aria-label="User pagination">
          <ul class="pagination justify-content-end">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            <li
              class="page-item"
              v-for="pageNumber in displayedPages"
              :key="pageNumber"
            >
              <button
                class="page-link"
                @click="changePage(pageNumber)"
                :class="{ active: currentPage === pageNumber }"
              >
                {{ pageNumber }}
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button
                class="page-link"
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useModal } from "vue-final-modal";
import DeleteUserModal from "@/components/Modal/DeleteUserModal.vue";
import UpdateUserModal from "@/components/Modal/UpdateUserModal.vue";

export default {
  data() {
    return {
      users: [],
      currentPage: 1, // Current page
      totalPages: 1, // Total number of pages
      limit: 10, // Number of users per page
      totalUsers: 0, // Total number of users
      searchQuery: "", // Add this property for search
      refreshingUsers: false,
    };
  },
  methods: {
    async fetchUsers() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("/v1/users", {
          params: {
            page: this.currentPage,
            limit: this.limit,
            search: this.searchQuery, // Include search query in API request
          },
        });
        this.users = response.data.data.users;
        this.totalPages = response.data.data.maxPages;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchUsers();
      }
    },
    changeMaxItemsPerPage(value) {
      this.limit = value;
      this.currentPage = 1; // Reset to the first page when changing items per page
      this.fetchUsers();
    },
    async fetchTotalUsers() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/admin/analytics")
        .then((res) => {
          this.totalUsers = res.data.data.users;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    copyUserId(id) {
      navigator.clipboard.writeText(id);
    },
    async openUpdateUserModal(user) {
      const users = this.users;
      // Assign the modal instance to a variable
      const { open, close } = useModal({
        component: UpdateUserModal,
        attrs: {
          user: user,
          onCancel() {
            close();
          },
          async onUpdate(updatedUser) {
            const index = users.findIndex(
              (user) => user._id === updatedUser._id
            );

            users[index] = updatedUser;
            close();
          },
        },
      });

      // Open the modal
      open();
    },
    async openDeleteUserModal(user) {
      let parent = this;
      // Assign the modal instance to a variable
      const { open, close } = useModal({
        component: DeleteUserModal,
        attrs: {
          user: user,
          onCancel() {
            close();
          },
          async onDelete(userId) {
            // Remove the user from the users array
            parent.users = parent.users.filter((user) => user._id !== userId);

            // Update the total number of users
            parent.totalUsers = parent.totalUsers - 1;
            close();
          },
        },
      });

      // Open the modal
      open();
    },
    async refreshUsers() {
      this.refreshingUsers = true;
      this.fetchUsers();
      this.refreshingUsers = false;
    },
  },
  computed: {
    displayedPages() {
      const totalDisplayed = 3;
      const startPage = Math.max(
        this.currentPage - Math.floor(totalDisplayed / 2),
        1
      );
      const endPage = Math.min(startPage + totalDisplayed - 1, this.totalPages);
      const pages = [];

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchTotalUsers();
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

/* Style the pagination buttons */
.pagination .page-item .page-link {
  background-color: #343a40;
  border-color: #343a40;
  color: #ffffff;
}

/* Style the active/current link */
.pagination .page-item .page-link.active {
  background-color: #ffc34d;
  border-color: #ffc34d;
  border-radius: 5px;
}

.page-link,
.page-link:active {
  outline: none !important;
  box-shadow: none;
}
</style>
