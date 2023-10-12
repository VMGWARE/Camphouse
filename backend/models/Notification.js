const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["MESSAGE", "COMMENT", "LIKE", "UNLIKE", "FOLLOW", "UNFOLLOW", "REPORT"],
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referenceId: {
      type: mongoose.Types.ObjectId,
      refPath: "onModel",
      required: true,
      index: true,
    },
    onModel: {
      type: String,
      required: true,
      enum: ["Post", "Message", "User", "Report"],
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
