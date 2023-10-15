const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Check if the given email is valid or not.
 * @param email - The email to be validated.
 * @returns True if the email is valid, false otherwise.
 */
function validateEmail(email) {
  // Regular expression to check for valid email addresses
  var re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**
 * Check if the given string is empty.
 * @param str - The string to be checked.
 * @returns True if the string is empty, false otherwise.
 */
function isStringEmpty(str) {
  return !str || str.length === 0 || /^\s*$/.test(str);
}

/**
 * Generate a random string of the given length.
 * @param length - The length of the string to be generated.
 * @returns The generated string.
 */
function generateRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Get the current version of the application
 * @returns {string} The current version of the application
 */
function getVersion() {
  var version = "unknown";
  try {
    const currentPath = path.dirname(__filename);
    version = fs.readFileSync(path.join(currentPath, "../version")).toString();
    version = version.replace("v", "").trim();
  } catch {
    const { execSync } = require("child_process");
    try {
      version = execSync("git describe --always --tags --dirty").toString();
      version = version.replace("v", "").trim();
    } catch {
      return process.env.npm_package_version;
    }
    fs.writeFileSync("version", version);
    return version;
  }

  return version;
}

module.exports = {
  validateEmail,
  isStringEmpty,
  generateRandomString,
  getVersion,
};
