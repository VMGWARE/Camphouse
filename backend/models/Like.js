const mongoose = require("mongoose");

/**
 * Like Schema
 */
const LikeSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", LikeSchema);
