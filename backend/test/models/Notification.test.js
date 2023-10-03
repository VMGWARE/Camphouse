const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised"); // For asserting promises
const assert = chai.assert;
chai.use(chaiAsPromised);

const Notification = require("../../models/Notification");

// Mock ObjectId for testing
const ObjectId = mongoose.Types.ObjectId;
const mockUserId1 = new ObjectId();
const mockUserId2 = new ObjectId();
const mockPostId = new ObjectId();

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

// Begin testing
describe("Notification model tests", function () {
  // Before each test, remove all Notifications to ensure a clean slate
  beforeEach(async function () {
    await Notification.deleteMany({});
  });

  it("Should create a new notification successfully", async function () {
    const newNotification = new Notification({
      type: "MESSAGE",
      sender: mockUserId1,
      receiver: mockUserId2,
      referenceId: mockPostId,
      onModel: "Post",
      message: "New message notification",
    });

    const savedNotification = await newNotification.save();
    assert.isNotNull(savedNotification, "Notification should be saved");
    assert.equal(
      savedNotification.read,
      false,
      "Default read status should be false"
    );
  });

  it("Should fail when a required field is missing", async function () {
    const newNotification = new Notification({
      type: "MESSAGE",
      sender: mockUserId1,
      referenceId: mockPostId,
      onModel: "Post",
      message: "New message notification",
    });

    await assert.isRejected(
      newNotification.save(),
      "Notification validation failed: receiver: Path `receiver` is required."
    );
  });

  it("Should fail when type is not one of the enums", async function () {
    const newNotification = new Notification({
      type: "INVALID_TYPE",
      sender: mockUserId1,
      receiver: mockUserId2,
      referenceId: mockPostId,
      onModel: "Post",
      message: "New message notification",
    });

    await assert.isRejected(
      newNotification.save(),
      "Notification validation failed: type: `INVALID_TYPE` is not a valid enum value for path `type`."
    );
  });

  it("Should default read status to false", async function () {
    const newNotification = new Notification({
      type: "LIKE",
      sender: mockUserId1,
      receiver: mockUserId2,
      referenceId: mockPostId,
      onModel: "Post",
      message: "Like notification",
    });

    const savedNotification = await newNotification.save();
    assert.equal(
      savedNotification.read,
      false,
      "Read status should default to false"
    );
  });

  // Add more tests as needed
});

// Ensure the connection is closed at the end
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
