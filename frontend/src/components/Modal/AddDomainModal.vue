<template>
  <VueFinalModal
    class="d-flex justify-content-center align-items-center modal-container"
    style="z-index: 1060"
  >
    <div class="modal-content bg-dark larger-modal">
      <div class="modal-header">
        <h5 class="modal-title text-white">Add Blocked Domain</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="emit('cancel')"
        ></button>
      </div>
      <div class="modal-body">
        <!-- domain name -->
        <div class="mb-3">
          <label for="domain" class="form-label text-white">Domain</label>
          <input
            type="text"
            class="form-control"
            name="domain"
            v-model="domain.domain"
            :class="{ 'is-invalid': errormessage }"
          />
        </div>

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
        </div>

        <!-- Error Message -->
        <div v-if="errormessage" class="alert alert-danger" role="alert">
          {{ errormessage }}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="emit('cancel')">
          Cancel
        </button>
        <button
          class="btn btn-success"
          style="border-radius: 30px"
          @click="createDomain(domain)"
        >
          <span v-if="processing">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span v-else>Create</span>
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
const emit = defineEmits(["create", "cancel"]);
var domain = Object.assign({}, props.domain);
var processing = ref(false);
var errormessage = ref("");

// TODO: Move submit logic to this component and emit the event
const createDomain = async (domain) => {
  processing.value = true;
  try {
    // Set Auth Header
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;

    // Create the domain
    await axios
      .post(`/v1/blocked-email-domains`, domain)
      .then((res) => {
        emit("create", res.data.data);
      })
      .catch((err) => {
        errormessage.value = err.response.data.message;
      });
  } catch (error) {
    console.error("Error updating domain:", error);
  } finally {
    processing.value = false;
  }
};
</script>
