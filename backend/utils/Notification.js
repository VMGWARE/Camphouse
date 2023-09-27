const NotificationModel = require("../models/Notification");

/**
 * NotificationService class for handling notification operations
 */
class NotificationService {
  /**
   * Creates a new notification.
   * @param {string} type - The type of the notification, should be one of ["MESSAGE", "LIKE", "COMMENT"].
   * @param {string} sender - The ID of the user sending the notification.
   * @param {string} receiver - The ID of the user receiving the notification.
   * @param {string} referenceId - The ID of the referenced model (either Post or Message).
   * @param {string} onModel - The name of the model to which the notification is related, should be one of ["Post", "Message"].
   * @param {string} message - The message content of the notification.
   * @returns {Promise<Object>} - A promise that resolves to the created notification object.
   * @throws {Error} - Throws an error if validation fails or unable to save the notification.
   */
  static async create(type, sender, receiver, referenceId, onModel, message) {
    try {
      // Validate type
      if (!["MESSAGE", "LIKE", "COMMENT"].includes(type))
        throw new Error("Invalid type");

      // Validate onModel
      if (!["Post", "Message"].includes(onModel))
        throw new Error("Invalid onModel");

      // Validate sender, receiver, and referenceId
      if (!sender || !receiver || !referenceId)
        throw new Error("Sender, receiver, and referenceId are required");

      // Create and save the notification
      const notification = new NotificationModel({
        type,
        sender,
        receiver,
        referenceId,
        onModel,
        message,
      });

      await notification.save();
      return notification;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Clears all unread notifications for a specific user by setting them to read.
   * @param {string} userId - The ID of the user whose notifications should be cleared.
   * @returns {Promise<number>} - A promise that resolves to the number of notifications updated.
   * @throws {Error} - Throws an error if unable to update the notifications.
   */
  static async clearUserNotifications(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const updated = await NotificationModel.updateMany(
        { receiver: userId, read: false },
        { read: true }
      );

      return updated.nModified; // return the number of documents modified
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Toggles the read status of a specific notification.
   * @param {string} notificationId - The ID of the notification whose read status should be toggled.
   * @returns {Promise<Object|null>} - A promise that resolves to the updated notification object or null if not found.
   * @throws {Error} - Throws an error if validation fails or unable to update the notification.
   */
  static async toggleReadStatus(notificationId) {
    try {
      if (!notificationId) throw new Error("Notification ID is required");

      const notification = await NotificationModel.findById(notificationId);
      if (!notification) throw new Error("Notification not found");

      notification.read = !notification.read; // toggle the read status
      await notification.save();

      return notification;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = NotificationService;
