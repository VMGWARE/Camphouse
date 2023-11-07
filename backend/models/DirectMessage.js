const mongoose = require("mongoose");

/**
 * Direct Message Schema
 */
const DirectMessageSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  open: { type: Boolean, default: true },
});

module.exports = mongoose.model("DirectMessage", DirectMessageSchema);
