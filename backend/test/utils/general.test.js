const chai = require("chai");
const assert = chai.assert;
const { expect } = chai;
const sinon = require("sinon");
const fs = require("fs");
const child_process = require("child_process");
const {
  validateEmail,
  isStringEmpty,
  generateRandomString,
  getVersion,
} = require("../../utils/general");

describe("General utility functions", function () {
  describe("validateEmail function", function () {
    it("should return true for valid emails", function () {
      const validEmails = [
        "test@example.com",
        "user.name+tag+sorting@example.com",
        "user@localhost.localdomain",
        "user.name@example.com",
      ];

      for (const email of validEmails) {
        assert.isTrue(
          validateEmail(email),
          `${email} should be considered valid`
        );
      }
    });

    it("should return false for invalid emails", function () {
      const invalidEmails = [
        "plainaddress",
        "@missingusername.com",
        "username@.com",
        "username@.com.com",
        "username@..com",
        "username@.c",
        "username@server.c",
        "username@server..com",
      ];

      for (const email of invalidEmails) {
        assert.isFalse(
          validateEmail(email),
          `${email} should be considered invalid`
        );
      }
    });
  });

  describe("isStringEmpty", function () {
    it("should return true for an empty string", function () {
      const result = isStringEmpty("");
      assert.isTrue(result);
    });

    it("should return false for a non-empty string", function () {
      const result = isStringEmpty("Hello");
      assert.isFalse(result);
    });

    it("should return true for a string with only spaces", function () {
      const result = isStringEmpty("    ");
      assert.isTrue(result); // Depending on your requirements, this might be true or false.
    });

    it("should return true for null or undefined", function () {
      assert.isTrue(isStringEmpty(null));
      assert.isTrue(isStringEmpty(undefined));
    });

    // More edge cases can be added as needed
  });

  describe("generateRandomString", function () {
    it("should return a different string each time", function () {
      const length = 10;
      const result1 = generateRandomString(length);
      const result2 = generateRandomString(length);
      assert.notEqual(result1, result2);
    });
  });

  describe("getVersion", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("should return the version from the version file if it exists", () => {
      sinon.stub(fs, "readFileSync").returns("v1.0.0");

      const version = getVersion();

      expect(version).to.equal("1.0.0");
    });

    it("should return the version from git describe if the version file does not exist", () => {
      sinon.stub(fs, "readFileSync").throws(new Error());
      sinon.stub(child_process, "execSync").returns(Buffer.from("v1.0.1"));

      const version = getVersion();

      expect(version).to.equal("1.0.1");
    });

    it("should return the npm package version if git describe fails", () => {
      sinon.stub(fs, "readFileSync").throws(new Error());
      sinon.stub(child_process, "execSync").throws(new Error());
      process.env.npm_package_version = "1.0.2";

      const version = getVersion();

      expect(version).to.equal("1.0.2");
    });

    it("should write the version to the version file if it is retrieved from git describe", () => {
      sinon.stub(fs, "readFileSync").throws(new Error());
      sinon.stub(child_process, "execSync").returns(Buffer.from("v1.0.1"));
      const writeFileSyncStub = sinon.stub(fs, "writeFileSync");

      getVersion();

      expect(writeFileSyncStub.calledOnceWith("version", "1.0.1")).to.be.true;
    });

    it("should return the version from git describe if the version file does not exist", () => {
      sinon.stub(fs, "readFileSync").throws(new Error());
      sinon
        .stub(child_process, "execSync")
        .returns(Buffer.from("v1.0.1-dirty"));

      const version = getVersion();

      expect(version).to.equal("1.0.1-dirty");
    });

    it("should write the version to the version file if it is retrieved from git describe", () => {
      sinon.stub(fs, "readFileSync").throws(new Error());
      sinon
        .stub(child_process, "execSync")
        .returns(Buffer.from("v1.0.1-dirty"));
      const writeFileSyncStub = sinon.stub(fs, "writeFileSync");

      getVersion();

      expect(writeFileSyncStub.calledOnceWith("version", "1.0.1-dirty")).to.be
        .true;
    });
  });

  // Add tests for other utility functions here, if any.
});
