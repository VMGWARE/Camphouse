<template>
  <div class="container feed-container">
    <ScrollablePostFeed />
  </div>
</template>

<script setup>
useSeoMeta({
  title: "Home",
});

definePageMeta({
  middleware: ["auth"],
});
</script>

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
