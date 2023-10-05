<template>
  <div class="card">
    <h5 class="card-title">Update Password</h5>
    <div class="card-body">
      <form @submit.prevent="saveNewPassword">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            type="password"
            class="form-control"
            id="currentPassword"
            placeholder="Enter your current password"
            v-model="this.currentPassword"
            required
            :class="{ 'is-invalid': errors.currentPassword }"
          />
          <div class="invalid-feedback" v-if="errors.currentPassword">
            {{ errors.currentPassword }}
          </div>
        </div>
        <br />
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            type="password"
            class="form-control"
            id="newPassword"
            placeholder="Enter your new password"
            v-model="this.newPassword"
            minlength="6"
            required
            :class="{ 'is-invalid': errors.newPassword }"
          />
          <div class="invalid-feedback" v-if="errors.newPassword">
            {{ errors.newPassword }}
          </div>
        </div>
        <br />
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            placeholder="Confirm your new password"
            v-model="this.confirmPassword"
            minlength="6"
            required
          />
        </div>
        <br />
        <button type="submit" class="btn btn-primary" :disabled="processing">
          <span v-if="processing">
            <i class="fas fa-spinner fa-spin"></i> Updating Password...</span
          >
          <span v-else>Update Password</span>
        </button>
        <br />
        <div class="alert alert-success mt-3" v-if="hasSaved">
          Your password has been updated successfully.
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      errors: {},
      processing: false,
      hasSaved: false,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  },
  methods: {
    async saveNewPassword() {
      this.processing = true; // Set processing to true to disable the submit button
      this.errors = {}; // Clear the errors object

      // Ensure new password and confirm password match
      if (this.newPassword !== this.confirmPassword) {
        this.errors.newPassword = "Passwords do not match";
        this.processing = false;
        return;
      }

      try {
        // Add the Authorization header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.$store.state.token}`;

        // Send a POST request to the API endpoint
        await axios.post("/v1/auth/update-password", {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmNewPassword: this.confirmPassword,
        });

        // If the request was successful, show a success message
        this.hasSaved = true;

        // Clear the form fields
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";

        // Clear the success message after 3 seconds
        setTimeout(() => {
          this.hasSaved = false;
        }, 3000);
      } catch (error) {
        console.error("Error saving new password", error);

        this.errors.currentPassword = "Error updating password";
      } finally {
        this.processing = false;
      }
    },
  },
};
</script>
