const chai = require("chai");
const assert = chai.assert;

const cryptoUtils = require("../../utils/crypto_utils");

describe("Crypto Utils Tests", function () {
  describe("Key Generation", function () {
    it("should generate a random key", function () {
      const key = cryptoUtils.getRandomKey();
      assert.equal(key.length, cryptoUtils.ALGORITHM.KEY_BYTE_LEN);
    });

    it("should generate a salt", function () {
      const salt = cryptoUtils.getSalt();
      assert.equal(salt.length, cryptoUtils.ALGORITHM.SALT_BYTE_LEN);
    });

    it("should generate a key from password and salt", function () {
      const password = Buffer.from("testPassword");
      const salt = cryptoUtils.getSalt();
      const key = cryptoUtils.getKeyFromPassword(password, salt);
      assert.equal(key.length, cryptoUtils.ALGORITHM.KEY_BYTE_LEN);
    });
  });

  describe("Encryption & Decryption", function () {
    it("should successfully encrypt and decrypt a message", function () {
      const key = cryptoUtils.getRandomKey();
      const originalMessage = Buffer.from("Hello World!");
      const encrypted = cryptoUtils.encrypt(originalMessage, key);
      const decrypted = cryptoUtils.decrypt(encrypted, key);
      assert.deepEqual(decrypted, originalMessage);
    });

    // Add more cases like handling wrong keys, corrupted ciphertexts, etc.
  });
});
