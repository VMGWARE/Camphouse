<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="d-flex align-items-center mb-3">
          <template v-if="thisPost.user">
            <router-link :to="'/@' + thisPost.user.handle">
              <img
                :src="thisPost.user.profilePicture"
                alt=""
                class="post-profile-picture"
              />
            </router-link>
            <div>
              <router-link :to="'/post/' + thisPost._id" class="text-dark">
                <h5 class="card-title mb-0">
                  {{ thisPost.title }}
                </h5>
              </router-link>
              <p class="card-subtitle text-muted mb-0">
                @{{ thisPost.user.handle }}
              </p>
            </div>
          </template>
          <p v-else class="text-danger">User not found for this Post.</p>
        </div>

        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownPostOptions"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i class="fas fa-ellipsis-h"></i>
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownPostOptions">
            <!-- TODO: This dropdown can also hold the report button -->
            <a
              class="dropdown-item fake-link custom-dropdown-item text-dark"
              href="#"
              @click="
                openModalWithInfo(
                  `Reporting ${thisPost.user.handle}'s post '${thisPost.title}'.`,
                  thisPost._id,
                  'Post'
                )
              "
            >
              <i class="fas fa-flag"></i>
              Report Post</a
            >
            <a
              v-if="canEditOrDelete"
              class="dropdown-item fake-link custom-dropdown-item text-primary"
              href="#"
            >
              <i class="fas fa-edit"></i>
              Edit Post</a
            >
            <a
              v-if="canEditOrDelete"
              class="dropdown-item fake-link custom-dropdown-item text-danger"
              @click="deletePost"
            >
              <i class="fas fa-trash"></i>
              Delete Post</a
            >
          </div>
        </div>
      </div>

      <p
        :id="'markdownContent' + thisPost._id"
        class="card-text post-content"
        v-html="convertToMarkdown(thisPost.content)"
      />

      <form>
        <input type="hidden" :value="thisPost._id" />
        <button type="button" class="btn btn-like" @click="likePost">
          <i v-if="thisPost.isLiked" class="fas fa-heart liked"></i>
          <i v-else class="fas fa-heart"></i>
          <span class="like-count">
            {{ thisPost.likes }}
          </span>
          <span v-if="thisPost.likes === 1">Like</span>
          <span v-else>Likes</span>
        </button>

        <!-- Share button -->
        <button
          type="button"
          class="btn btn-share"
          :class="{ 'btn-shared': shared }"
          @click="sharePost"
        >
          <i class="fas fa-share-alt"></i> Share
        </button>
      </form>

      <!-- ... Rest of the template (comments, etc.) ... -->
      <!-- Comment Posting Section -->

      <!-- Existing Comments Section -->
      <h6 class="card-subtitle mt-3 mb-2 text-muted">Comments</h6>

      <div v-if="thisPost.comments.length > 0" class="mb-3 comments">
        <CommentComponent
          :comment="comment"
          v-for="comment in thisPost.comments"
          :key="comment._id"
          :id="'comment_' + comment._id"
        />
      </div>
      <div v-else>
        <p class="text-muted">No comments yet.</p>
      </div>
      <div>
        <div class="form-group">
          <textarea
            v-model="commentText"
            class="form-control"
            placeholder="Add a comment..."
          ></textarea>
        </div>
        <br />
        <button
          @click="postComment"
          class="btn btn-primary mt-2"
          v-if="$store.state.loggedIn"
        >
          Post Comment
        </button>
        <button disabled type="submit" class="btn btn-primary" v-else>
          Login to Comment
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import showdown from "showdown";
import { useToast } from "vue-toastification";
import CommentComponent from "@/components/Post/CommentComponent.vue";
import axios from "axios";
import { mapState } from "vuex";
import { useModal } from "vue-final-modal";
import ModalReport from "@/components/Modal/ModalReport.vue";

export default {
  name: "PostComponent",
  components: {
    CommentComponent,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      shared: false,
      commentText: "", // for holding the comment text
      thisPost: this.post,
    };
  },
  computed: {
    // Computed property to determine if the post is liked
    isPostLiked() {
      const likedPostIds =
        JSON.parse(localStorage.getItem("likedPostIds")) || [];
      return likedPostIds.includes(this.thisPost._id);
    },
    ...mapState(["user"]),
    canEditOrDelete() {
      return this.user && this.user._id === this.thisPost.user._id;
    },
  },
  methods: {
    convertToMarkdown(content) {
      const converter = new showdown.Converter();
      return converter.makeHtml(content);
    },
    sharePost() {
      const postLink = window.location.origin + "/post/" + this.thisPost._id;
      navigator.clipboard.writeText(postLink).then(
        () => {
          console.log("Share link: " + postLink);
          useToast().success("Post link copied to clipboard!", {
            timeout: 2000,
          });

          // Change the button color temporarily
          this.shared = true;
          setTimeout(() => {
            this.shared = false;
          }, 2000); // 2 seconds
        },
        () => {
          console.error("Failed to copy link!");
          useToast().error("Failed to copy link!");
        }
      );
    },
    async postComment() {
      if (!this.commentText.trim()) {
        return;
      }

      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;
        const response = await axios.post(
          `/v1/comments/post/${this.thisPost._id}`,
          {
            comment: this.commentText,
          }
        );

        if (response.status === 200) {
          useToast().success("Comment posted!");
          this.commentText = ""; // reset comment field

          // Log the comment
          console.log("Posted comment: " + this.commentText);

          // Add the comment to the post
          let commentbeingpushed = response.data.data;
          commentbeingpushed.user = this.$store.state.user;
          this.thisPost.comments.unshift(commentbeingpushed);

          // Scroll to the comment
          this.$nextTick(() => {
            const commentId = `#comment_${commentbeingpushed._id}`;
            const commentElement = document.querySelector(commentId);
            commentElement.scrollIntoView({ behavior: "smooth" });
          });
        } else if (response.status === 400) {
          useToast().success("Invalid content!");
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        useToast().error("Error posting comment. Please try again later.");
      }
    },
    async likePost() {
      if (!this.$store.state.loggedIn) {
        return;
      }

      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        const likedPostIds =
          JSON.parse(localStorage.getItem("likedPostIds")) || [];

        if (!this.thisPost.isLiked) {
          const response = await axios.post(`/v1/likes/${this.thisPost._id}`);
          if (response.status === 200) {
            likedPostIds.push(this.thisPost._id);
            localStorage.setItem("likedPostIds", JSON.stringify(likedPostIds));
            this.thisPost.likes++;
            this.thisPost.isLiked = true;
            console.log("Liked post with id: " + this.thisPost._id);
          } else if (response.status === 400) {
            useToast().success("You already liked this post!");
          }
        } else {
          // If the post is already liked, unlike it
          const response = await axios.delete(`/v1/likes/${this.thisPost._id}`);

          if (response.status === 200) {
            const index = likedPostIds.indexOf(this.thisPost._id);
            if (index > -1) {
              likedPostIds.splice(index, 1);
              localStorage.setItem(
                "likedPostIds",
                JSON.stringify(likedPostIds)
              );
            }
            this.thisPost.likes--;
            this.thisPost.isLiked = false;
            console.log("Unliked post with id: " + this.thisPost._id);
          } else if (response.status === 400) {
            useToast().success("You already unliked this post!");
          }
        }
      } catch (error) {
        console.error("Error liking/unliking post:", error);
        useToast().error(
          "Error liking/unliking thisPost. Please try again later."
        );
      }
    },
    async deletePost() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;
        // Implement functionality to delete the post
        const response = await axios.delete(`/v1/posts/${this.thisPost._id}`);
        if (response.data.code === 200) {
          // Emit an event to the parent component
          this.$emit("postDeleted", this.thisPost._id);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        useToast().error("Error deleting post. Please try again later.");
      }
    },
  },
  mounted() {
    // Check if the post is liked
    this.isLiked = this.thisPost.isLiked;
  },
  setup() {
    const openModalWithInfo = (info, id, type) => {
      console.log("Opening modal with info: " + info);

      // Assign the modal instance to a variable
      const { open, close } = useModal({
        component: ModalReport,
        attrs: {
          id,
          info,
          type,
          onSubmit(resp) {
            console.log("Submitted report:", resp);
            close();
          },
          onCancel() {
            console.log("Cancelled report");
            close();
          },
          onError(error) {
            console.error("Error submitting report:", error);
          },
        },
      });

      // Open the modal
      open();
    };

    return {
      openModalWithInfo,
    };
  },
};
</script>

<style scoped>
.liked {
  color: #ff0000;
}

/* Max height of comment area so I can actally view the comment I am responding to */
.comments {
  max-height: 300px;
  overflow-y: auto;
}

.post-profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.post-profile-picture:before {
  content: " ";
  display: block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  background-color: #ffc34d;
}

.post-content {
  margin-bottom: 10px;
}

.btn-like {
  margin-right: 10px;
}

.btn-share {
  margin-right: 10px;
}
/* Remove the weird thing surrounding the buttons after clicked */
.btn:active {
  outline: none;
  box-shadow: none;
}

.custom-dropdown-item {
  color: #000000;
}

.custom-dropdown-item:hover {
  background-color: #e9ecef;
}

.custom-dropdown-item:active {
  background-color: #e9ecef;
}
</style>
