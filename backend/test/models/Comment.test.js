const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const Comment = require("../../models/Comment");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

// Begin testing
describe("Comment model tests", function () {
  // Before each test, remove all comments to ensure a clean slate
  beforeEach(async function () {
    await Comment.deleteMany({});
  });

  it("should save a comment with valid fields", async function () {
    const comment = new Comment({
      user: new mongoose.Types.ObjectId(),
      post: new mongoose.Types.ObjectId(),
      comment: "This is a sample comment",
    });

    const savedComment = await comment.save();
    assert.isDefined(savedComment, "Comment was saved");
  });

  it("should not save a comment with a short comment text", async function () {
    const comment = new Comment({
      user: new mongoose.Types.ObjectId(),
      post: new mongoose.Types.ObjectId(),
      comment: "Hi",
    });

    try {
      await comment.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.comment.kind,
        "minlength",
        "Error type should be minlength"
      );
    }
  });

  // Add more tests as needed
});

// After all tests, close the connection
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
