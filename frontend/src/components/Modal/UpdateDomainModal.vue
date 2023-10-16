<template>
  <VueFinalModal
    class="d-flex justify-content-center align-items-center modal-container"
    style="z-index: 1060"
  >
    <div class="modal-content bg-dark larger-modal">
      <div class="modal-header">
        <h5 class="modal-title text-white">Edit domain: {{ domain.domain }}</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="emit('cancel')"
        ></button>
      </div>
      <div class="modal-body">
        <!-- isBlocked -->
        <div class="mb-3">
          <input
            type="checkbox"
            class="form-check-input"
            name="isBlocked"
            v-model="domain.isBlocked"
            :class="{ 'is-invalid': errorMessage }"
          />
          <label for="isBlocked" class="form-check-label text-white">
            Is Blocked
          </label>
          <div class="invalid-feedback" style="display: block">
            {{ errorMessage }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="emit('cancel')">
          Cancel
        </button>
        <button
          class="btn btn-success"
          style="border-radius: 30px"
          @click="updateDomain(domain)"
        >
          <span v-if="processing">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span v-else>Update</span>
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

const props = defineProps(["domain"]);
const emit = defineEmits(["update", "cancel"]);
var domain = Object.assign({}, props.domain);
var processing = ref(false);
var errorMessage = ref("");

// TODO: Move submit logic to this component and emit the event
const updateDomain = async (domain) => {
  processing.value = true;
  try {
    // Set Auth Header
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;

    // Update the domain
    await axios
      .put(`/v1/blocked-email-domains/${domain._id}`, domain)
      .then((res) => {
        emit("update", res.data.data);
      })
      .catch((err) => {
        errorMessage.value = err.response.data.data.errorMessage;
      });
  } catch (error) {
    console.error("Error updating domain:", error);
  } finally {
    processing.value = false;
  }
};
</script>
