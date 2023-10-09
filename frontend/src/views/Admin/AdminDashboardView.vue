<template>
  <!-- Navigation bar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="#">Admin Dashboard</a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item active">
          <a class="nav-link" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#reportingPanel">Reporting Panel</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#adminPanel">Admin Panel</a>
        </li>
      </ul>
    </div>
  </nav>

  <!-- Reporting Panel -->
  <section id="reportingPanel" class="container mt-5">
    <h2>Reporting Panel</h2>
    <!-- Some table or list representation of reports -->
  </section>

  <!-- Admin Panel -->
  <section id="adminPanel" class="container mt-5">
    <h2>Admin Panel</h2>

    <!-- Users CRUD -->
    <div class="card mb-3">
      <div class="card-header">Users</div>
      <div class="card-body">
        <!-- List or table of users -->
      </div>
    </div>

    <!-- Posts RD -->
    <div class="card mb-3">
      <div class="card-header">Posts</div>
      <div class="card-body">
        <!-- List or table of posts -->
      </div>
    </div>

    <!-- Comments RD -->
    <div class="card mb-3">
      <div class="card-header">Comments</div>
      <div class="card-body">
        <!-- List or table of comments -->
      </div>
    </div>

    <!-- Messages RD -->
    <div class="card">
      <div class="card-header">Messages</div>
      <div class="card-body">
        <!-- List or table of messages -->
      </div>
    </div>
  </section>
</template>

<style scoped>
body {
  background-color: #343a40; /* Bootstrap dark background color */
  color: #fff;
}

.navbar-dark .navbar-brand {
  color: #ffc107; /* Bootstrap yellow color for contrast */
}

.card-header {
  background-color: #212529; /* Slightly darker than body background */
  border-bottom: 1px solid #495057; /* Gives a slight border to separate */
}

.card {
  background-color: #212529; /* Slightly darker than body background */
  border: none;
}

.card-body {
  border-top: 1px solid #495057; /* Gives a slight border to separate from header */
}
</style>
