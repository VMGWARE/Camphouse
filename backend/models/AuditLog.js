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
      enum: [
        // Account
        "ACCOUNT_CREATED",
        "ACCOUNT_UPDATED",
        "ACCOUNT_DELETED",
        // Post
        "POST_CREATED",
        "POST_UPDATED",
        "POST_DELETED",
        // Comment
        "COMMENT_CREATED",
        "COMMENT_UPDATED",
        "COMMENT_DELETED",
        // Like
        "LIKE_CREATED",
        "LIKE_DELETED",
        // Follow
        "FOLLOW_CREATED",
        "FOLLOW_DELETED",
        // Message
        "MESSAGE_CREATED",
        "MESSAGE_UPDATED",
        "MESSAGE_DELETED",
        // Blocked Email Domains
        "BLOCKED_EMAIL_DOMAIN_CREATED",
        "BLOCKED_EMAIL_DOMAIN_UPDATED",
        "BLOCKED_EMAIL_DOMAIN_DELETED",
        // Report
        "REPORT_CREATED",
        "REPORT_UPDATED",
        "REPORT_DELETED",
        "REPORT_REVIEWED",
      ],
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
