<script setup>
import { VueFinalModal } from "vue-final-modal";
import { defineProps, defineEmits, ref } from "vue";
import axios from "axios";

const props = defineProps(["info", "id", "type"]);

const emit = defineEmits(["cancel", "submit", "error"]);
const reportReason = ref("");
const reportError = ref("");
const reportSuccess = ref("");

const submitReport = async () => {
  try {
    // Clear error and success messages
    reportError.value = "";
    reportSuccess.value = "";

    // Submit report
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;
    await axios.post("/v1/reports", {
      type: props.type,
      contentId: props.id,
      reason: reportReason.value,
    });

    // Show success message
    reportSuccess.value = "Report submitted successfully!";

    // Wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Emit submit event
    emit("submit", {
      id: props.id,
      info: props.info,
      reportReason: reportReason.value,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    emit("error", error);
    reportError.value = error.response.data.message;
  }
};
</script>

<template>
  <VueFinalModal
    class="d-flex justify-content-center align-items-center modal-container"
  >
    <div
      class="d-flex flex-column mx-4 p-4 bg-dark text-light rounded larger-modal"
    >
      <!-- Title & Info -->
      <h3 class="text-center">Report {{ props.type }}</h3>
      <p class="text-center">
        <strong>{{ props.info }}</strong>
      </p>

      <!-- Report Reason Label -->
      <label for="reportReason" class="form-label text-light"
        >Report Reason:</label
      >

      <!-- Report Reason -->
      <textarea
        id="reportReason"
        v-model="reportReason"
        class="form-control mb-2 bg-secondary text-light"
        placeholder="Type the reason for reporting..."
      ></textarea>

      <!-- Error -->
      <p class="text-danger text-center">{{ reportError }}</p>
      <!-- Success -->
      <p class="text-success text-center">{{ reportSuccess }}</p>

      <!-- Options -->
      <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-primary me-2" @click="emit('cancel')">
          <i class="fas fa-times"></i>
        </button>
        <button class="btn btn-primary" @click="submitReport">
          <i class="fas fa-check"></i>
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
