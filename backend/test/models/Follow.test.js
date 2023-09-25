const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const Follow = require("../../models/Follow");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

describe("Follow model tests", function () {
  // Clean up before each test
  beforeEach(async function () {
    await Follow.deleteMany({});
  });

  // Test to ensure a Follow relation with valid fields can be saved.
  it("should save a follow relation with valid fields", async function () {
    const follow = new Follow({
      follower: new mongoose.Types.ObjectId(),
      following: new mongoose.Types.ObjectId(),
    });

    const savedFollow = await follow.save();
    assert.isDefined(savedFollow, "Follow relation was saved");
  });

  // Test to ensure a Follow relation cannot be saved without the follower field.
  it("should not save a follow relation without follower", async function () {
    const follow = new Follow({
      following: new mongoose.Types.ObjectId(),
    });

    try {
      await follow.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.follower.kind,
        "required",
        "Error type should be required for follower"
      );
    }
  });

  // Test to ensure a Follow relation cannot be saved without the following field.
  it("should not save a follow relation without following", async function () {
    const follow = new Follow({
      follower: new mongoose.Types.ObjectId(),
    });

    try {
      await follow.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.following.kind,
        "required",
        "Error type should be required for following"
      );
    }
  });

  // Add more tests as needed, for instance, uniqueness constraints if any.
});

// After all tests, close the connection using the appropriate hook.
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
