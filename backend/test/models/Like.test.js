const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const Like = require("../../models/Like");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

describe("Like model tests", function () {
  beforeEach(async function () {
    await Like.deleteMany({});
  });

  it("should save a like with valid fields", async function () {
    const like = new Like({
      user: new mongoose.Types.ObjectId(),
      post: new mongoose.Types.ObjectId(),
    });

    const savedLike = await like.save();
    assert.isDefined(savedLike, "Like was saved");
  });

  // Add more tests as needed
});

// After all tests, close the connection
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
