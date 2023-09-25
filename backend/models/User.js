const mongoose = require("mongoose");

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 32,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    username: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 32,
    },
    profilePicture: {
      type: String,
      default: "https://app.camphouse.net/images/profiles/ProfilePicture.png",
    },
    bio: {
      type: String,
      default: "",
      maxLength: 255,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
