const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const Message = require("../../models/Message");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

describe("Message model tests", function () {
  beforeEach(async function () {
    await Message.deleteMany({});
  });

  it("should save a message with valid fields", async function () {
    const message = new Message({
      sender: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      content: "Hello, this is a test message.",
    });

    const savedMessage = await message.save();
    assert.isDefined(savedMessage, "Message was saved");
  });

  // Add more tests as needed
});

// After all tests, close the connection
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
