<script setup>
import { VueFinalModal } from "vue-final-modal";
import { defineProps, defineEmits, ref } from "vue";
import axios from "axios";

const props = defineProps(["info", "id", "type"]);

const emit = defineEmits(["cancel", "submit", "error"]);
const reportReason = ref("");

const submitReport = async () => {
  try {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;
    await axios.post("/v1/reports", {
      type: props.type,
      contentId: props.id,
      reason: reportReason.value,
    });
    emit("submit", {
      id: props.id,
      info: props.info,
      reportReason: reportReason.value,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    // Optionally, you can emit an event here to inform the parent component of the error.
    emit("error", error);
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
      <h3 class="text-center">Report {{ props.type }}</h3>
      <p class="text-center">
        <strong>{{ props.info }}</strong>
      </p>
      <label for="reportReason" class="form-label text-light"
        >Report Reason:</label
      >
      <textarea
        id="reportReason"
        v-model="reportReason"
        class="form-control mb-2 bg-secondary text-light"
        placeholder="Type the reason for reporting..."
      ></textarea>
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
