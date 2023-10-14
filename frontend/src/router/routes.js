import HomeView from "@/views/HomeView.vue";
import ProfileView from "@/views/ProfileView.vue";
import LoginView from "@/views/LoginView.vue";
import SignUpView from "@/views/SignUpView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import MessageView from "@/views/MessageView.vue";
import SettingsView from "@/views/SettingsView.vue";
import NotificationsView from "@/views/NotificationsView.vue";
import SearchView from "@/views/SearchView.vue";
import PostView from "@/views/PostView.vue";
import NewPostView from "@/views/NewPostView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "Home",
    },
  },
  {
    path: "/search",
    name: "search",
    component: SearchView,
    meta: {
      title: "Search",
    },
  },
  {
    path: "/post/:id",
    name: "post",
    component: PostView,
    meta: {
      title: "Post",
      public: true,
    },
  },
  {
    path: "/new-post",
    name: "new-post",
    component: NewPostView,
    meta: {
      title: "New Post",
    },
  },
  {
    path: "/@:handle",
    name: "profile",
    component: ProfileView,
    meta: {
      title: "Profile",
      public: true,
    },
  },
  {
    path: "/notifications",
    name: "notifications",
    component: NotificationsView,
    meta: {
      title: "Notifications",
    },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: {
      title: "Login",
    },
  },
  {
    path: "/signup",
    name: "signup",
    component: SignUpView,
    meta: {
      title: "Sign Up",
    },
  },
  {
    path: "/messages/:userId?",
    name: "Messages",
    component: MessageView,
    meta: {
      title: "Messages",
    },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
    meta: {
      title: "Settings",
    },
  },
  {
    path: "/admin/",
    name: "admin",
    component: () => import("@/views/Admin/DashboardView.vue"),
    meta: {
      title: "Admin",
      layout: "admin",
    },
  },
  {
    path: "/admin/reports",
    name: "admin-reports",
    component: () => import("@/views/Admin/ReportsView.vue"),
    meta: {
      title: "Reports - Admin",
      layout: "admin",
    },
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("@/views/Admin/UsersView.vue"),
    meta: {
      title: "Users - Admin",
      layout: "admin",
    },
  },
  {
    path: "/admin/reports/:id",
    name: "admin-report",
    component: () => import("@/views/Admin/ReportView.vue"),
    meta: {
      title: "Report - Admin",
      layout: "admin",
    },
  },
  {
    path: "/view-report/:id",
    name: "view-report",
    component: () => import("@/views/Reports/ViewReportView.vue"),
    meta: {
      title: "View Report",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundView,
    meta: {
      title: "Not Found",
    },
  },
];

export default routes;
