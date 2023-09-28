const express = require("express");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Post = require("../models/Post");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Handling user notifications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the notification
 *           example: 60a3d9f39c1e4a002cb5f16a
 *         type:
 *           type: string
 *           description: The type of the notification
 *           enum:
 *             - MESSAGE
 *             - LIKE
 *             - COMMENT
 *           example: LIKE
 *         sender:
 *           type: string
 *           description: The ID of the user who triggered the notification
 *           example: 60a3d9f39c1e4a002cb5f16b
 *         receiver:
 *           type: string
 *           description: The ID of the user who is receiving the notification
 *           example: 60a3d9f39c1e4a002cb5f16c
 *         referenceId:
 *           type: string
 *           description: The ID of the reference entity (either a post or a message)
 *           example: 60a3d9f39c1e4a002cb5f16d
 *         onModel:
 *           type: string
 *           description: The model that the reference ID is pointing to (either Post or Message)
 *           enum:
 *             - Post
 *             - Message
 *           example: Post
 *         message:
 *           type: string
 *           description: The message content of the notification
 *           example: "Your post received a new like"
 *         read:
 *           type: boolean
 *           description: Indicates whether the notification has been read
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the notification was created
 *           example: "2023-05-18T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the notification was last updated
 *           example: "2023-05-19T10:00:00Z"
 *       required:
 *         - type
 *         - sender
 *         - receiver
 *         - referenceId
 *         - onModel
 *         - message
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve all notifications for the authenticated user
 *     description: Retrieve all notifications for the authenticated user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number to retrieve
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: The number of notifications per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: isRead
 *         in: query
 *         description: Filter notifications by read status (0 = all, 1 = read, 2 = unread)
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully retrieved notifications
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *                 data:
 *                   type: null
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isRead = req.query.isRead || "0";

    let readFilter = {};
    if (isRead === "1") {
      readFilter.read = true;
    } else if (isRead === "2") {
      readFilter.read = false;
    }

    const notifications = await Notification.find({
      receiver: req.user._id,
      ...readFilter,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      status: "success",
      code: 200,
      message: "Successfully retrieved notifications",
      data: { notifications },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Unable to retrieve notifications",
      data: null,
    });
  }
});

module.exports = router;
