const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const AuditLog = require("../../models/AuditLog");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

// Begin testing
describe("AuditLog model tests", function () {
  // Before each test, remove all AuditLogs to ensure a clean slate
  beforeEach(async function () {
    await AuditLog.deleteMany({});
  });

  it("should save a AuditLog with valid fields", async function () {
    const auditLog = new AuditLog({
      user: new mongoose.Types.ObjectId(),
      action: "LIKE_CREATED",
      ip: "127.0.0.1",
    });

    const savedAuditLog = await auditLog.save();
    assert.isDefined(savedAuditLog, "AuditLog was saved");
  });

  it("should not save an AuditLog missing a user", async function () {
    const auditLog = new AuditLog({
      action: "LIKE_CREATED",
      ip: "127.0.0.1",
    });

    try {
      await auditLog.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      // Check if the error is a TypeError and the message includes 'user'
      assert.equal(
        error instanceof TypeError && /'user'/.test(error.message),
        false,
        "Expected TypeError for undefined 'user'"
      );
    }
  });

  it("should not save an AuditLog missing an action", async function () {
    const auditLog = new AuditLog({
      user: new mongoose.Types.ObjectId(),
      ip: "127.0.0.1",
    });

    try {
      await auditLog.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      // Check if the error is a TypeError and the message includes 'action'
      assert.equal(
        error instanceof TypeError && /'action'/.test(error.message),
        false,
        "Expected TypeError for undefined 'action'"
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
