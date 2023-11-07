/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Manage private communication between users, including sending, reading, and deleting messages.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         sender:
 *           type: string
 *           format: ObjectId
 *           description: ID of the sender
 *         recipient:
 *           type: string
 *           format: ObjectId
 *           description: ID of the recipient
 *         content:
 *           type: string
 *           description: Content of the message
 *         isRead:
 *           type: boolean
 *           description: Flag indicating if the message was read by the recipient
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the message was sent
 *     MessageUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           description: ID of the user
 *         handle:
 *           type: string
 *           description: Handle of the user
 *         username:
 *           type: string
 *           description:
 *         profilePicture:
 *           type: string
 *           description: URL of the user's profile picture
 */

const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");
const AuditLogService = require("../services/AuditLogService");

// Create group
// Invite user to group
// Join group
// Leave group
// Send message to group
// View list of groups user is in

// Open DM with user
// Send message to user
// Delete message from user
// Close DM with user
// View list of DMs user is in (open/close)
module.exports = router;
