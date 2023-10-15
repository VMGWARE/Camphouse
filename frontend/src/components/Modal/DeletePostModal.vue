<template>
  <VueFinalModal
    class="d-flex justify-content-center align-items-center modal-container"
    style="z-index: 1060"
  >
    <div class="modal-content bg-dark">
      <div class="modal-header">
        <h5 class="modal-title">Delete Post</h5>
        <button
          type="button"
          class="btn-close"
          @click="emit('cancel')"
        ></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this post?</p>
        <p>
          <strong>{{ props.post.title }}</strong>
        </p>
        <div class="invalid-feedback" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="emit('cancel')">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn btn-danger" @click="deletePost(props.post._id)">
          <i class="fas fa-trash"></i> Delete
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

const props = defineProps(["post"]);
const emit = defineEmits(["delete", "cancel"]);
var processing = ref(false);
var errorMessage = ref("");

const deletePost = async (id) => {
  processing.value = true;
  try {
    // Set Auth Header
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;

    await axios
      .delete(`/v1/admin/posts/${id}`)
      .then(() => {
        emit("delete", id);
      })
      .catch((err) => {
        errorMessage.value = err.response.data.message;
      });
  } catch (error) {
    processing.value = false;
    errorMessage.value = error.message;
  } finally {
    processing.value = false;
  }
};
</script>
