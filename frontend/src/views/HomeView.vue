<template>
  <div class="container feed-container">
    <div class="scrollable-feed">
      <div v-if="loadingPosts" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>

      <PostComponent v-for="post in posts" :key="post._id" :post="post" />
    </div>
  </div>
</template>

<style scoped>
.feed-container {
  padding: 0 15px;
  margin-top: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
}

/* Scrollable feed must always be in the screen, never go below it */
.scrollable-feed {
  height: calc(100vh - 130px);
  overflow-y: scroll;
}
</style>

<script>
import PostComponent from "@/components/PostComponent.vue";

export default {
  components: {
    PostComponent,
  },
  data() {
    return {
      posts: [],
      loadingPosts: true,
      page: 0,
      limit: 10,
      maxPages: null,
      reachedBottom: false,
    };
  },
  methods: {
    // other methods...
    getPosts() {
      // If we've reached the bottom, don't load more posts
      if (this.reachedBottom === true) {
        console.log("Reached bottom, no more posts to load!");
        return;
      }

      // Set loadingPosts to true to show a spinner
      this.loadingPosts = true;

      // Increase the page number for next request
      this.page += 1;

      console.log("Loading posts on page " + this.page);

      // Make a GET request to our API endpoint
      this.$store
        .dispatch("getPosts", {
          page: this.page,
          limit: this.limit,
        })
        .then((data) => {
          // Append new posts to existing posts
          this.posts = [...this.posts, ...data.data.posts];

          // Set pagination data
          this.maxPages = data.data.maxPages;
          this.page = data.data.page;
          this.limit = data.data.limit;

          console.log("Posts loaded!");

          // Set reachedBottom to true if there are no more posts to load
          if (this.page > this.maxPages || this.page === this.maxPages) {
            console.log("Reached bottom, no more posts to load!");
            this.reachedBottom = true;
          }
          this.loadingPosts = false;
        })
        .catch((err) => console.log(err));
    },
    handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } =
        this.$el.querySelector(".scrollable-feed");

      // Calculate the percentage of the content that has been scrolled
      const scrolledPercentage =
        ((scrollTop + clientHeight) / scrollHeight) * 100;

      // If scrolled approximately 75% of the total content, fetch more posts
      if (scrolledPercentage >= 75) {
        // Near the bottom, get the next set of posts
        if (this.reachedBottom === false && this.loadingPosts === false) {
          this.getPosts();
        }
      }
    },
  },
  computed: {
    // computed properties...
  },
  mounted() {
    // Code to run when the component is mounted...
    console.log("Loading posts...");

    // Pull posts from the API
    this.getPosts();

    // Add event listener for the scroll event
    this.$el
      .querySelector(".scrollable-feed")
      .addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    // Remove event listener for the scroll event
    this.$el
      .querySelector(".scrollable-feed")
      .removeEventListener("scroll", this.handleScroll);
  },
};
</script>
