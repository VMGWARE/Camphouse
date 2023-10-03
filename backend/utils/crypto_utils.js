const crypto = require("crypto");

var exports = (module.exports = {});

const ALGORITHM = {
  /**
   * GCM is an authenticated encryption mode that
   * not only provides confidentiality but also
   * provides integrity in a secured way
   * */
  BLOCK_CIPHER: "aes-256-gcm",

  /**
   * 128 bit auth tag is recommended for GCM
   */
  AUTH_TAG_BYTE_LEN: 16,

  /**
   * NIST recommends 96 bits or 12 bytes IV for GCM
   * to promote interoperability, efficiency, and
   * simplicity of design
   */
  IV_BYTE_LEN: 12,

  /**
   * Note: 256 (in algorithm name) is key size.
   * Block size for AES is always 128
   */
  KEY_BYTE_LEN: 32,

  /**
   * To prevent rainbow table attacks
   * */
  SALT_BYTE_LEN: 16,
};

// Export algorithm constants
exports.ALGORITHM = ALGORITHM;

const getIV = () => crypto.randomBytes(ALGORITHM.IV_BYTE_LEN);
exports.getRandomKey = function getRandomKey() {
  return crypto.randomBytes(ALGORITHM.KEY_BYTE_LEN);
};

/**
 * To prevent rainbow table attacks
 * */
exports.getSalt = function getSalt() {
  return crypto.randomBytes(ALGORITHM.SALT_BYTE_LEN);
};

/**
 *
 * @param {Buffer} password - The password to be used for generating key
 *
 * To be used when key needs to be generated based on password.
 * The caller of this function has the responsibility to clear
 * the Buffer after the key generation to prevent the password
 * from lingering in the memory
 */
exports.getKeyFromPassword = function getKeyFromPassword(password, salt) {
  return crypto.scryptSync(password, salt, ALGORITHM.KEY_BYTE_LEN);
};

/**
 *
 * @param {Buffer} messagetext - The clear text message to be encrypted
 * @param {Buffer} key - The key to be used for encryption
 *
 * The caller of this function has the responsibility to clear
 * the Buffer after the encryption to prevent the message text
 * and the key from lingering in the memory
 */
exports.encrypt = function encrypt(messagetext, key) {
  const iv = getIV();
  const cipher = crypto.createCipheriv(ALGORITHM.BLOCK_CIPHER, key, iv, {
    authTagLength: ALGORITHM.AUTH_TAG_BYTE_LEN,
  });
  let encryptedMessage = cipher.update(messagetext);
  encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
  return Buffer.concat([iv, encryptedMessage, cipher.getAuthTag()]);
};

/**
 *
 * @param {Buffer} ciphertext - Cipher text
 * @param {Buffer} key - The key to be used for decryption
 *
 * The caller of this function has the responsibility to clear
 * the Buffer after the decryption to prevent the message text
 * and the key from lingering in the memory
 */
exports.decrypt = function decrypt(ciphertext, key) {
  const authTag = ciphertext.slice(-16);
  const iv = ciphertext.slice(0, 12);
  const encryptedMessage = ciphertext.slice(12, -16);
  const decipher = crypto.createDecipheriv(ALGORITHM.BLOCK_CIPHER, key, iv, {
    authTagLength: ALGORITHM.AUTH_TAG_BYTE_LEN,
  });
  decipher.setAuthTag(authTag);
  let messagetext = decipher.update(encryptedMessage);
  messagetext = Buffer.concat([messagetext, decipher.final()]);
  return messagetext;
};
