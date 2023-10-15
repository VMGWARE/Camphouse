const mongoose = require("mongoose");

/**
 * DisposableEmailHoster Schema
 */
const DisposableEmailHosterSchema = new mongoose.Schema(
  {
    domain: {
      // The domain of the disposable email hoster.
      type: String,
      required: true,
      unique: true, // Ensure that the domain is unique to prevent duplicate entries.
      trim: true, // Remove any unnecessary whitespace.
    },
    isBlocked: {
      // Boolean to check if the domain is blocked.
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields.
);

module.exports = mongoose.model(
  "DisposableEmailHoster",
  DisposableEmailHosterSchema
);
