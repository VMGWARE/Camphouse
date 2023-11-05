const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;

const BlockedEmailDomain = require("../../models/BlockedEmailDomain");

// Setup Mongoose for testing
before(async function () {
  // Setup Mongoose for testing
  require("../../db-test");
});

// Begin testing
describe("BlockedEmailDomain model tests", function () {
  // Before each test, remove all BlockedEmailDomains to ensure a clean slate
  beforeEach(async function () {
    await BlockedEmailDomain.deleteMany({});
  });

  it("should save a BlockedEmailDomain with valid fields", async function () {
    const blockedEmailDomain = new BlockedEmailDomain({
      domain: "test.com",
    });

    const savedBlockedEmailDomain = await blockedEmailDomain.save();
    assert.isDefined(savedBlockedEmailDomain, "BlockedEmailDomain was saved");
  });

  it("should not save a BlockedEmailDomain missing a domain", async function () {
    const blockedEmailDomain = new BlockedEmailDomain({});

    try {
      await blockedEmailDomain.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.errors.domain.kind,
        "required",
        "Error type should be required"
      );
    }
  });

  it("should not save a duplicate BlockedEmailDomain", async function () {
    const blockedEmailDomain = new BlockedEmailDomain({
      domain: "test.com",
    });

    await blockedEmailDomain.save();

    const blockedEmailDomain2 = new BlockedEmailDomain({
      domain: "test.com",
    });

    try {
      await blockedEmailDomain2.save();
      assert.fail("Expected error not thrown");
    } catch (error) {
      assert.equal(
        error.code,
        11000,
        "Error code should be 11000 (duplicate key error)"
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
