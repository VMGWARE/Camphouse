<script>
useSeoMeta({
  title: "404 Not Found - Camphouse",
  description:
    "Oops! The page you are looking for does not exist. Please check the URL and try again.",
});
</script>

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
          <router-link class="btn btn-primary" to="/">
            <i class="fa fa-home"></i> Go back to home page.
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
