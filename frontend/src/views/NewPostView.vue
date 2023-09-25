<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <div class="card">
          <div class="card-header bg-dark text-white">
            <h2 class="mb-0">Create a Post</h2>
            <div class="btn-group">
              <button
                class="btn btn-sm btn-secondary"
                @click="markdownAdd('header')"
                id="addHeader"
              >
                Add Header
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="markdownAdd('bold')"
                id="addBold"
              >
                Add Bold
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="markdownAdd('italic')"
                id="addItalic"
              >
                Add Italic
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="markdownAdd('link')"
                id="addLink"
              >
                Add Link
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="markdownAdd('image')"
                id="addImage"
              >
                Add Image
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="markdownAdd('list')"
                id="addList"
              >
                Add List
              </button>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="createPost" method="POST">
              <div class="form-group">
                <label for="title">Title</label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  name="title"
                  placeholder="Enter the title of your post"
                  required
                  v-model="title"
                  :class="{ 'is-invalid': errors.title }"
                />
                <div class="invalid-feedback">{{ errors.title }}</div>
              </div>
              <div class="form-group">
                <label for="content">Content</label>
                <textarea
                  class="form-control"
                  id="content"
                  name="content"
                  rows="8"
                  placeholder="Enter the content of your post"
                  required
                  v-model="content"
                  :class="{ 'is-invalid': errors.content }"
                ></textarea>
                <div class="invalid-feedback">
                  {{ errors.content }}
                </div>
                <br />
                <div
                  id="preview"
                  class="form-control"
                  v-html="convertToMarkdown(content)"
                ></div>
                <small id="contentHelp" class="form-text text-muted"
                  >You can use Markdown to format your content.</small
                >
              </div>
              <br />
              <div
                :class="
                  status === 'success'
                    ? 'alert alert-success'
                    : 'alert alert-danger'
                "
                role="alert"
                v-if="status"
              >
                <span v-if="status === 'success'"
                  >Post created successfully!</span
                >
                <span v-else>There was an error creating your post.</span>
              </div>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="processing"
              >
                <span v-if="processing">
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating Post...
                </span>
                <span v-else>Create Post</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import showdown from "showdown";

export default {
  data() {
    return {
      title: "",
      content: "",
      errors: {},
      status: "",
      processing: false,
    };
  },
  methods: {
    convertToMarkdown(content) {
      const converter = new showdown.Converter();
      return converter.makeHtml(content);
    },
    createPost() {
      // Set processing to true
      this.processing = true;

      // Reset the status
      this.status = "";

      // Clear the errors
      this.errors = {};

      // Check if the title is empty
      if (!this.title) {
        this.errors.title = "Please provide a title.";
      }

      // Check if the content is empty
      if (!this.content) {
        this.errors.content = "Please provide some content.";
      }

      // Check if there are no errors
      if (!this.errors.title && !this.errors.content) {
        this.$store
          .dispatch("createPost", {
            title: this.title,
            content: this.content,
          })
          .then((result) => {
            if (result.code == 200) {
              this.status = "success";
              this.title = "";
              this.content = "";
            } else {
              this.status = "error";
            }
          })
          .catch((error) => {
            this.status = "error";
            this.errors = error.response.data.errors;
          })
          .finally(() => (this.processing = false));
      } else {
        this.processing = false;
      }
    },
    markdownAdd(type) {
      if (type === "header") {
        this.content += "# Replace with text...";
      }
      if (type === "bold") {
        this.content += "**Replace with text...**";
      }
      if (type === "italic") {
        this.content += "*Replace with text...*";
      }
      if (type === "link") {
        this.content += "[Link Text](https://app.camphouse.com/)";
      }
      if (type === "image") {
        this.content +=
          "![Alt Text](https://app.camphouse.com/images/branding/Camphouse-Icon-Light.png)";
      }
      if (type === "list") {
        this.content += "- Replace with list item...";
      }
    },
  },
};
</script>
