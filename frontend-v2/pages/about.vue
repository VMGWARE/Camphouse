<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <h2>About Camphouse</h2>

        <!-- What is Camphouse? -->
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

        <!-- Why is Camphouse open-source? -->
        <section>
          <h3>Why is Camphouse open-source?</h3>
          <p>
            Camphouse was originally created as a proof-of-concept for former
            friend of one of the developers. It was originally called Aqurilla
            and was renamed in 2023 to Camphouse. The developers decided to
            open-source the project to allow others to use it and contribute to
            it. While keeping it under the CC BY-NC-SA 4.0 license. We can
            prevent others from using it for commercial purposes.
          </p>
        </section>

        <!-- License -->
        <section>
          <h3>License</h3>
          <p>
            Distributed under the CC BY-NC-SA 4.0 License. See
            <a href="https://github.com/VMGWARE/Camphouse/blob/main/LICENSE.md">
              LICENSE.md
            </a>
            for more information.
          </p>
        </section>

        <!-- Contributions -->
        <section>
          <h3>Contributions</h3>
          <p>
            Contributions are what make the open-source community such an
            amazing place to learn, inspire, and create. Any contributions you
            make are greatly appreciated.
          </p>
        </section>

        <!-- Contact -->
        <section>
          <h3>Contact</h3>
          <p>
            For any questions or suggestions, please feel free to contact the
            author at
            <a href="mailto:developers@vmgware.dev">developers@vmgware.dev</a>.
          </p>
        </section>

        <!-- Badges -->
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
  max-width: 960px;
  margin-top: 2rem;
  margin-bottom: 2rem;
  background-color: #1e1e1e; /* Dark background */
  color: #f0f0f0; /* Light text for readability */
  border-radius: 8px;
  padding: 2rem;
}

h2,
h3 {
  border-bottom: 1px solid #2c2c2c; /* Subtle border for headings */
  padding-bottom: 0.5rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

a {
  color: #76b900; /* Bright color for links */
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
  color: #98ce00; /* Lighter shade for hover state */
}

.badges img {
  margin: 0.5rem;
}

.section {
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}

/* Badges as far from each other as possible. On opposite sides */
.badges {
  display: flex;
  justify-content: space-between;
}
</style>
