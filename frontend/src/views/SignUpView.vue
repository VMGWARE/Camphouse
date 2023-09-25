<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Sign Up</h2>
            <form @submit.prevent="handleSignup" method="POST">
              <div class="form-group">
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
                  v-model="handle"
                  :class="{ 'is-invalid': errors.handle }"
                />
                <div class="invalid-feedback">{{ errors.handle }}</div>
              </div>
              <div class="form-group">
                <label for="username">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  required
                  v-model="username"
                  :class="{ 'is-invalid': errors.username }"
                />
                <div class="invalid-feedback">{{ errors.username }}</div>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  v-model="email"
                  :class="{ 'is-invalid': errors.email || errors.invalidEmail }"
                />
                <div class="invalid-feedback">
                  {{ errors.email || errors.invalidEmail }}
                </div>
              </div>
              <div class="form-group">
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
              <br />
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
                <span v-else>Sign Up</span>
              </button>
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
      username: "",
      handle: "",
      errors: {
        email: "",
        password: "",
        username: "",
        handle: "",
        invalidEmail: "", // Add a new error field for invalid email format
      },
      processing: false,
    };
  },
  methods: {
    handleSignup() {
      // Set processing to true
      this.processing = true;

      // Clear the errors
      this.errors = {};

      // Validate the form
      if (this.email === "") {
        this.errors.email = "Please enter your email.";
      } else {
        // Check if the email format is valid
        const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailPattern.test(this.email)) {
          this.errors.invalidEmail = "Invalid email format.";
        }
      }
      if (this.password === "") {
        this.errors.password = "Please enter your password.";
      }
      if (this.username === "") {
        this.errors.username = "Please enter your username.";
      }
      if (this.handle === "") {
        this.errors.handle = "Please enter your handle.";
      }

      // If there are no errors, submit the form
      if (
        !this.errors.email &&
        !this.errors.password &&
        !this.errors.username &&
        !this.errors.handle &&
        !this.errors.invalidEmail
      ) {
        this.$store
          .dispatch("register", {
            email: this.email,
            password: this.password,
            username: this.username,
            handle: this.handle,
          })
          .then((result) => {
            if (result.code === 201) {
              this.$router.push("/login");
            } else {
              // TODO: Based on the data.errors, set the errors
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
