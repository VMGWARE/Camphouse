// Key Dependencies
import { createApp, h } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

// DOMPurify
import VueDOMPurifyHTML from "vue-dompurify-html";

// Custom CSS
import "@/assets/stylesheets/style.css";

// Bootstrap
import "bootstrap";

// Vue Toastification
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Vue Modal
import { createVfm } from "vue-final-modal";
const vfm = createVfm();
import "vue-final-modal/style.css";

// Vue Toastification Options
const ToastOptions = {
  position: "bottom-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.7,
};

// Exceptionless
import { Exceptionless } from "@exceptionless/browser";

await Exceptionless.startup((c) => {
  c.apiKey = process.env.VUE_APP_EXCEPTIONLESS_API_KEY;
  c.serverUrl = process.env.VUE_APP_EXCEPTIONLESS_SERVER_URL;
});

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
app.use(vfm);
app.use(VueDOMPurifyHTML);
app.mount("#app");
