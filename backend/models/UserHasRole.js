const mongoose = require("mongoose");

/**
 * UserHasRole Schema
 */
const UserHasRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserHasRole", UserHasRoleSchema);
