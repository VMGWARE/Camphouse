# Camphouse

[![License: CC BY-NC-SA 4.0][license-shield]][license-url]
[![status-badge](https://woodpecker.vahngomes.dev/api/badges/VMGWARE/Camphouse/status.svg)](https://woodpecker.vahngomes.dev/VMGWARE/Camphouse)

Post something amazing. ✨

## About The Project

Camphouse is a simple, open-source, and self-hosted social media platform. It is designed to be easy to use and easy to deploy. It is built with [Node.js](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/), and [Vue.js](https://vuejs.org/). It was originally called Aqurilla, but was renamed to Camphouse in 2023.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Before starting with the installation, ensure that the following prerequisites are installed and properly configured on your system.

- [Node.js](https://nodejs.org/en/) - Necessary to run the server and execute the JavaScript code.
- [MongoDB](https://www.mongodb.com/) - The database used by Camphouse to store user data and other information.
- [Docker](https://www.docker.com/) (Optional) - If you prefer running the application inside a container.

### Installation

Follow the steps below for installation and setup:

1. Clone the repo

   ```sh
   gh repo clone VMGWARE/Camphouse
   ```

2. Navigate into the project directory

   ```sh
   cd Camphouse
   ```

3. Copy the `.env.example` file and rename it to `.env`.

   ```sh
   cp .env.example .env
   ```

4. Open the `.env` file with your favorite text editor and fill in the configuration details.

   ```plaintext
   # Application configuration
   APP_PORT=3000                   # The port on which the app will run.
   SESSION_SECRET=<your_secret>    # A secret string used to secure user sessions.

   # Database configuration
   DB_NAME=aquirilla               # The name of your MongoDB database.
   DB_HOST=localhost               # The host where your MongoDB server is running.
   DB_PORT=27017                   # The port on which your MongoDB server is accessible.
   DB_USER=<db_username>           # The username for your MongoDB database.
   DB_PASS=<db_password>           # The password for your MongoDB database.

   # JWT
   JWT_SECRET=<jwt_secret>         # A secret string used to sign JSON Web Tokens.

   # Admin
   ADMIN_HANDLE=<admin_handle>     # The handle for the initial admin account.
   ADMIN_EMAIL=<admin_email>       # The email address for the initial admin account.
   ADMIN_PASSWORD=<admin_password> # The password for the initial admin account.
   ADMIN_USERNAME=<admin_username> # The username for the initial admin account.
   ```

   Replace the placeholder text (e.g., `<your_secret>`, `<db_username>`) with your actual information. Keep these details confidential.

5. Continue with the installation of NPM packages and starting the servers as provided in the original guide.

   ```sh
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

Start the backend server:

   ```sh
   cd backend
   npm run start
   ```

Start the frontend server:

   ```sh
   cd frontend
   npm run serve
   ```

6. Access the application through your browser at `http://localhost:8080`.

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

A Quick warning. If you have LOCAL_STORAGE set to true. Make sure to assign a volume to the `/usr/local/api/public/storage` path. Otherwise, you will lose all your images when you restart the container.

## Roadmap

See the [open issues](https://github.com/VMGWARE/Camphouse/issues) for a list of proposed features (and known issues).

### General

- [ ] Add MFA/2FA support for user accounts
- [ ] Add page for reporting posts/users/comments
- [ ] Add support for uploading images for user avatars, stored in an S3 bucket
- [ ] Add footer to the frontend with links to the GitHub repo, license, and author
- [ ] Email verification for new accounts
- [ ] Update font to be one that isn't copyrighted/free

### Admin

- [ ] Add a admin panel
- [ ] Add a page for viewing reported posts/users/comments
- [ ] The panel should allow admins to manage users, posts, and comments
- [ ] The panel should be able to delete DB entries that contain a specific user id
- [ ] Allow deletion of user accounts, this will also delete all posts and comments associated with the account
- [ ] Add a list for banned users/ips/emails to the admin panel

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
