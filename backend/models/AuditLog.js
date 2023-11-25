const mongoose = require("mongoose");

/**
 * Audit Log Schema
 */
const AuditLogSchema = new mongoose.Schema(
  {
    // User who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },
    // Action performed by the user
    action: {
      type: String,
      required: true,
      index: true,
    },
    // Request log associated with the action
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestLog",
      required: false,
      default: null,
    },
    // IP address of the user
    ip: {
      type: String,
      required: true,
      index: true,
    },
    // Can be used to store any additional data like previous and new values
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
