<template>
  <div class="container mt-5">
    <div class="create-post-card">
      <div class="card-header">
        <h2>Create a Post</h2>
        <div class="markdown-toolbar">
          <button class="icon-btn" @click="markdownAdd('header')">
            <i class="fa fa-text-height"></i>
          </button>
          <button class="icon-btn" @click="markdownAdd('bold')">
            <i class="fa fa-bold"></i>
          </button>
          <button class="icon-btn" @click="markdownAdd('italic')">
            <i class="fa fa-italic"></i>
          </button>
          <button class="icon-btn" @click="markdownAdd('link')">
            <i class="fa fa-link"></i>
          </button>
          <button class="icon-btn" @click="markdownAdd('image')">
            <i class="fa fa-image"></i>
          </button>
          <button class="icon-btn" @click="markdownAdd('list')">
            <i class="fa fa-list"></i>
          </button>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="createPost" class="post-form">
          <div class="form-group">
            <label for="title">Title</label>
            <input
              type="text"
              class="form-input"
              id="title"
              name="title"
              placeholder="Enter title"
              required
              v-model="title"
              :class="{ 'is-invalid': errors.title }"
            />
            <div class="invalid-feedback">{{ errors.title }}</div>
          </div>

          <div class="content-preview-container">
            <div class="content-area">
              <label for="content">Content</label>
              <textarea
                class="form-input"
                id="content"
                name="content"
                rows="10"
                placeholder="Enter content"
                required
                v-model="content"
                :class="{ 'is-invalid': errors.content }"
                maxlength="1000"
              ></textarea>
              <div
                class="char-counter"
                :class="{ 'char-limit': content.length >= 1000 }"
              >
                {{ content.length }} / 1000
              </div>
              <div class="invalid-feedback">{{ errors.content }}</div>
            </div>

            <div
              id="preview"
              class="preview-pane"
              v-html="convertToMarkdown(content)"
            ></div>
          </div>

          <div
            :class="
              status === 'success'
                ? 'alert alert-success'
                : 'alert alert-danger'
            "
            role="alert"
            class="mt-4"
            v-if="status"
          >
            <span v-if="status === 'success'">Post created successfully!</span>
            <span v-else>There was an error creating your post.</span>
          </div>

          <button
            type="submit"
            class="btn-submit btn-block mt-4"
            :disabled="processing"
          >
            <span v-if="processing"
              ><i class="bi bi-hourglass"></i> Creating Post...</span
            >
            <span v-else><i class="bi bi-check-circle"></i> Create Post</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  background-color: #121212;
  color: #ffffff;
}

.create-post-card {
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.card-header {
  background-color: #121212;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
}

.markdown-toolbar {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: #282828;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 1rem;
  color: #bbb;
}

.icon-btn:hover {
  background-color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-input,
textarea.form-input {
  background-color: #1e1e1e;
  color: #ffffff;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #333;
  border-radius: 4px;
  outline: none;
}

.form-input::placeholder,
textarea.form-input::placeholder {
  color: #888;
}

textarea.form-input {
  resize: vertical;
}

.invalid-feedback {
  color: #ff5555;
  font-size: 0.875rem;
  margin-top: 8px;
}

.preview-pane {
  margin-top: 16px;
  padding: 16px;
  background-color: #121212;
  border-radius: 4px;
  color: #ffffff;
  overflow-wrap: break-word;
  overflow-x: auto;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-submit:hover {
  background-color: #45a049;
}

.alert-success {
  background-color: #32a852;
}

.alert-error {
  background-color: #a83232;
}

.char-counter {
  margin-top: 4px;
  color: #bbb;
  font-size: 0.875rem;
}

.char-limit {
  color: #ff5555;
}

/* Existing styles */

.content-preview-container {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.content-area,
.preview-pane {
  flex: 1;
}

.preview-pane {
  background-color: #282828; /* Slightly different background for distinction */
  padding: 16px;
  border-radius: 4px;
  color: #ffffff;
  overflow-wrap: break-word;
  overflow-x: auto;
  height: fit-content; /* Adjust height to match content area */
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-preview-container {
    flex-direction: column;
  }
}

/* Other UI Enhancements */
.btn-submit {
  transition: background-color 0.3s, box-shadow 0.3s;
}

.btn-submit:hover,
.btn-submit:focus {
  background-color: #3e8e41; /* Slightly lighter green for hover state */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Subtle shadow for depth */
}

.form-input:focus,
textarea.form-input:focus {
  border-color: #ffc34d; /* Highlight focus state */
  box-shadow: 0 0 0 2px #ffc34d;
}

/* Improving Visibility */
.invalid-feedback {
  display: block; /* Ensure visibility even if no error message is present */
}
</style>

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

              // Wait 3 seconds then redirect to the new post
              setTimeout(() => {
                this.$router.push(`/post/${result.data._id}`);
              }, 1000);
            } else {
              this.status = "error";
              this.errors = result.response.data.data.errors;
            }
          })
          .catch((error) => {
            console.log(error);
            this.status = "error";
            this.errors = error.response.data.data.errors;
          })
          .finally(() => (this.processing = false));
      } else {
        this.processing = false;
      }
    },
    markdownAdd(type) {
      if (type === "header") {
        this.content += "# Replace with text...";
        this.content += "\n";
      }
      if (type === "bold") {
        this.content += "**Replace with text...**";
        this.content += "\n";
      }
      if (type === "italic") {
        this.content += "*Replace with text...*";
        this.content += "\n";
      }
      if (type === "link") {
        this.content += "[Link Text](https://camphouse.vmgware.dev/)";
        this.content += "\n";
      }
      if (type === "image") {
        this.content +=
          "![A Default profile icon!](https://camphouse.vmgware.dev/images/profiles/ProfilePicture.png)";
        this.content += "\n";
      }
      if (type === "list") {
        this.content += "- Replace with list item...";
        this.content += "\n";
      }
    },
  },
};
</script>
