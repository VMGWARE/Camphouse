const mongoose = require("mongoose");
const chalk = require("chalk");
require("dotenv").config();

// Build the connection string, with the username and password from the .env file
var DB_URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}`;
// Connect to MongoDB
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME + "-test",
  })
  .then(() => {
    if (mongoose.connection.readyState === 1) {
      console.log(chalk.green("✅ MongoDB connection established!"));
    } else {
      console.log(
        chalk.red("❌ MongoDB connection not established. Exiting...")
      );
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(
      chalk.red(
        `❌ MongoDB connection error. Please make sure MongoDB is running. ${error}`
      )
    );
  });
