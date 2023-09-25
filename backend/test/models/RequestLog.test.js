const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const RequestLog = require("../../models/RequestLog");

// Setup Mongoose for testing
before(async function () {
  require("../../db-test"); // Make sure you have your test database configuration in db-test.js
});

describe("RequestLog model tests", function () {
  // Clean up before each test
  beforeEach(async function () {
    await RequestLog.deleteMany({});
  });

  it("should save a request log with valid fields", async function () {
    const log = new RequestLog({
      method: "GET",
      url: "/test-endpoint",
      headers: { "content-type": "application/json" },
      ip: "127.0.0.1",
    });

    const savedLog = await log.save();
    assert.isDefined(savedLog, "RequestLog was saved");
  });

  it("should not save a request log without required fields", async function () {
    const log = new RequestLog({
      method: "GET",
      headers: { "content-type": "application/json" },
      ip: "127.0.0.1",
    }); // Missing "url"

    try {
      await log.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.url.kind,
        "required",
        "Error type should be required for URL"
      );
    }
  });

  // You can add more tests as needed
});

// After all tests, close the connection
after(function (done) {
  mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
