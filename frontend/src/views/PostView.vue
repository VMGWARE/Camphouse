<template>
  <div class="container">
    <div class="scrollable-feed">
      <PostComponent :post="post" v-if="!loading" />
      <div class="card mb-3" v-else>
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="ms-3">
              <p class="card-text mb-0">Loading post...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollable feed must always be in the screen, never go below it */
.scrollable-feed {
  height: calc(100vh - 130px);
  overflow-y: scroll;
}
</style>

<script>
import PostComponent from "@/components/PostComponent.vue";
import axios from "axios";

export default {
  name: "PostView",
  components: {
    PostComponent,
  },
  data() {
    return {
      post: [],
      loading: true,
    };
  },
  methods: {
    getPost(id) {
      this.loading = true;
      if (localStorage.getItem("token")) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
      }
      axios
        .get("/v1/posts/" + id)
        .then((response) => {
          this.post = response.data.data;
          this.loading = false;
          document.title = `${this.post.title} - Camphouse`;
        })
        .catch((error) => {
          console.error(error);
          this.loading = false;
        });
    },
  },
  mounted() {
    console.log("Loading post with id: " + this.$route.params.id);

    this.getPost(this.$route.params.id);
  },
};
</script>
