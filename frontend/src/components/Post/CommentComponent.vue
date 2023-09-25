<template>
  <div class="card mb-2 comment">
    <div class="card-body">
      <div class="d-flex align-items-center">
        <router-link :to="'/@' + comment.user.handle">
          <img
            :src="comment.user.profilePicture"
            alt="Profile Picture"
            class="comment-profile-picture"
          />
        </router-link>
        <div>
          <p class="card-text mb-0">{{ comment.comment }}</p>
          <small class="text-muted">
            Posted by {{ comment.user.username }}
            on
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentComponent",
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
};
</script>
