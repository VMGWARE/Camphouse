const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
chai.use(chaiAsPromised);
const crypto = require("crypto");

const UserToken = require("../../models/UserToken");

const ObjectId = mongoose.Types.ObjectId;
const mockUserId = new ObjectId();

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

// Begin testing
describe("UserToken model tests", function () {
  beforeEach(async function () {
    await UserToken.deleteMany({});
  });

  it("Should create a new user token successfully", async function () {
    const newUserToken = new UserToken({
      user: mockUserId,
      token: "samplehashedtokenvalue",
    });

    const savedToken = await newUserToken.save();
    assert.isNotNull(savedToken, "UserToken should be saved");
  });

  it("Should generate a new token for a user", async function () {
    const generatedToken = await UserToken.generate({ _id: mockUserId });
    assert.isNotNull(generatedToken, "Generated token should not be null");

    const savedToken = await UserToken.findOne({ user: mockUserId });
    assert.isNotNull(
      savedToken,
      "Token should exist in the database after generation"
    );
  });

  it("Should delete all tokens for a user", async function () {
    await UserToken.generate({ _id: mockUserId });
    await UserToken.generate({ _id: mockUserId });

    let tokenCount = await UserToken.countDocuments({ user: mockUserId });
    assert.equal(tokenCount, 2, "Should have 2 tokens before deletion");

    await UserToken.deleteAll({ _id: mockUserId });

    tokenCount = await UserToken.countDocuments({ user: mockUserId });
    assert.equal(tokenCount, 0, "Should have 0 tokens after deletion");
  });

  it("Should delete a specific token for a user", async function () {
    const generatedToken1 = await UserToken.generate({ _id: mockUserId });
    const userHashedToken = crypto
      .createHash("sha256")
      .update(generatedToken1)
      .digest("hex");

    let tokenInDb = await UserToken.findOne({
      user: mockUserId,
      token: userHashedToken,
    });
    assert.isNotNull(tokenInDb, "Token1 should exist in the database");

    await UserToken.delete({ _id: mockUserId, token: generatedToken1 });

    tokenInDb = await UserToken.findOne({
      user: mockUserId,
      token: generatedToken1,
    });
    assert.isNull(tokenInDb, "Token1 should be deleted from the database");
  });

  // ... Add more tests as needed ...
});

// Ensure the connection is closed at the end
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
