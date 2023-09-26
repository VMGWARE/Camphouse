# Camphouse

[![License: CC BY-NC-SA 4.0][license-shield]][license-url]
[![status-badge](https://woodpecker.vahngomes.dev/api/badges/VMGWARE/Camphouse/status.svg)](https://woodpecker.vahngomes.dev/VMGWARE/Camphouse)

Post something amazing. ✨

## About The Project

Camphouse is a simple, open-source, and self-hosted social media platform. It is designed to be easy to use and easy to deploy. It is built with [Node.js](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/), and [Vue.js](https://vuejs.org/). It was originally called Aqurilla, but was renamed to Camphouse in 2023.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repo

   ```sh
   gh repo clone VMGWARE/Camphouse
   ```

2. cd into the project directory

   ```sh
   cd Camphouse
   ```

3. Make a copy of the `.env.example` file and rename it to `.env`

   ```sh
   cp .env.example .env
   ```

4. Install NPM packages

   ```sh
    cd frontend
    npm install
    cd ../backend
    npm install
   ```

5. Start the backend server

   ```sh
    cd backend
    npm run start
   ```

6. Start the frontend server

   ```sh
   cd frontend
   npm run serve
   ```

7. Open the app in your browser

   ```sh
    http://localhost:8080
   ```

### Docker

1. Pull the image

   ```sh
   docker pull insidiousfiddler/camphouse
   ```

2. Run the container with your database credentials

   ```sh
   docker run -d -p 8000:80 insidiousfiddler/camphouse -e DB_HOST=<host> -e DB_PORT=<port> -e DB_NAME=<database> -e DB_USER=<username> -e DB_PASS=<password> -e SESSION_SECRET=<secret> -e JWT_SECRET=<secret>
   ```

3. Visit the site at [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Roadmap

See the [open issues](https://github.com/VMGWARE/Camphouse/issues) for a list of proposed features (and known issues).

- [ ] Add a admin panel
- [ ] The panel should allow admins to manage users, posts, and comments
- [ ] The panel should be able to delete DB entries that contain a specific user id
- [ ] Add MFA/2FA support for user accounts
- [ ] Add a list for banned users/ips/emails to the admin panel
- [ ] Add page for reporting posts/users/comments
- [ ] Add a page for viewing reported posts/users/comments
- [ ] Add support for uploading images for user avatars, stored in an S3 bucket
- [ ] Add footer to the frontend with links to the GitHub repo, license, and author

## License

Distributed under the `CC BY-NC-SA 4.0` License. See `LICENSE` for more information.

## Contributions

Contributions are welcome! If you encounter any issues or have improvements to suggest, feel free to open an issue or submit a pull request.

## Contact

For any questions or suggestions, please feel free to [contact the author](mailto:developers@vmgware.dev). You can also find more information about the author below.

---

A [VMG Ware](https://github.com/VMGWARE) Project.

[license-shield]: https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey.svg
[license-url]: https://creativecommons.org/licenses/by-nc-sa/4.0/
