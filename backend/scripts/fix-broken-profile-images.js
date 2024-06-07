// Packages
const User = require("../models/User");
const chalk = require("chalk");

// Load environment variables
require("dotenv").config();

// TODO: Fix hardcoded URL

// Fix broken profile images
const fixBrokenProfileImages = async () => {
  // Find all users
  const users = await User.find();

  // Loop through all users
  for (const user of users) {
    let needsUpdate = false;

    // If the profile image is not found, set it to the default image
    if (!user.profilePicture) {
      user.profilePicture =
        "https://camphouse.vmgware.dev/images/profiles/ProfilePicture.png";
      console.log(
        chalk.yellow(
          "User profile image has been set to the default image for: " +
            user.username
        )
      );
        needsUpdate = true;
    }

    // If it doesn't contain storage.vmgware.dev, set it to the default image
    if (
      !user.profilePicture.includes("storage.vmgware.dev") &&
      !user.profilePicture.includes("camphouse.vmgware.dev")
    ) {
      user.profilePicture =
        "https://camphouse.vmgware.dev/images/profiles/ProfilePicture.png";
      console.log(
        chalk.yellow(
          "User profile image has been set to the default image for: " +
            user.username
        )
      );
      needsUpdate = true;
    }

    if (needsUpdate) {
      await User.findByIdAndUpdate(user._id, { profilePicture: user.profilePicture });
    }
  }

  console.log(chalk.green("All broken profile images have been fixed"));
};

// Begin the server
(async () => {
  console.log(chalk.green("Fixing broken profile images..."));

  // Connect to MongoDB
  require("../db");

  await fixBrokenProfileImages();
  process.exit();
})();
