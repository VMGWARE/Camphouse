const mongoose = require("mongoose");

/**
 * Post Schema
 */
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength:3,
      maxLength: 100,
    },
    content: {
      type: String,
      required: true,
      minLength:6,
      maxLength: 1000,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
