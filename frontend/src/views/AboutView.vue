<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <h2>About Camphouse</h2>
        <section>
          <h3>What is Camphouse?</h3>
          <p>
            Camphouse is a simple, open-source, and self-hosted social media
            platform. It allows users to post content, interact with others, and
            build communities. Designed to be easy to use and deploy, Camphouse
            is built with Node.js, MongoDB, and Vue.js. It was originally called
            Aqurilla but was renamed in 2023 to Camphouse.
          </p>
        </section>

        <!-- Include other sections like 'Getting Started', 'Installation', 'License', etc. -->

        <section>
          <h3>Getting Started</h3>
          <p>
            These instructions will get you a copy of the project up and running
            on your local machine for development and testing purposes. See
            deployment for notes on how to deploy the project on a live system.
          </p>
          <!-- Add prerequisites and installation steps -->
        </section>

        <section>
          <h3>Roadmap</h3>
          <p>
            See the
            <a
              href="https://github.com/VMGWARE/Camphouse/issues"
              target="_blank"
              >open issues</a
            >
            for a list of proposed features (and known issues).
          </p>
        </section>

        <section>
          <h3>License</h3>
          <p>
            Distributed under the CC BY-NC-SA 4.0 License. See LICENSE for more
            information.
          </p>
        </section>

        <section>
          <h3>Contributions</h3>
          <p>
            Contributions are what make the open-source community such an
            amazing place to learn, inspire, and create. Any contributions you
            make are greatly appreciated.
          </p>
        </section>

        <section>
          <h3>Contact</h3>
          <p>
            For any questions or suggestions, please feel free to contact the
            author at developers@vmgware.dev.
          </p>
        </section>

        <section class="badges my-3">
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
          >
            <img
              src="https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey.svg"
              alt="License: CC BY-NC-SA 4.0"
            />
          </a>
          <a href="https://ci.vmgware.dev/repos/134" target="_blank">
            <img
              src="https://ci.vmgware.dev/api/badges/134/status.svg"
              alt="Build Status"
            />
          </a>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 960px; /* Set a max-width for larger screens */
  margin-top: 2rem; /* Spacing from the top */
}

h2 {
  color: #333; /* Dark color for contrast */
  font-weight: 600; /* Semi-bold for the main heading */
  margin-bottom: 1rem; /* Spacing after the heading */
  border-bottom: 2px solid #eee; /* Subtle bottom border */
  padding-bottom: 0.5rem; /* Space above the border */
}

h3 {
  color: #555; /* Slightly lighter color for subheadings */
  font-weight: 500; /* Medium font weight for subheadings */
  margin-top: 1.5rem; /* Spacing above subheadings */
  margin-bottom: 0.75rem; /* Spacing below subheadings */
}

p {
  color: #666; /* Mild color for paragraph text */
  line-height: 1.6; /* Line height for readability */
  margin-bottom: 1rem; /* Spacing after each paragraph */
}

a {
  color: #007bff; /* Bootstrap primary link color */
  text-decoration: none; /* No underline for links */
}

a:hover {
  text-decoration: underline; /* Underline on hover for better UX */
}

.badges img {
  margin: 0.5rem; /* Spacing around badges */
}

.section {
  padding: 1rem 0; /* Spacing inside each section */
}

/* Add a subtle shadow to the container for depth */
.container {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #fff; /* White background for the content */
  padding: 2rem; /* Padding inside the container */
  border-radius: 8px; /* Rounded corners for the container */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 1rem; /* Less padding on smaller screens */
  }

  h2 {
    font-size: 1.5rem; /* Smaller heading font size on small screens */
  }
}
</style>
