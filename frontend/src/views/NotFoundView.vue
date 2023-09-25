<template>
  <div class="container">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Page Not Found</h2>
        <p>
          The page you are looking for does not exist. Please check the URL and
          try again.
        </p>
        <div class="d-grid gap-2 d-md-flex justify-content-md-center">
          <button class="btn btn-primary" @click="goBack">
            <i class="fa fa-arrow-left"></i> Go back to the previous page.
          </button>
          <router-link class="btn btn-primary" to="/">
            <i class="fa fa-home"></i> Go back to home page.
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  async mounted() {},
  methods: {
    /** Go back 1 in browser history */
    goBack() {
      history.back();
    },
  },
};
</script>
