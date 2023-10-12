<template>
  <div class="card mb-2 comment">
    <div class="card-body">
      <div class="d-flex align-items-center">
        <router-link :to="'/@' + comment.user?.handle">
          <img
            :src="comment.user?.profilePicture"
            alt=""
            class="comment-profile-picture"
          />
        </router-link>
        <div>
          <p class="card-text mb-0">{{ comment.comment }}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted mr-2">
              Posted by {{ comment.user?.username }}
              {{
                new Date(comment.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
              at
              {{
                new Date(comment.createdAt).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
                })
              }}
            </small>
            <div
              class="comment-actions ml-auto"
              v-if="comment.user?._id === $store.state.user._id"
            >
              <div class="dropdown">
                <button
                  class="btn btn-sm text-light"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i class="fas fa-ellipsis-h"></i>
                </button>
                <div
                  class="dropdown-menu dropdown-menu-right"
                  aria-labelledby="dropdownMenuButton"
                >
                  <button
                    class="btn btn-edit btn-sm mr-2 dropdown-item"
                    type="button"
                    style="color: #fff; cursor: pointer"
                  >
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button
                    class="btn btn-delete btn-sm dropdown-item"
                    type="button"
                    @click="deleteComment(comment._id)"
                    style="color: #fff; cursor: pointer"
                  >
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-profile-picture:before {
  content: " ";
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  background-color: #ffc34d;
}

.btn-edit {
  background-color: #ffc34d;
  color: #fff;
  border-radius: 0.25rem;
  margin: 3px;
}

.btn-delete {
  background-color: #ff6666;
  color: #fff;
  border-radius: 0.25rem;
  margin: 3px;
}
</style>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  name: "CommentComponent",
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async deleteComment(commentId) {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;
        // Implement functionality to delete the post
        const response = await axios.delete(`/v1/comments/${commentId}`);
        if (response.status === 200) {
          this.$emit("commentDeleted", commentId);
        }
      } catch (error) {
        console.log(error);
        useToast().error("Error deleting comment. Please try again later.");
      }
    },
  },
};
</script>
