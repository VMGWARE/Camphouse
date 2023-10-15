<template>
  <VueFinalModal
    class="d-flex justify-content-center align-items-center modal-container"
    style="z-index: 1060"
  >
    <div class="modal-content bg-dark larger-modal">
      <div class="modal-header">
        <h5 class="modal-title text-white">Edit User</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="emit('cancel')"
        ></button>
      </div>
      <div class="modal-body">
        <!-- username -->
        <div class="mb-3">
          <label for="username" class="form-label text-white">Username</label>
          <input
            type="text"
            class="form-control"
            name="username"
            v-model="user.username"
          />
        </div>

        <!-- handle -->
        <div class="mb-3">
          <label for="handle" class="form-label text-white">Handle</label>
          <input
            type="text"
            class="form-control"
            name="handle"
            v-model="user.handle"
          />
        </div>

        <!-- email -->
        <div class="mb-3">
          <label for="email" class="form-label text-white">Email</label>
          <input
            type="email"
            class="form-control"
            name="email"
            v-model="user.email"
          />
        </div>

        <!-- bio -->
        <div class="mb-3">
          <label for="bio" class="form-label text-white">Bio</label>
          <textarea
            class="form-control"
            name="bio"
            v-model="user.bio"
          ></textarea>
        </div>

        <!-- verified -->
        <div class="mb-3">
          <input
            type="checkbox"
            class="form-check-input"
            name="verified"
            v-model="user.verified"
          />
          <label for="verified" class="form-check-label text-white">
            Is Verified
          </label>
        </div>

        <!-- admin -->
        <div class="mb-3">
          <input
            type="checkbox"
            class="form-check-input"
            name="verified"
            v-model="user.admin"
          />
          <label for="verified" class="form-check-label text-white">
            Is Admin
          </label>
        </div>
        <!-- Add more form fields for editing user data -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="emit('cancel')">
          Cancel
        </button>
        <button
          class="btn btn-success"
          style="border-radius: 30px"
          @click="updateUser(user)"
        >
          Save Changes
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<style scoped>
.larger-modal {
  width: 800px;
  max-width: 90%;
  max-height: 90vh; /* Maximum height relative to the viewport */
  overflow-y: auto; /* Makes content scrollable when it overflows the box */
  z-index: 1060 !important;
  padding: 20px; /* Adds some padding to the content for better appearance */
}
</style>

<script setup>
import { VueFinalModal } from "vue-final-modal";
import { defineProps, defineEmits, ref } from "vue";
import axios from "axios";

const props = defineProps(["user"]);
const emit = defineEmits(["update", "cancel"]);
var user = Object.assign({}, props.user);
var processing = ref(false);

// TODO: Move submit logic to this component and emit the event
const updateUser = async (user) => {
  processing.value = true;
  try {
    // Set Auth Header
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;

    // Update the user
    await axios.put(`/v1/admin/users/${user._id}`, user).then((res) => {
      if (res.data.code === 200) {
        // Emit the event
        emit("update", res.data.data);
      } else {
        console.log("Error updating user");
        // TODO: Handle and show errors for validation
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    processing.value = false;
  }
};
</script>
