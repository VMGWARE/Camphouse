<template>
  <div class="container">
    <h2>Settings</h2>

    <!-- Profile Picture Card -->
    <div class="card">
      <h5 class="card-title">Profile Picture</h5>
      <div class="card-body">
        <!-- Display current profile picture -->
        <div v-if="currentUser && currentUser.profilePicture">
          <img
            :src="currentUser.profilePicture"
            alt="Profile Picture"
            class="img-thumbnail"
            width="80"
            height="80"
          />
        </div>

        <!-- Form to upload new profile picture -->
        <form @submit.prevent="uploadProfilePicture">
          <div class="form-group mt-3">
            <label for="profilePicture">Upload Profile Picture</label>
            <br />
            <input
              type="file"
              class="form-control-file"
              id="profilePicture"
              @change="onFileChange"
              accept="image/*"
            />
            <div class="invalid-feedback" v-if="errors.profilePicture">
              {{ errors.profilePicture }}
            </div>
          </div>
          <br />
          <button type="submit" class="btn btn-primary" :disabled="processing">
            <span v-if="processing">
              <i class="fas fa-spinner fa-spin"></i> Uploading...
            </span>
            <span v-else>Upload</span>
          </button>
        </form>
      </div>
    </div>

    <!-- General Settings Form -->
    <div class="card">
      <h5 class="card-title">General</h5>
      <div class="card-body">
        <form @submit.prevent="saveGeneralSettings">
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

    <!-- Update Password Section -->
    <UpdatePasswordSection />

    <!-- Two-Factor Authentication (2FA) Section -->
    <div class="card">
      <h5 class="card-title">Two-Factor Authentication</h5>
      <div class="card-body">
        <div v-if="!currentUser.twoFactorAuth.enabled">
          <button type="button" class="btn btn-primary mb-3" @click="setup2FA">
            Enable 2FA
          </button>

          <!-- QR Code Display and Input Token -->
          <div v-if="qrCode">
            <!-- QR Code Container -->
            <div v-if="qrCode" class="qr-code-container">
              <img :src="qrCode" alt="2FA QR Code" />
            </div>
            <div class="form-group">
              <label for="token">Enter Token from App</label>
              <input
                type="text"
                class="form-control"
                v-model="twoFactorToken"
                id="token"
                placeholder="Enter your token"
                :class="{ 'is-invalid': errors.twofa }"
              />
              <div class="invalid-feedback" v-if="errors.twofa">
                {{ errors.twofa }}
              </div>
              <button
                type="button"
                class="btn btn-primary mt-2"
                @click="enable2FA"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="currentUser.twoFactorAuth.enabled">
          <div class="form-group">
            <label for="disableToken">Enter Token to Disable</label>
            <input
              type="text"
              class="form-control"
              v-model="disableTwoFactorToken"
              id="disableToken"
              placeholder="Enter your token"
              :class="{ 'is-invalid': errors.twofa }"
            />
            <div class="invalid-feedback" v-if="errors.twofa">
              {{ errors.twofa }}
            </div>
          </div>
          <button type="button" class="btn btn-danger mt-3" @click="disable2FA">
            Disable 2FA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invalid-feedback {
  color: #dc3545;
}

.qr-code-container {
  display: flex;
  justify-content: center; /* Horizontal centering */
  align-items: center; /* Vertical centering */
  height: 200px; /* Or whatever height you prefer */
}

.img-thumbnail {
  border-radius: 50%;
  padding: 0;
  border: 0;
  background-color: #222222;
  width: 80px;
  height: 80px;
}
</style>

<script>
import axios from "axios";
import UpdatePasswordSection from "@/components/Settings/UpdatePasswordSection.vue";

export default {
  data() {
    return {
      currentUser: {
        handle: "",
        username: "",
        email: "",
        bio: "",
        selectedFile: null,
        twoFactorAuth: { enabled: false },
      },
      updatePassword: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      errors: {},
      privacySetting: "public",
      emailNotifications: false,
      processing: false,
      hasSaved: false,
      qrCode: null, // This will hold the QR code data URL
      twoFactorToken: "", // This will hold the token the user inputs
      disableTwoFactorToken: "", // This will hold the token for disabling 2FA
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
    onFileChange(e) {
      this.selectedFile = e.target.files[0]; // Assign selected file to the data property
    },
    async uploadProfilePicture() {
      if (!this.selectedFile) return; // Exit if no file is selected

      this.processing = true;
      this.errors = {};

      let formData = new FormData();
      formData.append("profilePicture", this.selectedFile);

      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        const response = await axios.put(
          "/v1/auth/upload-profile-picture",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("Profile Picture updated:", response.data);
        this.processing = false;

        // Optionally, refresh user info to update the displayed profile picture
        this.fetchUserInfo();
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        this.errors.profilePicture = "Failed to upload the profile picture"; // Or assign the error message from the server
        this.processing = false;
      }
    },
    // Fetch QR Code for 2FA setup
    async setup2FA() {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        const response = await axios.post("/v1/2fa/setup");
        this.qrCode = response.data.data.qr_code;
      } catch (error) {
        console.error("Error setting up 2FA:", error);
        // Handle the error, e.g., show an error message to the user
      }
    },
    // Confirm and enable 2FA with provided token
    async enable2FA() {
      if (!this.twoFactorToken) return;

      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        const response = await axios.post("/v1/2fa/enable", {
          token: this.twoFactorToken,
        });

        console.log("2FA enabled:", response.data);
        this.qrCode = null;
        this.twoFactorToken = "";
        this.fetchUserInfo(); // Update user's 2FA status
      } catch (error) {
        console.error("Error enabling 2FA:", error);
        this.errors.twofa = "Failed to enable 2FA"; // Or assign the error message from the server
        // Handle the error, e.g., show an error message to the user
      }
    },
    // Disable 2FA with provided token
    async disable2FA() {
      if (!this.disableTwoFactorToken) return;

      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        const response = await axios.delete("/v1/2fa/disable", {
          data: {
            token: this.disableTwoFactorToken,
          },
        });

        console.log("2FA disabled:", response.data);
        this.disableTwoFactorToken = "";
        this.fetchUserInfo(); // Update user's 2FA status
      } catch (error) {
        console.error("Error disabling 2FA:", error);
        this.errors.twofa = "Failed to disable 2FA"; // Or assign the error message from the server
        // Handle the error, e.g., show an error message to the user
      }
    },
  },
  components: {
    UpdatePasswordSection,
  },
};
</script>
