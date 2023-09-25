// Key Dependencies
import { createApp, h } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

// Custom CSS
import "@/assets/stylesheets/style.css";

// Bootstrap
import "bootstrap";

// Vue Toastification
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const ToastOptions = {
  position: "bottom-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.7,
};

const app = createApp({
  data() {
    return {
      appName: "Camphouse",
    };
  },
  render: () => h(App),
});

app.use(store);
app.use(router);
app.use(Toast, ToastOptions);
app.mount("#app");
