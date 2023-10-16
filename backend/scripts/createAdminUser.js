// Packages
const User = require("../models/User");
const bcrypt = require("bcrypt");
const chalk = require("chalk");

// Load environment variables
require("dotenv").config();

// Create the admin user
const createAdminUser = async () => {
  // Check if the admin user already exists
  const adminUserExists = await User.exists({ admin: true });

  // If the admin user already exists, return
  if (adminUserExists) {
    console.log(chalk.yellow("Admin user already exists"));
    return;
  }

  // If the input is not provided, return
  if (
    !process.env.ADMIN_HANDLE ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.ADMIN_USERNAME
  ) {
    console.log(
      chalk.yellow(
        "Please provide the admin handle, email, password and username in the .env file if you want to create an admin user"
      )
    );
    return;
  }

  // Encrypt password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  // Create the admin user
  const adminUser = new User({
    handle: process.env.ADMIN_HANDLE,
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    username: process.env.ADMIN_USERNAME,
    verified: true,
    admin: true,
  });

  // Save the admin user
  try {
    await adminUser.save();
    console.log(chalk.green("Admin user created successfully"));
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createAdminUser };
