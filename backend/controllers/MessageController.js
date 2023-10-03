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

/**
 * @swagger
 * /api/v1/messages/connections:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get all users that have had a conversation with you
 *     description: Get all users that have had a conversation with the logged in user (i.e. the user has sent or received at least one message from the other user)
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Connections retrieved successfully.
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
 *                   example: Connections retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageUser'
 */
router.get("/connections", authenticateJWT, async (req, res) => {
  // Get the logged-in user's ID
  const userId = req.user._id;

  try {
    // Find all unique users that have had a conversation with the current user
    const chatPartners = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender recipient", "_id username handle profilePicture")
      .lean();

    // Extract unique chat partner IDs
    const uniqueChatPartnersIds = [
      ...new Set(
        chatPartners.flatMap((message) => [
          message.sender._id.toString(),
          message.recipient._id.toString(),
        ])
      ),
    ];

    const promises = uniqueChatPartnersIds
      .filter((id) => id !== userId.toString()) // Remove the current user's ID from the list
      .map(async (id) => {
        const foundMessage = chatPartners.find(
          (msg) =>
            msg.sender._id.toString() === id ||
            msg.recipient._id.toString() === id
        );

        const partner =
          foundMessage.sender._id.toString() === id
            ? foundMessage.sender
            : foundMessage.recipient;

        // Find the number of unread messages from this partner to the user
        const unreadCount = await Message.countDocuments({
          sender: id,
          recipient: userId,
          isRead: false,
        });

        return {
          ...partner,
          unreadCount,
        };
      });

    // Resolve all the promises
    const connectionsWithUnreadCount = await Promise.all(promises);

    // Return the list of chat partners with unread message count
    res.json({
      status: "success",
      code: 200,
      message: "Connections retrieved successfully.",
      data: connectionsWithUnreadCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred while fetching connections.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/{userId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get all messages between you and another user
 *     description: Get all messages between the logged in user and another user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the other user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully.
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
 *                   example: Messages retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 5f9d5b9b9d1e8c2d9c6a0b1a
 *                       sender:
 *                         $ref: '#/components/schemas/MessageUser'
 *                       recipient:
 *                         $ref: '#/components/schemas/MessageUser'
 *                       content:
 *                         type: string
 *                         example: Hello world!
 *                       isRead:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         example: 2020-10-30T17:01:23.000Z
 *                       updatedAt:
 *                         type: string
 *                         example: 2020-10-30T17:01:23.000Z
 */
router.get("/:userId", authenticateJWT, async (req, res) => {
  // Get the logged in user's ID
  const userId = req.user._id;

  // Get the other user's ID
  const otherUserId = req.params.userId;

  // Get the messages
  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .populate("sender recipient", "_id username handle profilePicture");

  // Return the messages
  res.json({
    status: "success",
    code: 200,
    message: "Messages retrieved successfully.",
    data: messages,
  });
});

/**
 * @swagger
 * /api/v1/messages/{userId}:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message to another user
 *     description: Send a message to another user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to send the message to
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the message
 *                 example: Hello world!
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Message sent successfully.
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
 *                   example: Message sent successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 */
router.post("/:userId", authenticateJWT, async (req, res) => {
  // Get the logged in user's ID
  const userId = req.user._id;

  // Get the other user's ID
  const otherUserId = req.params.userId;

  // Get the message content
  const content = req.body.content;

  // Create the message
  const message = await Message.create({
    sender: userId,
    recipient: otherUserId,
    content: content,
  });

  // Return the message
  res.json({
    status: "success",
    code: 200,
    message: "Message sent successfully.",
    data: message,
  });

  // Send a notification to the recipient
  NotificationService.create(
    "MESSAGE",
    userId,
    otherUserId,
    message._id,
    "Message",
    "You have a new message from " + req.user.handle + "."
  );
});

/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Mark a specific message as read
 *     description: Mark a specific message as read
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         description: ID of the message to be marked as read
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message updated successfully.
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
 *                   example: Message updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       403:
 *         description: Unauthorized to mark the message as read
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
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You are not authorized to mark this message as read.
 *                 data:
 *                   type: null
 *       404:
 *         description: The requested message could not be found
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
 *                   example: The requested message could not be found.
 *                 data:
 *                   type: null
 */
router.put("/:messageId", authenticateJWT, async (req, res) => {
  // Get the logged in user's ID
  const userId = req.user._id;

  // Get the message
  const message = await Message.findById(req.params.messageId);

  // Make sure the message exists
  if (!message) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "The requested message could not be found.",
      data: null,
    });
  }

  // Make sure the logged in user is the recipient of the message
  if (message.recipient.toString() !== userId.toString()) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message: "You are not authorized to mark this message as read.",
      data: null,
    });
  }

  // Update the message
  message.isRead = true;
  await message.save();

  // Return the updated message
  res.json({
    status: "success",
    code: 200,
    message: "Message updated successfully.",
    data: message,
  });
});

/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Delete a specific message
 *     description: Delete a specific message
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         description: ID of the message to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
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
 *                   example: Message deleted successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       403:
 *         description: Unauthorized to delete the message
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
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You are not authorized to delete this message.
 *                 data:
 *                   type: null
 *       404:
 *         description: The requested message could not be found
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
 *                   example: The requested message could not be found.
 *                 data:
 *                   type: null
 */
router.delete("/:messageId", authenticateJWT, async (req, res) => {
  // Get the logged in user's ID
  const userId = req.user._id;

  // Get the message
  const message = await Message.findById(req.params.messageId);

  // Make sure the message exists
  if (!message) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "The requested message could not be found.",
      data: null,
    });
  }

  // Make sure the logged in user is the sender or recipient of the message
  if (
    message.recipient.toString() !== userId.toString() &&
    message.sender.toString() !== userId.toString()
  ) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message: "You are not authorized to delete this message.",
      data: null,
    });
  }

  // Delete the message
  await Message.deleteOne({ _id: req.params.messageId });

  // Return the deleted message
  res.json({
    status: "success",
    code: 200,
    message: "Message deleted successfully.",
    data: message,
  });
});

module.exports = router;
