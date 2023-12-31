const mongoose = require("mongoose");

/**
 * Follow Schema
 */
const FollowSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Follow", FollowSchema);
