const mongoose = require("mongoose");

/**
 * RoleHasPermission Schema
 */
const RoleHasPermissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RoleHasPermission", RoleHasPermissionSchema);
