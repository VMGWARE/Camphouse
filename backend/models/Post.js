const mongoose = require("mongoose");
const Comment = require("./Comment");
const Like = require("./Like");

/**
 * Post Schema
 */
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
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

// TODO: Ad pre hook to delete all comments and likes for the post

module.exports = mongoose.model("Post", PostSchema);
