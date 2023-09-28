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

/**
 * @swagger
 * /api/v1/notifications/count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve the number of unread notifications for the authenticated user
 *     description: Retrieve the number of unread notifications for the authenticated user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved notification counts
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
 *                   example: Successfully retrieved notification counts
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadNotifications:
 *                       type: integer
 *                       example: 2
 *                     totalNotifications:
 *                       type: integer
 *                       example: 10
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
router.get("/count", authenticateJWT, async (req, res) => {
  try {
    const unread = await Notification.countDocuments({
      receiver: req.user._id,
      read: false,
    });
    const total = await Notification.countDocuments({
      receiver: req.user._id,
    });

    res.json({
      status: "success",
      code: 200,
      message: "Successfully retrieved notification counts",
      data: { unread, total },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Unable to retrieve notification counts",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark a specific notification as read for the authenticated user
 *     description: Mark a specific notification as read for the authenticated user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Successfully marked notification as read
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
 *                   example: Successfully marked notification as read
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
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
 *       404:
 *         description: Notification not found
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Notification not found
 *                 data:
 *                   type: null
 *       500:
 *         description: Internal Server Error
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
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Unable to mark notification as read
 *                 data:
 *                   type: null
 */
router.patch("/:id", authenticateJWT, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Notification not found",
        data: null,
      });
    }

    res.json({
      status: "success",
      code: 200,
      message: "Successfully marked notification as read",
      data: { notification },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Unable to mark notification as read",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/notifications:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read for the authenticated user
 *     description: Mark all notifications as read for the authenticated user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully marked all notifications as read
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
 *                   example: Successfully marked all notifications as read
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
 *       500:
 *         description: Internal Server Error
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
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Unable to mark all notifications as read
 *                 data:
 *                   type: null
 */
router.patch("/", authenticateJWT, async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      { receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({
      status: "success",
      code: 200,
      message: "Successfully marked all notifications as read",
      data: { notifications },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Unable to mark all notifications as read",
      data: null,
    });
  }
});

module.exports = router;
