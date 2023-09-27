// Packages
const User = require("../models/User");
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

  // Create the admin user
  const adminUser = new User({
    handle: process.env.ADMIN_HANDLE,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
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
