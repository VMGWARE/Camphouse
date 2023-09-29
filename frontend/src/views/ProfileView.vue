<template>
  <div class="container">
    <!-- User Profile -->
    <div class="profile-section">
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <img
              :src="profile.profilePicture"
              alt="Profile Picture"
              class="post-profile-picture"
              v-if="profile.profilePicture"
            />
            <div>
              <h5 class="card-title mb-0">
                <span v-if="profile.username">{{ profile.username }}</span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i>
                  Loading...
                </span>
              </h5>
              <p class="card-subtitle text-muted mb-0">
                <span v-if="profile.handle">@{{ profile.handle }}</span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i>
                </span>
              </p>
            </div>

            <img
              src="@/assets/images/verified/CheckMark.png"
              alt="Verified Profile"
              class="checkmark"
              v-if="profile.verified"
            />
          </div>
          <h6 class="card-subtitle text-muted mb-2">Followers</h6>
          <p class="card-text bio">
            <span v-if="profile.followers !== undefined">{{
              profile.followers
            }}</span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i>
            </span>
          </p>
          <hr />
          <h6 class="card-subtitle text-muted mb-2">Bio</h6>
          <p
            class="card-text bio"
            v-if="profile.bio"
            v-html="profile.bio.replace(/(?:\r\n|\r|\n)/g, '<br />')"
          ></p>
          <p class="card-text bio" v-else>This user has not set a bio yet.</p>
          <hr />

          <!-- Add logic for follow button, needs to not allow following self, and also know if following. -->
          <div v-if="profile.handle !== $store.state.user.handle">
            <button
              class="btn btn-primary"
              v-if="!isFollowing && !processingFollow"
              @click="followUser"
            >
              Follow
            </button>
            <button
              class="btn btn-primary"
              v-if="isFollowing && !processingFollow"
              @click="unfollowUser"
            >
              Unfollow
            </button>
            <button class="btn btn-primary" v-if="processingFollow" disabled>
              <i class="fas fa-spinner fa-spin"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Posts -->
    <ScrollablePostFeed :userid="profile._id" v-if="profile._id" />
  </div>
</template>

<script>
// We need to use the api to get information about the user
import axios from "axios";
import ScrollablePostFeed from "@/components/ScrollablePostFeed.vue";

export default {
  components: {
    ScrollablePostFeed,
  },
  data() {
    return {
      profile: {},
      isFollowing: false,
      follows: [],
      processingFollow: false,
    };
  },
  methods: {
    async getFollowers() {
      var resp;
      // Get the user's followers
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      const response = await axios.get("/v1/follows");
      resp = response.data;
      if (resp.code != 200) {
        this.$router.push("/login");
      }

      this.follows = resp.data.follows;
    },
    async getUser(handle) {
      var resp;
      // Get the user's followers
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      const response = await axios.get("/v1/users/" + handle);
      resp = response.data;
      if (resp.code != 200) {
        throw new Error("User not found.");
      }
      this.profile = resp.data;
      document.title = `${this.profile.username} (@${this.profile.handle}) - Camphouse`;

      // Get the user's followers
      this.getFollowers().then(() => {
        console.log("Followers loaded.");

        // Check if the current user is following this user
        if (this.follows[this.follows.indexOf(this.profile._id)]) {
          this.isFollowing = true;
        } else {
          this.isFollowing = false;
        }
      });
    },
    async followUser() {
      try {
        this.processingFollow = true;
        // Assume you have an API endpoint to follow a user
        await axios.post(`/v1/follows/${this.profile._id}`);
        this.isFollowing = true;
        this.profile.followers++;
        this.follows.push(this.profile._id);
      } catch (error) {
        console.error("Error following user:", error);
      }
      this.processingFollow = false;
    },
    async unfollowUser() {
      try {
        this.processingFollow = true;
        // Assume you have an API endpoint to unfollow a user
        await axios.delete(`/v1/follows/${this.profile._id}`);
        this.isFollowing = false;
        this.profile.followers--;
        this.follows.splice(this.follows.indexOf(this.profile._id), 1);
      } catch (error) {
        console.error("Error unfollowing user:", error);
      }
      this.processingFollow = false;
    },
  },
  mounted() {
    console.log("Loading profile for @" + this.$route.params.handle);

    // If the current user is the same as the user in the route, to avoid empty profile
    if (this.$store.state.user.handle === this.$route.params.handle) {
      this.profile = this.$store.state.user;
    }

    // Load the user's profile
    this.getUser(this.$route.params.handle)
      .then(() => {
        console.log("Profile loaded.");
      })
      .catch(() => {
        this.$router.push({
          name: "not-found",
        });
      });
  },
  // When the route changes, load the new user's profile
  watch: {
    $route(to) {
      console.log("Loading profile for @" + to.params.handle);

      // If the current user is the same as the user in the route, to avoid empty profile
      if (this.$store.state.user.handle === to.params.handle) {
        this.profile = this.$store.state.user;
      }

      // Load the user's profile
      this.getUser(to.params.handle)
        .then(() => {
          console.log("Profile loaded.");
        })
        .catch(() => {
          this.$router.push({
            name: "not-found",
          });
        });
    },
  },
};
</script>

<style scoped>
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
</style>
