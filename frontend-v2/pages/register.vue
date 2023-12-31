<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Register</h2>
            <form @submit.prevent="register" method="POST">
              <!-- Handle -->
              <div class="form-group mb-3">
                <label for="handle">Handle</label>
                <input
                  type="text"
                  class="form-control"
                  id="handle"
                  name="handle"
                  placeholder="Enter your handle"
                  pattern="[A-Za-z0-9]+"
                  title="Only letters and numbers are allowed"
                  required
                  v-model="user.handle"
                  :class="{ 'is-invalid': errors.handle }"
                />
                <div class="invalid-feedback">{{ errors.handle }}</div>
              </div>

              <!-- Username -->
              <div class="form-group mb-3">
                <label for="username">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  required
                  v-model="user.username"
                  :class="{ 'is-invalid': errors.username }"
                />
                <div class="invalid-feedback">{{ errors.username }}</div>
              </div>

              <!-- Email -->
              <div class="form-group mb-3">
                <label for="email">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  v-model="user.email"
                  :class="{ 'is-invalid': errors.email || errors.invalidEmail }"
                />
                <div class="invalid-feedback">
                  {{ errors.email || errors.invalidEmail }}
                </div>
              </div>

              <!-- Password -->
              <div class="form-group mb-3">
                <label for="password">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  v-model="user.password"
                  :class="{ 'is-invalid': errors.password }"
                />
                <div class="invalid-feedback">{{ errors.password }}</div>
              </div>
              <br />

              <!-- Submit button -->
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="processing"
              >
                <span v-if="processing">
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Signing up...
                </span>
                <span v-else>Register</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// import { useAuthStore } from "~/stores/useAuthStore";

useSeoMeta({
  title: "Register",
});

definePageMeta({
  middleware: ["guest"],
});

// Variables
const user = ref({
  email: "",
  password: "",
  username: "",
  handle: "",
});
const errors = ref({
  email: "",
  password: "",
  username: "",
  handle: "",
  invalidEmail: "",
});
const processing = ref(false);

// Login function
const register = async () => {
  // Set processing to true
  processing.value = true;

  // Clear the errors
  errors.value = {};

  // TODO: Register the user
};
</script>
