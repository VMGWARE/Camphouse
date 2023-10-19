<template>
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
          <h1>{{ stats.totalSignIns }}</h1>
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
          <h1>{{ stats.totalLogouts }}</h1>
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
          <h1>{{ stats.totalAccountCreated }}</h1>
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
          <h1>{{ stats.totalAccountDeleted }}</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- Line chart that can filter between each action, pie chart that shows the percentage of each action -->
  <div class="row">
    <div class="col-md-6">
      <div class="card mb-3">
        <div class="card-header">
          <h5>
            <i class="fas fa-chart-line"></i>
            Audit Log Line Chart
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
          <h5>
            <i class="fas fa-chart-pie"></i>
            Audit Log Pie Chart
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
      stats: {},
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
    };
  },
  components: {
    Line,
    Pie,
  },
  methods: {
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
        .get("/v1/audit-logs/chart-by-action")
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

      const datasets = Object.keys(tempData).map((action) => {
        return {
          label: action.replace("_", " "),
          data: tempData[action],
          borderColor: this.getRandomColor(),
          fill: false,
        };
      });

      this.auditLogLineChartData.labels = labels;
      this.auditLogLineChartData.datasets = datasets;

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
        pieBackgroundColors.push(this.getRandomColor());
      }

      this.auditLogPieChartData.labels = pieLabels;
      this.auditLogPieChartData.datasets[0].data = pieData;
      this.auditLogPieChartData.datasets[0].backgroundColor =
        pieBackgroundColors;
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
