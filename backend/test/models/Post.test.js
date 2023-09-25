const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const Post = require("../../models/Post");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

describe("Post model tests", function () {
  beforeEach(async function () {
    await Post.deleteMany({});
  });

  it("should save a post with valid fields", async function () {
    const post = new Post({
      title: "Test Post",
      content: "This is a test post content.",
      user: new mongoose.Types.ObjectId(),
    });

    const savedPost = await post.save();
    assert.isDefined(savedPost, "Post was saved");
  });

  it("should not save a post with short content", async function () {
    const post = new Post({
      title: "Test",
      content: "Short",
      user: new mongoose.Types.ObjectId(),
    });

    try {
      await post.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.content.kind,
        "minlength",
        "Error type should be minlength for content"
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
