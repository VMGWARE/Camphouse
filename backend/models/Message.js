const mongoose = require("mongoose");

/**
 * Message Schema
 */
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
