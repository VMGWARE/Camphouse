const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    // The user the token belongs to
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Hashed token value
    token: {
      type: String,
      required: true,
    },
    // Used to determine if token is valid
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Generates a new token for a user
 * @param {*} user - The user to generate a token for
 * @returns {Promise<Token>} - The generated token
 */
TokenSchema.statics.generate = async function (user) {
  // Generate a random string
  const randomString = crypto.randomBytes(32).toString("hex");

  // Create a new token
  const token = this({
    user: user._id,
    token: crypto.createHash("sha256").update(randomString).digest("hex"),
  });

  // Save the token
  await token.save();
  return randomString;
};

module.exports = mongoose.model("UserToken", TokenSchema);
