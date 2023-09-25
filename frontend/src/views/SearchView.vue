<template>
  <div class="container mt-5">
    <h1 class="mb-4">Search Page</h1>
    <div class="mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Search for posts..."
        v-model="query"
        @input="onSearchInput"
      />
    </div>
    <div v-if="searchResults.length > 0">
      <div v-for="post in searchResults" :key="post._id" class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">{{ post.title }}</h5>
          <div
            v-html="renderMarkdown(post.content)"
            class="card-text markdown-content"
          ></div>
          <router-link
            :to="`/post/${post._id}`"
            class="btn btn-primary btn-sm mt-2"
            >Read More</router-link
          >
        </div>
      </div>
    </div>
    <div v-else>No search results found and no recommendations available.</div>
  </div>
</template>

<script>
import axios from "axios";
import showdown from "showdown";

export default {
  data() {
    return {
      query: "",
      searchResults: [],
    };
  },
  methods: {
    async onSearchInput() {
      if (this.query.length >= 1) {
        try {
          const response = await axios.get(`/v1/posts?search=${this.query}`);
          var data = await response.data;
          this.searchResults = data.data.posts;

          if (!this.searchResults.length) {
            // TODO: Implement recommendations
            // this.searchResults = await this.getRandomRecommendations();
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        this.searchResults = [];
      }
    },
    renderMarkdown(content) {
      const converter = new showdown.Converter();
      return converter.makeHtml(content);
    },
  },
};
</script>

<!-- Add necessary styles in the <style> section -->

<style scoped>
.markdown-content {
  overflow-y: auto;
  max-height: 200px;
  border-top: 1px solid #e5e5e5;
  padding-top: 10px;
}

.markdown-content img {
  max-width: 100%;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.markdown-content p {
  margin-bottom: 10px;
}

.markdown-content a {
  color: #3498db;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 20px;
  margin-bottom: 10px;
}

.markdown-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 10px;
  color: #777;
}
</style>
