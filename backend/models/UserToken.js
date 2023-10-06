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
      index: true,
    },
    // Hashed token value
    token: {
      type: String,
      required: true,
      index: true,
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

// Delete all tokens for a user
TokenSchema.statics.deleteAll = async function (user) {
  await this.deleteMany({ user: user._id });
};

// Delete a token
TokenSchema.statics.delete = async function (user, token) {
  await this.deleteOne({ user: user._id, token: token });
};

module.exports = mongoose.model("UserToken", TokenSchema);
