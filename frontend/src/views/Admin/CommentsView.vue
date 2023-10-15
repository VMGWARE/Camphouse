<template>
  <div class="container my-4">
    <!-- Title/Refresh -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Comments</h1>

      <!-- Refresh button -->
      <button class="btn btn-secondary" @click="refreshComments">
        <i class="fas fa-sync-alt" v-if="!refreshingComments"></i>
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
          placeholder="Search Comments"
          v-model="searchQuery"
          @input="fetchComments"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="card mb-3">
      <!-- Comments -->
      <div class="table-responsive">
        <table class="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Author</th>
              <th scope="col">Comment</th>
              <th scope="col">Created At</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comment in comments" :key="comment._id">
              <th scope="row">
                <!-- Button to copy user id -->
                <button
                  class="btn btn-sm btn-outline-secondary"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Copy Comment ID"
                  @click="copyCommentId(comment._id)"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </th>
              <td>
                <!-- If handle or user is null, set author as Unknown -->
                {{ displayName(comment) }}
              </td>
              <td>{{ comment.comment }}</td>
              <td>{{ formatDate(comment.createdAt) }}</td>
              <td>
                <button
                  class="btn btn-sm me-2 btn-outline-danger"
                  @click="openDeleteCommentModal(comment)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
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

        <!-- Display number of comments being show out of total -->
        <div class="text-muted">
          Showing {{ (currentPage - 1) * limit + 1 }} -
          {{ (currentPage - 1) * limit + comments.length }} of
          {{ totalComments }} comments
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
import DeleteCommentModal from "@/components/Modal/DeleteCommentModal.vue";

export default {
  data() {
    return {
      comments: [],
      currentPage: 1, // Current page
      totalPages: 1, // Total number of pages
      limit: 10, // Number of comments per page
      totalComments: 0, // Total number of comments
      searchQuery: "", // Add this property for search
      refreshingComments: false,
    };
  },
  methods: {
    async fetchComments() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("/v1/comments", {
          params: {
            page: this.currentPage,
            limit: this.limit,
            search: this.searchQuery, // Include search query in API request
          },
        });
        this.comments = response.data.data.comments;
        this.totalPages = response.data.data.maxPages;
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchComments();
      }
    },
    changeMaxItemsPerPage(value) {
      this.limit = value;
      this.currentPage = 1; // Reset to the first page when changing items per page
      this.fetchComments();
    },
    async fetchTotalComments() {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      axios
        .get("/v1/admin/analytics")
        .then((res) => {
          this.totalComments = res.data.data.comments;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    copyCommentId(id) {
      navigator.clipboard.writeText(id);
    },
    async refreshComments() {
      this.refreshingComments = true;
      this.fetchComments();
      this.refreshingComments = false;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      // Then specify how you want your dates to be formatted
      return new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
        date
      );
    },
    displayName(commentObject) {
      // If user is null, set author as Unknown
      if (!commentObject.user) {
        return "Unknown";
      } else {
        return commentObject.user.handle;
      }
    },
    async openDeleteCommentModal(comment) {
      let parent = this;
      const { open, close } = useModal({
        component: DeleteCommentModal,
        attrs: {
          comment: comment,
          onCancel() {
            close();
          },
          async onDelete(id) {
            // Remove the comment from the comments array
            parent.comments = parent.comments.filter(
              (comment) => comment._id !== id
            );

            // Update the total number of comments
            parent.totalComments -= 1;
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
    this.fetchComments();
    this.fetchTotalComments();
  },
};
</script>
