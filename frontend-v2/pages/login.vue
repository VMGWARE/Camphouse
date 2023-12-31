<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Login</h2>
            <form @submit.prevent="login" method="POST">
              <div v-if="!twoFactorAuthRequired">
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
                    :class="{
                      'is-invalid': errors.email || errors.invalidEmail,
                    }"
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

                <!-- Show login error -->
                <div class="alert alert-danger" v-if="errors.login">
                  {{ errors.login }}
                </div>

                <!-- Submit button -->
                <div class="form-group mb-3">
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
                      Logging in...
                    </span>
                    <span v-else>Login</span>
                  </button>
                </div>
                <div
                  v-if="redirectMessage()"
                  class="mt-2 text-muted"
                  v-dompurify-html="redirectMessage()"
                />
              </div>
              <div v-else>
                <div class="form-group mb-3">
                  <label for="twofaToken">2FA Code</label>
                  <input
                    type="text"
                    class="form-control"
                    id="twofaToken"
                    name="twofaToken"
                    placeholder="Enter your 2FA code"
                    required
                    v-model="user.twofaToken"
                    :class="{ 'is-invalid': errors.twofaToken }"
                  />
                  <div class="invalid-feedback">{{ errors.twofaToken }}</div>
                </div>
                <div class="form-group mb-3">
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
                      Logging in...
                    </span>
                    <span v-else>Login</span>
                  </button>
                </div>
                <div
                  v-if="redirectMessage"
                  class="mt-2 text-muted"
                  v-dompurify-html="redirectMessage()"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";

useSeoMeta({
  title: "Login",
});

definePageMeta({
  middleware: ["guest"],
});

// Variables
const user = ref({
  email: "",
  password: "",
  twofaToken: "",
});
const errors = ref({
  email: "",
  password: "",
  invalidEmail: "",
  login: "",
  twofaToken: "",
});
const processing = ref(false);
const twoFactorAuthRequired = ref(false);

// Redirect message
const redirectMessage = () => {
  const urlParams = useRoute().query;
  let redirect = urlParams.redirect;
  // Remove harmful characters from the redirect URL
  redirect = redirect ? redirect.replace(/<|>/g, "") : null;
  // Encode the URL to safely display it to the user
  const sanitizedRedirect = redirect ? encodeURIComponent(redirect) : null;
  let readableRedirect = sanitizedRedirect;
  // Replace the encoded / with a slash
  readableRedirect = readableRedirect
    ? readableRedirect.replace(/%2F/g, "/")
    : null;
  return sanitizedRedirect
    ? `You will be redirected to <a href="${sanitizedRedirect}">${readableRedirect}</a> upon successful login.`
    : "";
};

// Login function
const login = async () => {
  processing.value = true;

  try {
    const runtimeConfig = useRuntimeConfig();
    const backendApi = runtimeConfig.public.backendApi;
    const baseUrl = runtimeConfig.publicsiteUrl;

    const { data, error } = await useFetch(backendApi + "/auth/login", {
      method: "POST",
      body: JSON.stringify(user.value),
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        referer: baseUrl,
      },
    });

    // If the error is not null, then there is an error
    if (error.value) {
      if (error.value.data.data) {
        errors.value = error.value.data.data;
      } else {
        errors.value.login = error.value.data.message;
      }
    }

    // If data is not null, then the request was successful
    if (data.value) {
      // If the user has 2FA enabled, then redirect to the 2FA page
      if (data.value.data.twoFactorAuthEnabled) {
        twoFactorAuthRequired.value = true;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    processing.value = false;
  }
};
</script>
