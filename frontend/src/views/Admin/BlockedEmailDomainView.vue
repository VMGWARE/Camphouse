<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Blocked Email Domains</h1>

      <!-- Refresh button -->
      <button class="btn btn-secondary" @click="refreshBlockedDomains">
        <i class="fas fa-sync-alt" v-if="!refreshingBlockedDomains"></i>
        <i class="fas fa-sync-alt fa-spin" v-else></i>

        Refresh
      </button>
    </div>

    <!-- blockedDomains -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- Create Domain -->
      <button class="btn btn-primary" @click="openAddDomainModal">
        <i class="fas fa-plus"></i>
        Create Domain
      </button>

      <!-- Search input -->
      <div class="form-inline">
        <input
          type="text"
          class="form-control"
          placeholder="Search by domain"
          v-model="searchQuery"
          @input="fetchBlockedDomains"
        />
      </div>
    </div>

    <div class="card mb-3">
      <!-- blockedDomains -->
      <div class="table-responsive">
        <table class="table table-dark">
          <thead>
            <tr>
              <th>Id</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="domain in blockedDomains" :key="domain._id">
              <td>
                <!-- Button to copy domain id -->
                <button
                  class="btn btn-sm btn-outline-secondary"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Copy Domain Id"
                  @click="copyDomainId(domain._id)"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </td>
              <td>{{ domain.domain }}</td>
              <td>{{ domain.isBlocked ? "Blocked" : "Not Blocked" }}</td>
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
                      @click="openUpdateDomainModal(domain)"
                      >Edit</a
                    >
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openDeleteDomainModal(domain)"
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

        <!-- Display number of blockedDomains being show out of total -->
        <div class="text-muted">
          Showing {{ (currentPage - 1) * limit + 1 }} -
          {{ (currentPage - 1) * limit + blockedDomains.length }} of
          {{ totalBlockedDomains }} blockedDomains
        </div>

        <!-- Bootstrap Pagination -->
        <nav aria-label="Domain pagination">
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
import DeleteDomainModal from "@/components/Modal/DeleteDomainModal.vue";
import UpdateDomainModal from "@/components/Modal/UpdateDomainModal.vue";

export default {
  data() {
    return {
      blockedDomains: [],
      currentPage: 1, // Current page
      totalPages: 1, // Total number of pages
      limit: 10, // Number of blockedDomains per page
      totalBlockedDomains: 0, // Total number of blockedDomains
      searchQuery: "", // Add this property for search
      refreshingBlockedDomains: false,
    };
  },
  methods: {
    async fetchBlockedDomains() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("/v1/blocked-email-domains", {
          params: {
            page: this.currentPage,
            limit: this.limit,
            search: this.searchQuery, // Include search query in API request
          },
        });
        this.blockedDomains = response.data.data.blockedEmailDomains;
        this.totalPages = response.data.data.maxPages;
      } catch (error) {
        console.error("Error fetching blockedDomains:", error);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchBlockedDomains();
      }
    },
    changeMaxItemsPerPage(value) {
      this.limit = value;
      this.currentPage = 1; // Reset to the first page when changing items per page
      this.fetchBlockedDomains();
    },
    async fetchTotalBlockedDomains() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/admin/analytics")
        .then((res) => {
          this.totalBlockedDomains = res.data.data.blockedEmailDomains;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    copyDomainId(id) {
      navigator.clipboard.writeText(id);
    },
    async refreshBlockedDomains() {
      this.refreshingBlockedDomains = true;
      this.fetchBlockedDomains();
      this.refreshingBlockedDomains = false;
    },
    async openDeleteDomainModal(domain) {
      let parent = this;
      const { open, close } = useModal({
        component: DeleteDomainModal,
        attrs: {
          domain: domain,
          onCancel() {
            close();
          },
          async onDelete(id) {
            // Remove the deleted domain from the list
            parent.blockedDomains = parent.blockedDomains.filter(
              (domain) => domain._id !== id
            );

            // Update the total number of blockedDomains
            parent.totalBlockedDomains -= 1;

            close();
          },
        },
      });
      open();
    },
    async openUpdateDomainModal(domain) {
      let parent = this;
      const { open, close } = useModal({
        component: UpdateDomainModal,
        attrs: {
          domain: domain,
          onCancel() {
            close();
          },
          async onUpdate(updatedDomain) {
            // Update the domain in the list
            const index = parent.blockedDomains.findIndex(
              (domain) => domain._id === updatedDomain._id
            );
            parent.blockedDomains[index] = updatedDomain;

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
    this.fetchBlockedDomains();
    this.fetchTotalBlockedDomains();
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
