<template>
  <div class="container">
    <h2>Settings</h2>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">General</h5>
        <form @submit.prevent="saveGeneralSettings">
          <div class="form-group">
            <label for="profilePicture">Profile Picture</label>
            <input
              type="text"
              class="form-control dark-card"
              id="profilePicture"
              v-model="this.currentUser.profilePicture"
              placeholder="Profile picture URL"
              :class="{ 'is-invalid': errors.profilePicture }"
            />
            <div class="invalid-feedback" v-if="errors.profilePicture">
              {{ errors.profilePicture }}
            </div>
          </div>
          <br />
          <div class="form-group">
            <label for="handle">Handle</label>
            <input
              type="text"
              class="form-control dark-card"
              id="handle"
              v-model="this.currentUser.handle"
              placeholder="Enter your handle"
              pattern="[A-Za-z0-9]+"
              title="Only letters and numbers are allowed"
              :class="{ 'is-invalid': errors.handle }"
              maxlength="32"
            />
            <div class="invalid-feedback" v-if="errors.handle">
              {{ errors.handle }}
            </div>
          </div>
          <br />
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              class="form-control dark-card"
              id="username"
              v-model="this.currentUser.username"
              placeholder="Enter your username"
              :class="{ 'is-invalid': errors.username }"
              maxlength="32"
            />
            <div class="invalid-feedback" v-if="errors.username">
              {{ errors.username }}
            </div>
          </div>
          <br />
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              class="form-control dark-card"
              id="email"
              v-model="this.currentUser.email"
              placeholder="Enter your email"
              :class="{ 'is-invalid': errors.email }"
            />
            <div class="invalid-feedback" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>
          <br />
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              class="form-control dark-card"
              id="bio"
              v-model="this.currentUser.bio"
              rows="3"
              placeholder="Enter your bio"
              :class="{ 'is-invalid': errors.bio }"
              maxlength="255"
            ></textarea>
            <div class="invalid-feedback" v-if="errors.bio">
              {{ errors.bio }}
            </div>
          </div>
          <br />
          <button type="submit" class="btn btn-primary" :disabled="processing">
            <span v-if="processing">
              <i class="fas fa-spinner fa-spin"></i> Saving...</span
            >
            <span v-else>Save Changes</span>
          </button>
          <button
            type="button"
            class="btn btn-primary mx-2"
            @click="fetchUserInfo"
          >
            Reset
          </button>
          <br />
          <div class="alert alert-success mt-3" v-if="hasSaved">
            Your changes have been saved.
          </div>
        </form>
      </div>
    </div>

    <!-- Privacy Settings Form -->
    <!-- Implement Privacy Settings Form Similarly -->
  </div>
</template>

<style scoped>
.invalid-feedback {
  color: #dc3545;
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      currentUser: {
        profilePicture: "",
        handle: "",
        username: "",
        email: "",
        bio: "",
      },
      errors: {},
      privacySetting: "public",
      emailNotifications: false,
      processing: false,
      hasSaved: false,
    };
  },
  created() {
    // Fetch the user's current information and populate the currentUser object
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`; // Add the Authorization header
        // Replace 'USERNAME_OR_ID' with the actual username or ID
        const response = await axios.get(`/v1/auth/profile`);
        this.currentUser = response.data.data; // Populate currentUser with user data
      } catch (error) {
        console.error("Error fetching user information:", error);
        // Handle the error, e.g., show an error message to the user
      }
    },
    async saveGeneralSettings() {
      this.processing = true; // Set processing to true to disable the submit button
      this.errors = {}; // Clear the errors object
      try {
        // Add the Authorization header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        // Send a PUT request to update user's general settings
        const response = await axios.put("/v1/auth/update-profile", {
          profilePicture: this.currentUser.profilePicture,
          handle: this.currentUser.handle,
          username: this.currentUser.username,
          email: this.currentUser.email,
          bio: this.currentUser.bio,
        });

        // Handle the response, e.g., show a success message to the user
        console.log("General settings updated:", response.data.data);
        this.processing = false; // Set processing to false to enable the submit button
        this.hasSaved = true; // Set hasSaved to true to show a success message

        // Clear the success message after 3 seconds
        setTimeout(() => {
          this.hasSaved = false;
        }, 3000);
      } catch (error) {
        console.error("Error saving general settings:", error);
        this.errors = error.response.data.data.errors;
        this.processing = false; // Set processing to false to enable the submit button
        // Handle the error, e.g., show an error message to the user
      }
    },
    async savePrivacySettings() {
      try {
        // Send a PUT request to update user's privacy settings
        const response = await axios.put("/v1/auth/update-profile", {
          privacySetting: this.privacySetting,
          emailNotifications: this.emailNotifications,
        });
        // Handle the response, e.g., show a success message to the user
        console.log("Privacy settings updated:", response);
      } catch (error) {
        console.error("Error saving privacy settings:", error);
        // Handle the error, e.g., show an error message to the user
      }
    },
  },
};
</script>
