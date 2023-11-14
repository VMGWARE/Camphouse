<template>
  <div>
    <!-- Welcome message -->
    <div class="row">
      <div class="col-md-12">
        <div class="card mb-3">
          <div class="card-header">
            <h4>Audit Log Dashboard</h4>
          </div>
          <div class="card-body">
            <p>
              Welcome to the Audit Log Dashboard. This is where you can view the
              audit logs of the Camphouse application.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats: Sign In, Logout, etc -->
    <div class="row">
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-header">
            <h5>
              <i class="fas fa-sign-in-alt"></i>
              Sign In
            </h5>
          </div>
          <div class="card-body">
            <h1 v-if="stats.ACCOUNT_LOGIN === null">
              <i class="fas fa-spinner fa-spin"></i>
            </h1>
            <h1 v-else>{{ stats.ACCOUNT_LOGIN ? stats.ACCOUNT_LOGIN : 0 }}</h1>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-header">
            <h5>
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </h5>
          </div>
          <div class="card-body">
            <h1 v-if="stats.ACCOUNT_LOGOUT === null">
              <i class="fas fa-spinner fa-spin"></i>
            </h1>
            <h1 v-else>
              {{ stats.ACCOUNT_LOGOUT ? stats.ACCOUNT_LOGOUT : 0 }}
            </h1>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-header">
            <h5>
              <i class="fas fa-user-plus"></i>
              Account Created
            </h5>
          </div>
          <div class="card-body">
            <h1 v-if="stats.ACCOUNT_CREATED === null">
              <i class="fas fa-spinner fa-spin"></i>
            </h1>
            <h1 v-else>
              {{ stats.ACCOUNT_CREATED ? stats.ACCOUNT_CREATED : 0 }}
            </h1>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-header">
            <h5>
              <i class="fas fa-user-minus"></i>
              Account Deleted
            </h5>
          </div>
          <div class="card-body">
            <h1 v-if="stats.ACCOUNT_DELETED === null">
              <i class="fas fa-spinner fa-spin"></i>
            </h1>
            <h1 v-else>
              {{ stats.ACCOUNT_DELETED ? stats.ACCOUNT_DELETED : 0 }}
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Line chart that can filter between each action, pie chart that shows the percentage of each action -->
    <div class="row">
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-header">
            <h5 class="d-flex justify-content-between align-items-center">
              Audit Log Line Chart

              <select v-model="selectedDays" @change="updateCharts">
                <option value="1">Last 24 hours</option>
                <option value="7" selected>Last week</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </h5>
          </div>
          <div class="card-body">
            <Line
              :data="auditLogLineChartData"
              :options="auditLogLineChartOptions"
              v-if="auditLogLineChartData.labels.length > 0"
            />
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-header">
            <h5 class="d-flex justify-content-between align-items-center">
              Audit Log Pie Chart

              <select v-model="selectedDays" @change="updateCharts">
                <option value="1">Last 24 hours</option>
                <option value="7" selected>Last week</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </h5>
          </div>
          <div class="card-body">
            <Pie
              :data="auditLogPieChartData"
              :options="pieChartOptions"
              v-if="auditLogPieChartData.labels.length > 0"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default {
  data() {
    return {
      stats: {
        ACCOUNT_LOGIN: null,
        ACCOUNT_LOGOUT: null,
        ACCOUNT_CREATED: null,
        ACCOUNT_DELETED: null,
      },
      auditLogLineChartData: {
        labels: [],
        datasets: [],
      },
      auditLogLineChartOptions: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              callback: function (value) {
                if (value % 1 === 0) {
                  return value;
                }
              },
            },
          },
        },
      },
      auditLogPieChartData: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
      pieChartOptions: {
        responsive: true,
        legend: {
          position: "top",
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
      selectedDays: 7,
    };
  },
  components: {
    Line,
    Pie,
  },
  methods: {
    updateCharts() {
      this.getStats();
      this.fetchChartData();
    },

    getStats() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      axios
        .get("/v1/audit-logs/stats")
        .then((res) => {
          this.stats = res.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    fetchChartData() {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");

      axios
        .get("/v1/audit-logs/chart-by-action", {
          params: { days: this.selectedDays },
        })
        .then((res) => {
          this.processChartData(res.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    processChartData(apiData) {
      const labels = [];
      const tempData = {};

      // Initialize the data structure
      apiData.forEach((entry) => {
        labels.push(entry.date);

        for (const action in entry.actions) {
          if (!tempData[action]) {
            tempData[action] = [];
          }
        }
      });

      labels.forEach((label) => {
        const dataEntry = apiData.find((e) => e.date === label) || {
          actions: {},
        };

        for (const action in tempData) {
          tempData[action].push(dataEntry.actions[action] || 0);
        }
      });

      // Define fixed colors for each action type
      const actionColors = {
        ACCOUNT_LOGIN: "#007bff",
        LIKE_CREATED: "#28a745",
        ACCOUNT_LOGOUT: "#dc3545",
        ACCOUNT_TOKEN_REFRESHED: "#ffc107",
        ACCOUNT_UPDATED: "#17a2b8",
        COMMENT_CREATED: "#6c757d",
        ACCOUNT_CREATED: "#343a40",
        POST_CREATED: "#6610f2",
        POST_DELETED: "#e83e8c",
      };

      // Create a new object for Line Chart Data
      this.auditLogLineChartData = {
        labels: labels,
        datasets: Object.keys(tempData).map((action) => {
          return {
            label: action.replaceAll("_", " "),
            data: tempData[action],
            borderColor: actionColors[action] || this.getRandomColor(),
            fill: false,
          };
        }),
      };

      const actionCounts = {};
      apiData.forEach((entry) => {
        for (const action in entry.actions) {
          if (!actionCounts[action]) actionCounts[action] = 0;
          actionCounts[action] += entry.actions[action];
        }
      });

      const pieLabels = [];
      const pieData = [];
      const pieBackgroundColors = [];

      for (const action in actionCounts) {
        pieLabels.push(action.replace("_", " "));
        pieData.push(actionCounts[action]);
        pieBackgroundColors.push(actionColors[action] || this.getRandomColor());
      }

      // Create a new object for Pie Chart Data
      this.auditLogPieChartData = {
        labels: pieLabels,
        datasets: [
          {
            data: pieData,
            backgroundColor: pieBackgroundColors,
          },
        ],
      };
    },

    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
  },
  mounted() {
    this.getStats();
    this.fetchChartData(); // Fetch chart data when the component is mounted
  },
};
</script>

<style scoped src="@/assets/stylesheets/admin.css"></style>

<style scoped>
/* Style the dropdown/select, should be a dark color */
select {
  background-color: #343a40;
  color: white;
  padding: 12px;
  border: none;
  font-size: 16px;
  border-radius: 4px;
}

/* Style the arrow inside the select element */
select::after {
  content: "";
  position: absolute;
  top: 14px;
  right: 10px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-color: #fff transparent transparent transparent;
}

/* If the select box is clicked, close any other select boxes, and open/close the current select box: */
select:focus {
  outline: none;
}

/* Style the items (options), including the selected item */
option {
  background-color: #343a40;
  color: white;
  padding: 12px;
  border: none;
  font-size: 16px;
  border-radius: 4px;
}

option:hover {
  background-color: #343a40;
  color: white;
  padding: 12px;
  border: none;
  font-size: 16px;
  border-radius: 4px;
}

option:selected {
  background-color: #343a40;
  color: white;
  padding: 12px;
  border: none;
  font-size: 16px;
  border-radius: 4px;
}
</style>
