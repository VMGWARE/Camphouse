const mongoose = require("mongoose");

/**
 * Permission Schema
 */
const PermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Permission", PermissionSchema);
