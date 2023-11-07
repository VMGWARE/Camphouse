const mongoose = require("mongoose");

/**
 * Group Message Schema
 */
const GroupMessageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  groupName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  invites: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      invitedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
      },
    },
  ],
});

module.exports = mongoose.model("GroupMessage", GroupMessageSchema);
