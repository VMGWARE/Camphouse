<template>
  <div class="container my-4">
    <!-- Title/Refresh -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Posts</h1>

      <!-- Refresh button -->
      <button class="btn btn-secondary" @click="refreshPosts">
        <i class="fas fa-sync-alt" v-if="!refreshingPosts"></i>
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
          placeholder="Search by title or body"
          v-model="searchQuery"
          @input="fetchPosts"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="card mb-3">
      <!-- Posts -->
      <div class="table-responsive">
        <table class="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Author</th>
              <th scope="col">Title</th>
              <th scope="col">Updated At</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post._id">
              <th scope="row">
                <!-- Button to copy user id -->
                <button
                  class="btn btn-sm btn-outline-secondary"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Copy Post ID"
                  @click="copyPostId(post._id)"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </th>
              <td>
                {{ post.user.handle }}
              </td>
              <td>{{ post.title }}</td>
              <td>{{ formatDate(post.updatedAt) }}</td>
              <td>
                <a
                  class="btn btn-sm me-2 btn-outline-danger"
                  href="#"
                  @click="openDeletePostModal(post)"
                >
                  <i class="fas fa-trash"></i>
                </a>
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

        <!-- Display number of posts being show out of total -->
        <div class="text-muted">
          Showing {{ (currentPage - 1) * limit + 1 }} -
          {{ (currentPage - 1) * limit + posts.length }} of
          {{ totalPosts }} posts
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

<script>
import axios from "axios";
import { useModal } from "vue-final-modal";
import DeletePostModal from "@/components/Modal/DeletePostModal.vue";

export default {
  data() {
    return {
      posts: [],
      currentPage: 1, // Current page
      totalPages: 1, // Total number of pages
      limit: 10, // Number of posts per page
      totalPosts: 0, // Total number of posts
      searchQuery: "", // Add this property for search
      refreshingPosts: false,
    };
  },
  methods: {
    async fetchPosts() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("/v1/posts", {
          params: {
            page: this.currentPage,
            limit: this.limit,
            search: this.searchQuery, // Include search query in API request
          },
        });
        this.posts = response.data.data.posts;
        this.totalPages = response.data.data.maxPages;
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchPosts();
      }
    },
    changeMaxItemsPerPage(value) {
      this.limit = value;
      this.currentPage = 1; // Reset to the first page when changing items per page
      this.fetchPosts();
    },
    async fetchTotalPosts() {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      axios
        .get("/v1/admin/analytics")
        .then((res) => {
          this.totalPosts = res.data.data.posts;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    copyPostId(id) {
      navigator.clipboard.writeText(id);
    },
    async refreshPosts() {
      this.refreshingPosts = true;
      this.fetchPosts();
      this.refreshingPosts = false;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      // Then specify how you want your dates to be formatted
      return new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
        date
      );
    },
    async openDeletePostModal(post) {
      let parent = this;
      const { open, close } = useModal({
        component: DeletePostModal,
        attrs: {
          post: post,
          type: "admin",
          onCancel() {
            close();
          },
          async onDelete(id) {
            // Remove the post from the posts array
            parent.posts = parent.posts.filter((post) => post._id !== id);

            // Update the total number of posts
            parent.totalPosts -= 1;

            close();
          },
        },
      });
      open();
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
    this.fetchPosts();
    this.fetchTotalPosts();
  },
};
</script>
