<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Login</h2>
            <form @submit.prevent="handleLogin" method="POST">
              <div v-if="!twofaEnabled">
                <div class="form-group mb-3">
                  <label for="email">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    v-model="email"
                    :class="{
                      'is-invalid': errors.email || errors.invalidEmail,
                    }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.email || errors.invalidEmail }}
                  </div>
                </div>
                <div class="form-group mb-3">
                  <label for="password">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    v-model="password"
                    :class="{ 'is-invalid': errors.password }"
                  />
                  <div class="invalid-feedback">{{ errors.password }}</div>
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
                  v-html="redirectMessage"
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
                    v-model="twofaToken"
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
                  v-html="redirectMessage"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      errors: {
        email: "",
        password: "",
        invalidEmail: "", // Add a new error field for invalid email format
        login: "", // Add a new error field for login errors
      },
      processing: false,
      twofaEnabled: false,
      twofaToken: "",
    };
  },
  computed: {
    redirectMessage() {
      let urlParams = new URLSearchParams(window.location.search);
      let redirect = urlParams.get("redirect");
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
    },
  },

  methods: {
    handleLogin() {
      // Set processing to true
      this.processing = true;

      // Clear the errors
      this.errors = {};

      // Check if the email is empty
      if (this.email === "") {
        this.errors.email = "Please enter your email.";
      } else {
        // Check if the email format is valid
        const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailPattern.test(this.email)) {
          this.errors.invalidEmail = "Invalid email format.";
        }
      }

      // Check if the password is empty
      if (this.password === "") {
        this.errors.password = "Please enter your password.";
      }

      // If there are no errors, submit the form
      if (
        !this.errors.email &&
        !this.errors.password &&
        !this.errors.invalidEmail
      ) {
        this.$store
          .dispatch("login", {
            email: this.email,
            password: this.password,
            twoFactorCode: this.twofaToken,
          })
          .then((result) => {
            if (result.code === 200) {
              let urlParams = new URLSearchParams(window.location.search);
              let redirect = urlParams.get("redirect");
              if (redirect) {
                this.$router.push(redirect);
              } else {
                this.$router.push("/");
              }
            }
            if (
              result.response.data.message === "2FA code is required." &&
              result.response.data.code === 401
            ) {
              this.twofaEnabled = true;
            }
            if (
              result.response.data.message === "Invalid 2FA code provided." &&
              result.response.data.code === 401
            ) {
              this.errors.twofaToken = "Invalid 2FA code provided.";
            } else {
              this.errors.login = "Invalid credentials.";
            }
            // Set processing to false
            this.processing = false;
          });
      } else {
        // Set processing to false if there are validation errors
        this.processing = false;
      }
    },
  },
};
</script>
