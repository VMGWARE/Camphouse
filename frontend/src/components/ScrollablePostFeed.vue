<template>
  <div
    ref="scrollableFeed"
    :class="{
      'scrollable-feed': posts.length > 0,
    }"
  >
    <div v-if="loadingPosts" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <PostComponent
      v-for="post in posts"
      :key="post._id"
      :post="post"
      @post-deleted="handlePostDeleted"
    />
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

export default {
  components: {
    PostComponent,
  },
  props: {
    search: {
      type: String,
      default: "",
    },
    userid: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      posts: [],
      loadingPosts: true,
      page: 0,
      limit: 10,
      maxPages: null,
      reachedBottom: false,
      query: "",
    };
  },
  methods: {
    handlePostDeleted(deletedPostId) {
      console.log("Post Deleted: ", deletedPostId);

      // Remove the post with the specified _id from the posts array
      this.posts = this.posts.filter((post) => post._id !== deletedPostId);
    },
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
          search: this.search,
          userid: this.userid,
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
      if (this.$refs.scrollableFeed) {
        const { scrollTop, scrollHeight, clientHeight } =
          this.$refs.scrollableFeed;

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
      } else {
        console.error("Scrollable feed not found!");
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
    this.$refs.scrollableFeed.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    // Remove event listener for the scroll event
    this.$refs.scrollableFeed.removeEventListener("scroll", this.handleScroll);
  },
  // If the userid or search props change, reset the posts array and pagination
  watch: {
    userid() {
      this.posts = [];
      this.page = 0;
      this.maxPages = null;
      this.reachedBottom = false;
      this.getPosts();
    },
    search() {
      this.posts = [];
      this.page = 0;
      this.maxPages = null;
      this.reachedBottom = false;
      this.getPosts();
    },
  },
};
</script>
