const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const User = require("../../models/User");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

describe("User model tests", function () {
  // Clean up before each test
  beforeEach(async function () {
    await User.deleteMany({});
  });

  it("should save a user with valid fields", async function () {
    const user = new User({
      handle: "testHandle",
      email: "test@email.com",
      password: "testPassword123",
      username: "Test User",
    });

    const savedUser = await user.save();
    assert.isDefined(savedUser, "User was saved");
  });

  it("should not save a user with a short password", async function () {
    const user = new User({
      handle: "testHandle",
      email: "test@email.com",
      password: "test",
      username: "Test User",
    });

    try {
      await user.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.password.kind,
        "minlength",
        "Error type should be minlength"
      );
    }
  });

  it("should set default values for unspecified fields", async function () {
    const user = new User({
      handle: "testHandle",
      email: "test@email.com",
      password: "testPassword123",
      username: "Test User",
    });

    const savedUser = await user.save();

    assert.equal(
      savedUser.profilePicture,
      "https://camphouse.vmgware.dev/images/profiles/ProfilePicture.png",
      "Default profile picture should be set"
    );
    assert.equal(
      savedUser.verified,
      false,
      "Default verified status should be false"
    );
    assert.equal(
      savedUser.admin,
      false,
      "Default admin status should be false"
    );
  });

  // Add more tests as needed
});

// After all tests, close the connection
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
