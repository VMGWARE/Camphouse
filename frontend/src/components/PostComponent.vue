<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex align-items-center mb-3">
        <template v-if="thisPost.user">
          <router-link :to="'/@' + thisPost.user.handle">
            <img
              :src="thisPost.user.profilePicture"
              alt="Profile Picture"
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
      <!-- TODO: Add way to post comment -->
    </div>
  </div>
</template>

<script>
import showdown from "showdown";
import { useToast } from "vue-toastification";
import CommentComponent from "@/components/Post/CommentComponent.vue";
import axios from "axios";

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
  },
  mounted() {
    // Check if the post is liked
    this.isLiked = this.thisPost.isLiked;
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
</style>