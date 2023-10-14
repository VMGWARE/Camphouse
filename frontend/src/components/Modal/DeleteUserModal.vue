<template>
  <VueFinalModal
    class="d-flex justify-content-center align-items-center modal-container"
  >
    <div class="modal-content bg-dark">
      <div class="modal-header">
        <h5 class="modal-title">Delete User</h5>
        <button
          type="button"
          class="btn-close"
          @click="emit('cancel')"
        ></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this user?</p>
        <p>
          <strong>{{ props.user.username }}</strong>
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="emit('cancel')">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn btn-danger" @click="emit('delete', props.user._id)">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<style scoped>
.larger-modal {
  width: 800px; /* Or any specific width you want */
  max-width: 90%; /* To make sure it doesn't overflow on smaller screens */
}
</style>

<script setup>
import { VueFinalModal } from "vue-final-modal";
import { defineProps, defineEmits } from "vue";

const props = defineProps(["user"]);

const emit = defineEmits(["delete", "cancel"]);
</script>
