const mongoose = require("mongoose");

/**
 * Comment Schema
 */
const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    comment: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 255,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
