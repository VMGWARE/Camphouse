const AuditLogModel = require("../models/AuditLog");

/**
 * AuditLogService class for handling audit log operations
 */
class AuditLogService {
  /**
   * Logs an action into the audit log.
   * @param {string} user - The ID of the user performing the action.
   * @param {string} action - The action performed by the user.
   * @param {string} request - The ID of the request log associated with the action.
   * @param {string} ipAddress - The IP address of the user performing the action.
   * @param {any} data - The data associated with the action.
   * @returns {Promise<Object>} A promise that resolves to the created audit log object.
   * @throws {Error} Throws an error if validation fails or unable to save the audit log.
   */
  static async log(user, action, request = null, ipAddress, data = null) {
    try {
      // Validate user, action, and ipAddress
      if (!user || !action || !ipAddress)
        throw new Error("User, action, and ipAddress are required");

      // Create and save the audit log
      const auditLog = new AuditLogModel({
        user,
        action,
        request,
        ipAddress,
        data,
      });

      await auditLog.save();
      return auditLog;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Fetches audit logs for a specific user.
   * @param {string} userId - The ID of the user for which logs should be fetched.
   * @returns {Promise<Array>} A promise that resolves to an array of logs for the user.
   * @throws {Error} Throws an error if unable to fetch the logs.
   */
  static async fetchLogsForUser(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const logs = await AuditLogModel.find({ user: userId });
      return logs;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Deletes logs older than a specific date.
   * @param {Date} date - The date threshold; logs older than this date will be deleted.
   * @returns {Promise<number>} A promise that resolves to the number of logs deleted.
   * @throws {Error} Throws an error if unable to delete the logs.
   */
  static async purgeOldLogs(date) {
    try {
      if (!date || !(date instanceof Date))
        throw new Error("Valid date object is required");

      const result = await AuditLogModel.deleteMany({
        createdAt: { $lt: date },
      });
      return result.deletedCount;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = AuditLogService;
