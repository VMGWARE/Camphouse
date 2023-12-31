<template>
  <div
    ref="scrollableFeed"
    id="scrollable-feed"
    :class="{
      'scrollable-feed': posts.length > 0,
    }"
  >
    <div v-if="loadingPosts" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <!-- 
    <PostComponent
      v-for="post in posts"
      :key="post._id"
      :post="post"
      @post-deleted="handlePostDeleted"
    /> -->
  </div>
</template>

<script setup>
import { ref } from "vue";

// Vars
const posts = ref([]);
const loadingPosts = ref(true);
const page = ref(0);
const limit = ref(10);
const maxPages = ref(null);
const reachedBottom = ref(false);
const query = ref("");
const scrollableFeed = ref(null);

// Props
const props = defineProps({
  search: {
    type: String,
    default: "",
  },
  userid: {
    type: String,
    default: "",
  },
});

// Handle post deleted
const handlePostDeleted = (deletedPostId) => {
  // Remove the post from the posts array
  posts.value = posts.value.filter((post) => post._id !== deletedPostId);
};

// Get Posts
const getPosts = async () => {
  // If we've reached the bottom, don't load more posts
  if (reachedBottom.value) return;

  // Set loadingPosts to true to show a spinner
  loadingPosts.value = true;

  // Increase the page number for next request
  page.value++;

  // Get posts from the API
  const { data } = await useApiFetch(`/v1/posts`, {
    method: "GET",
    params: {
      page: page.value,
      limit: limit.value,
      search: props.search,
      userid: props.userid,
    },
  });

  // Append new posts to existing posts
  posts.value = [...posts.value, ...data.value.data.posts];

  // Set pagination data
  maxPages.value = data.value.data.maxPages;
  page.value = data.value.data.page;
  limit.value = data.value.data.limit;

  // Set reachedBottom to true if there are no more posts to load
  if (page.value > maxPages.value || page.value === maxPages.value) {
    reachedBottom.value = true;
  }
  loadingPosts.value = false;
};

// Handle scroll
const handleScroll = () => {
  if (scrollableFeed.value) {
    const scrollHeight = scrollableFeed.value.scrollHeight;
    const scrollTop = scrollableFeed.value.scrollTop;
    const clientHeight = scrollableFeed.value.clientHeight;

    // Calculate the percentage of the content that has been scrolled
    const scrolledPercentage =
      ((scrollTop + clientHeight) / scrollHeight) * 100;

    // If scrolled approximately 75% of the total content, fetch more posts
    if (scrolledPercentage >= 75) {
      // Near the bottom, get the next set of posts
      if (!reachedBottom.value && !loadingPosts.value) {
        getPosts();
      }
    }
  }
};

// Call getPosts() when the component is mounted
await getPosts();

// Attach event listener to the scrollable feed
onMounted(() => {
  scrollableFeed.value = document.querySelector("#scrollable-feed");
  scrollableFeed.value.addEventListener("scroll", handleScroll);
});

// Remove event listener when the component is unmounted
onUnmounted(() => {
  scrollableFeed.value.removeEventListener("scroll", handleScroll);
});

// Watch for changes to the search prop or userid prop and reset the posts array
watch([() => props.search, () => props.userid], () => {
  posts.value = [];
  page.value = 0;
  maxPages.value = null;
  reachedBottom.value = false;
  getPosts();
});
</script>

<style scoped>
/* Scrollable feed must always be in the screen, never go below it */
.scrollable-feed {
  height: calc(100vh - 130px);
  overflow-y: scroll;
}
</style>
