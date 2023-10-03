const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
chai.use(chaiAsPromised);

const Report = require("../../models/Report");

const ObjectId = mongoose.Types.ObjectId;
const mockUserId1 = new ObjectId();
const mockUserId2 = new ObjectId();
const mockContentId = new ObjectId();

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

// Begin testing
describe("Report model tests", function () {
  beforeEach(async function () {
    await Report.deleteMany({});
  });

  it("Should create a new report successfully", async function () {
    const newReport = new Report({
      reportedBy: mockUserId1,
      reported: mockUserId2,
      reportedContentId: mockContentId,
      reportedContentType: "Post",
      snapshot: { content: "This is a sample content snapshot" },
      description: "Inappropriate content",
    });

    const savedReport = await newReport.save();
    assert.isNotNull(savedReport, "Report should be saved");
    assert.equal(
      savedReport.status,
      "Pending",
      "Default status should be Pending"
    );
  });

  it("Should fail when a required field is missing", async function () {
    const newReport = new Report({
      reportedBy: mockUserId1,
      reported: mockUserId2,
      reportedContentId: mockContentId,
      reportedContentType: "Post",
      snapshot: { content: "This is a sample content snapshot" },
    });

    await assert.isRejected(
      newReport.save(),
      "Report validation failed: description: Path `description` is required."
    );
  });

  it("Should fail when reportedContentType is not one of the enums", async function () {
    const newReport = new Report({
      reportedBy: mockUserId1,
      reported: mockUserId2,
      reportedContentId: mockContentId,
      reportedContentType: "InvalidType",
      snapshot: { content: "This is a sample content snapshot" },
      description: "Inappropriate content",
    });

    await assert.isRejected(
      newReport.save(),
      "Report validation failed: reportedContentType: `InvalidType` is not a valid enum value for path `reportedContentType`."
    );
  });

  it("Should fail when status is not one of the enums", async function () {
    const newReport = new Report({
      reportedBy: mockUserId1,
      reported: mockUserId2,
      reportedContentId: mockContentId,
      reportedContentType: "Post",
      snapshot: { content: "This is a sample content snapshot" },
      description: "Inappropriate content",
      status: "InvalidStatus",
    });

    await assert.isRejected(
      newReport.save(),
      "Report validation failed: status: `InvalidStatus` is not a valid enum value for path `status`."
    );
  });

  // ... Add more tests as needed ...
});

// Ensure the connection is closed at the end
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
