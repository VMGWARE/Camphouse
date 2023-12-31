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
                  <label for="twoFactorCode">2FA Code</label>
                  <input
                    type="text"
                    class="form-control"
                    id="twoFactorCode"
                    name="twoFactorCode"
                    placeholder="Enter your 2FA code"
                    required
                    v-model="user.twoFactorCode"
                    :class="{ 'is-invalid': errors.twoFactorCode }"
                  />
                  <div class="invalid-feedback">{{ errors.twoFactorCode }}</div>
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
  twoFactorCode: "",
});
const errors = ref({
  email: "",
  password: "",
  invalidEmail: "",
  login: "",
  twoFactorCode: "",
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

    const { data, error } = await useFetch(backendApi + "/v1/auth/login", {
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
      if (error.value.data.message === "Your email or password is incorrect!") {
        errors.value.login = "Your email or password is incorrect!";
      } else if (
        error.value.data.message === "Two-factor authentication is required!"
      ) {
        twoFactorAuthRequired.value = true;
      } else if (
        error.value.data.message === "Your two-factor token is incorrect!"
      ) {
        errors.value.twoFactorCode = "Your two-factor token is incorrect!";
      } else {
        errors.value.login = "An unknown error occurred!";
      }
    }

    // If data is not null, then the request was successful
    if (data.value) {
      // Set auth store information
      useAuthStore().token = data.value.data.token;
      useAuthStore().user = data.value.data.user;

      // Set token in cookie
      document.cookie = `token=${data.value.data.token}; path=/;SameSite=Strict;`;

      // If there is a redirect URL in the query string, then redirect to that URL
      if (useRoute().query.redirect) {
        await navigateTo(useRoute().query.redirect);
      } else {
        await navigateTo("/");
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    processing.value = false;
  }
};
</script>
