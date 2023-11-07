/**
 * A validation utility class for checking input against specified rules and outputting error messages.
 */
class Validator {
  /**
   * Creates an instance of the Validator class.
   * @param {Object} rules - The validation rules for each field.
   * @param {Object} messages - The error messages to return when a rule fails.
   * @param {Object} [options] - Additional options for validation.
   */
  constructor(rules, messages, options = {}) {
    this.#validateRulesFormat(rules);
    this.#validateMessagesFormat(messages);
    this.#validateOptionsFormat(options);

    /**
     * An object containing the validation rules for each field.
     */
    this.rules = rules;

    /**
     * An object containing the error messages for each rule.
     */
    this.messages = messages;

    /**
     * An object containing additional options for validation.
     */
    this.options = options;

    /**
     * An object containing any validation errors found during the check.
     */
    this.errors = {};

    /**
     * An object containing the fields that passed validation.
     */
    this.passed = {};
  }

  /**
   * Checks if the rules object follows the expected format.
   * @param {Object} rules - The rules object to validate.
   */
  #validateRulesFormat(rules) {
    for (const key in rules) {
      const rule = rules[key];
      if (typeof rule !== "object" || Array.isArray(rule)) {
        throw new Error(`The rule for '${key}' should be an object.`);
      }
      if (rule.type === undefined || typeof rule.type !== "string") {
        throw new Error(
          `The rule for '${key}' must include a 'type' property of type string.`
        );
      }
      if (rule.required !== undefined && typeof rule.required !== "boolean") {
        throw new Error(
          `The 'required' property for '${key}' must be of type boolean.`
        );
      }
      if (rule.min !== undefined && typeof rule.min !== "number") {
        throw new Error(
          `The 'min' property for '${key}' must be of type number.`
        );
      }
      if (rule.max !== undefined && typeof rule.max !== "number") {
        throw new Error(
          `The 'max' property for '${key}' must be of type number.`
        );
      }
      if (rule.match !== undefined && typeof rule.match !== "string") {
        throw new Error(
          `The 'match' property for '${key}' must be of type string.`
        );
      }
      if (rule.validate !== undefined && typeof rule.validate !== "string") {
        throw new Error(
          `The 'validate' property for '${key}' must be of type string.`
        );
      }
    }
  }

  /**
   * Checks if the options object follows the expected format.
   * @param {Object} options - The options object to validate.
   */
  #validateOptionsFormat(options) {
    if (typeof options !== "object" || Array.isArray(options)) {
      throw new Error("The options should be an object.");
    }
    if (
      options.trackPassed !== undefined &&
      typeof options.trackPassed !== "boolean"
    ) {
      throw new Error(
        `The 'trackPassed' property for options must be of type boolean.`
      );
    }
  }

  /**
   * Checks if the messages object follows the expected format.
   * @param {Object} messages - The messages object to validate.
   */
  #validateMessagesFormat(messages) {
    for (const key in messages) {
      const message = messages[key];
      if (typeof message !== "object" || Array.isArray(message)) {
        throw new Error(`The message for '${key}' should be an object.`);
      }
      if (message.type === undefined || typeof message.type !== "string") {
        throw new Error(
          `The message for '${key}' must include a 'type' property of type string.`
        );
      }
      if (
        message.required !== undefined &&
        typeof message.required !== "string"
      ) {
        throw new Error(
          `The 'required' property for '${key}' must be of type string.`
        );
      }
      if (message.min !== undefined && typeof message.min !== "string") {
        throw new Error(
          `The 'min' property for '${key}' must be of type string.`
        );
      }
      if (message.max !== undefined && typeof message.max !== "string") {
        throw new Error(
          `The 'max' property for '${key}' must be of type string.`
        );
      }
      if (message.match !== undefined && typeof message.match !== "string") {
        throw new Error(
          `The 'match' property for '${key}' must be of type string.`
        );
      }
      if (
        message.validate !== undefined &&
        typeof message.validate !== "string"
      ) {
        throw new Error(
          `The 'validate' property for '${key}' must be of type string.`
        );
      }
    }
  }

  /**
   * Validates an email address with a regular expression.
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns true if the email is valid, otherwise false.
   */
  #validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Validates the provided input against the predefined rules and sets error messages accordingly.
   * This method now iterates over the rules instead of the input fields to catch missing fields.
   * @param {Object} input - The input object with keys and values to validate.
   * @returns {boolean} - Returns true if no validation errors, false otherwise.
   */
  validate(input) {
    // Clear previous errors
    this.errors = {};

    // Iterate over the rules instead of input
    for (const key in this.rules) {
      const rule = this.rules[key];
      const value = input[key];

      // Check for required field
      if (rule.required && (value === "" || value === undefined)) {
        this.errors[key] = this.messages[key].required;
        continue; // Skip further checks if the field is missing
      }

      // If the value is not present, no need to check further rules
      if (value === undefined) continue;

      // Check for correct type
      if (typeof value !== rule.type) {
        this.errors[key] = this.messages[key].type;
      }

      // Check for minimum length
      if (rule.min !== undefined && value.length < rule.min) {
        this.errors[key] = this.messages[key].min;
      }

      // Check for maximum length
      if (rule.max !== undefined && value.length > rule.max) {
        this.errors[key] = this.messages[key].max;
      }

      // Check for valid email
      if (rule.validate === "email" && !this.#validateEmail(value)) {
        this.errors[key] = this.messages[key].validate;
      }

      // Check for matching fields
      if (rule.match && value !== input[rule.match]) {
        this.errors[key] = this.messages[key].match;
      }
    }

    // Iterate over the fields after validation checks
    for (const key in this.rules) {
      if (!this.errors[key] && this.options.trackPassed) {
        this.passed[key] = input[key];
      }
    }

    // If no errors were found, return true
    return Object.keys(this.errors).length === 0;
  }
}

module.exports = Validator;
