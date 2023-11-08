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
 *     GroupMessage:
 *       type: object
 *       required:
 *         - owner
 *         - participants
 *         - groupName
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the group message
 *         owner:
 *           type: string
 *           description: The user ID of the group message owner
 *         participants:
 *           type: array
 *           description: List of user IDs of the group message participants
 *         messages:
 *           type: array
 *           description: List of message IDs of the group messages
 *         groupName:
 *           type: string
 *           description: Name of the group message
 *         createdAt:
 *           type: string
 *           description: The date the group message was created
 *       example:
 *         _id: 5f0aeeb3b5476448b4f0c2b1
 *         owner: 5f0aeeb3b5476448b4f0c2b1
 *         participants: [5f0aeeb3b5476448b4f0c2b1]
 *         messages: [5f0aeeb3b5476448b4f0c2b1]
 *         groupName: My Group
 *         createdAt: 2020-07-12T19:05:07.000Z
 *     Message:
 *       type: object
 *       required:
 *         - sender
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the message
 *         sender:
 *           type: string
 *           description: The user ID of the message sender
 *         content:
 *           type: string
 *           description: Content of the message
 *         readBy:
 *           type: array
 *           description: List of user IDs of the users who have read the message
 *         createdAt:
 *           type: string
 *           description: The date the message was created
 *       example:
 *         _id: 5f0aeeb3b5476448b4f0c2b1
 *         sender: 5f0aeeb3b5476448b4f0c2b1
 *         content: Hello World!
 *         readBy: [5f0aeeb3b5476448b4f0c2b1]
 *         createdAt: 2020-07-12T19:05:07.000Z
 *     DirectMessage:
 *       type: object
 *       required:
 *         - participants
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the direct message
 *         participants:
 *           type: array
 *           description: List of user IDs of the direct message participants
 *         messages:
 *           type: array
 *           description: List of message IDs of the direct messages
 *         isOpen:
 *           type: boolean
 *           description: Whether or not the direct message is open
 *         createdAt:
 *           type: string
 *           description: The date the direct message was created
 *       example:
 *         _id: 5f0aeeb3b5476448b4f0c2b1
 *         participants: [5f0aeeb3b5476448b4f0c2b1]
 *         messages: [5f0aeeb3b5476448b4f0c2b1]
 *         isOpen: true
 *         createdAt: 2020-07-12T19:05:07.000Z
 */

const express = require("express");
const DirectMessage = require("../models/DirectMessage");
const GroupMessage = require("../models/GroupMessage");
const Message = require("../models/Message");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

// Require the necessary services/helpers
const NotificationService = require("../services/NotificationService");
const AuditLogService = require("../services/AuditLogService");
const Validator = require("../helpers/Validator");

/**
 * @swagger
 * /api/v1/messages/groups:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Create a new group
 *     description: Create a new group with the authenticated user as the owner
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Group name
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *                 example: My Group
 *     responses:
 *       200:
 *         description: Successfully created group
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
 *                   example: Successfully created group
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Failed to create group
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to create group
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Name is required.
 *       500:
 *         description: Failed to create group
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
 *                   example: Failed to create group
 *                 data:
 *                   type: null
 *                   example: null
 */
router.post("/groups", authenticateJWT, async (req, res) => {
  try {
    // Check if the req.body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "No data provided.",
        data: null,
      });
    }

    // Define the validation rules
    const rules = {
      name: {
        type: "string",
        required: true,
      },
    };

    // Define the validation messages
    const messages = {
      name: {
        type: "Name must be a string.",
        required: "Name is required.",
      },
    };

    // Validate the request body
    const validator = new Validator(rules, messages);
    if (!validator.validate(req.body)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Failed to create group.",
        data: {
          errors: validator.errors,
        },
      });
    }

    // Create the group
    const group = await GroupMessage.create({
      owner: req.user._id,
      participants: [req.user._id],
      groupName: req.body.name,
    });

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "GROUP_CREATED",
      req.ipAddress,
      null,
      group
    );

    // Return the group
    res.json({
      status: "success",
      code: 200,
      message: "Successfully created group.",
      data: {
        group,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to create group.",
      data: null,
    });
  }
});

// TODO: Delete group

/**
 * @swagger
 * /api/v1/messages/groups/{id}/invite:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Invite a user to a group
 *     description: Invite a user to a group
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to invite user to
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     requestBody:
 *       description: User ID of the user to invite to the group
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID of the user to invite to the group
 *                 example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully invited user to group
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
 *                   example: Successfully invited user to group
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Failed to invite user to group
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to invite user to group
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: User ID is required.
 *       500:
 *         description: Failed to invite user to group
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
 *                   example: Failed to invite user to group
 *                 data:
 *                   type: null
 *                   example: null
 */
router.post("/groups/:id/invite", authenticateJWT, async (req, res) => {
  try {
    // Check if the req.body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "No data provided.",
        data: null,
      });
    }

    // Define the validation rules
    const rules = {
      userId: {
        type: "string",
        required: true,
      },
    };

    // Define the validation messages
    const messages = {
      userId: {
        type: "User ID must be a string.",
        required: "User ID is required.",
      },
    };

    // Validate the request body
    const validator = new Validator(rules, messages);
    if (!validator.validate(req.body)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Failed to invite user to group.",
        data: {
          errors: validator.errors,
        },
      });
    }

    // Find the group
    const group = await GroupMessage.findById(req.params.id);

    // Check if the group exists
    if (!group) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Group does not exist.",
        data: null,
      });
    }

    // Check if the authenticated user is the owner of the group
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You are not the owner of this group.",
        data: null,
      });
    }

    // Check if the user is already in the group
    if (group.participants.includes(req.body.userId)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "User is already in the group.",
        data: null,
      });
    }

    // Add the user to the group
    group.participants.push(req.body.userId);

    // Save the group
    await group.save();

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "USER_INVITED_TO_GROUP",
      req.ipAddress,
      null,
      group
    );

    // Return the group
    res.json({
      status: "success",
      code: 200,
      message: "Successfully invited user to group.",
      data: {
        group,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to invite user to group.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/groups/{id}/join:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Join a group
 *     description: Join a group
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to join
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully joined group
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
 *                   example: Successfully joined group
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Failed to join group
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to join group
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: Invalid ID.
 *       500:
 *         description: Failed to join group
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
 *                   example: Failed to join group
 *                 data:
 *                   type: null
 *                   example: null
 */
router.post("/groups/:id/join", authenticateJWT, async (req, res) => {
  try {
    // Find the group
    const group = await GroupMessage.findById(req.params.id);

    // Check if the group exists
    if (!group) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Group does not exist.",
        data: null,
      });
    }

    // Check if the user is already in the group
    if (group.participants.includes(req.user._id)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You are already in the group.",
        data: null,
      });
    }

    // Check if the group is private, if so, check if the user has been invited
    if (group.settings.isPrivate) {
      // Check if the user has been invited
      const invited = group.invites.find(
        (invite) => invite.user.toString() === req.user._id.toString()
      );

      // Check if the user has been invited
      if (!invited) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "You have not been invited to this group.",
          data: null,
        });
      }
    }

    // Add the user to the group
    group.participants.push(req.user._id);

    // Save the group
    await group.save();

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "USER_JOINED_GROUP",
      req.ipAddress,
      null,
      group
    );

    // Return the group
    res.json({
      status: "success",
      code: 200,
      message: "Successfully joined group.",
      data: {
        group,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to join group.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/groups/{id}/leave:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Leave a group
 *     description: Leave a group
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to leave
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully left group
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
 *                   example: Successfully left group
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Failed to leave group
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to leave group
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: Invalid ID.
 *       500:
 *         description: Failed to leave group
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
 *                   example: Failed to leave group
 *                 data:
 *                   type: null
 *                   example: null
 */
router.delete("/groups/:id/leave", authenticateJWT, async (req, res) => {
  try {
    // Find the group
    const group = await GroupMessage.findById(req.params.id);

    // Check if the group exists
    if (!group) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Group does not exist.",
        data: null,
      });
    }

    // Check if the user is the owner of the group
    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You are the owner of this group.",
        data: null,
      });
    }

    // Check if the user is in the group
    if (!group.participants.includes(req.user._id)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You are not in this group.",
        data: null,
      });
    }

    // Remove the user from the group
    group.participants = group.participants.filter(
      (participant) => participant.toString() !== req.user._id.toString()
    );

    // Save the group
    await group.save();

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "USER_LEFT_GROUP",
      req.ipAddress,
      null,
      group
    );

    // Return the group
    res.json({
      status: "success",
      code: 200,
      message: "Successfully left group.",
      data: {
        group,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to leave group.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/groups/{id}/messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message to a group
 *     description: Send a message to a group
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to send a message to
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     requestBody:
 *       description: Message content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the message
 *                 example: Hello World!
 *     responses:
 *       200:
 *         description: Successfully sent message to group
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
 *                   example: Successfully sent message to group
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Failed to send message to group
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to send message to group
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         content:
 *                           type: string
 *                           example: Content is required.
 *       500:
 *         description: Failed to send message to group
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
 *                   example: Failed to send message to group
 *                 data:
 *                   type: null
 *                   example: null
 */
router.post("/groups/:id/messages", authenticateJWT, async (req, res) => {
  try {
    // Check if the req.body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "No data provided.",
        data: null,
      });
    }

    // Define the validation rules
    const rules = {
      content: {
        type: "string",
        required: true,
      },
    };

    // Define the validation messages
    const messages = {
      content: {
        type: "Content must be a string.",
        required: "Content is required.",
      },
    };

    // Validate the request body
    const validator = new Validator(rules, messages);
    if (!validator.validate(req.body)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Failed to send message to group.",
        data: {
          errors: validator.errors,
        },
      });
    }

    // Find the group
    const group = await GroupMessage.findById(req.params.id);

    // Check if the group exists
    if (!group) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Group does not exist.",
        data: null,
      });
    }

    // Check if the user is in the group
    if (!group.participants.includes(req.user._id)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You are not in this group.",
        data: null,
      });
    }

    // Create the message
    const message = await Message.create({
      sender: req.user._id,
      content: req.body.content,
    });

    // Add the message to the group
    group.messages.push(message._id);

    // Save the group
    await group.save();

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "MESSAGE_SENT_TO_GROUP",
      req.ipAddress,
      null,
      message
    );

    // Return the message
    res.json({
      status: "success",
      code: 200,
      message: "Successfully sent message to group.",
      data: {
        message,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to send message to group.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/groups/{id}/messages/{messageId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Delete a message from a group
 *     description: Delete a message from a group
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the group to delete a message from
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *       - name: messageId
 *         in: path
 *         required: true
 *         description: ID of the message to delete from the group
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully deleted message from group
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
 *                   example: Successfully deleted message from group
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Failed to delete message from group
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to delete message from group
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: Invalid ID.
 *       500:
 *         description: Failed to delete message from group
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
 *                   example: Failed to delete message from group
 *                 data:
 *                   type: null
 *                   example: null
 */
router.delete(
  "/groups/:id/messages/:messageId",
  authenticateJWT,
  async (req, res) => {
    try {
      // Find the group
      const group = await GroupMessage.findById(req.params.id);

      // Check if the group exists
      if (!group) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Group does not exist.",
          data: null,
        });
      }

      // Check if the user is in the group
      if (!group.participants.includes(req.user._id)) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "You are not in this group.",
          data: null,
        });
      }

      // Find the message
      const message = await Message.findById(req.params.messageId);

      // Check if the message exists
      if (!message) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Message does not exist.",
          data: null,
        });
      }

      // Check if the message is in the group
      if (!group.messages.includes(message._id)) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Message is not in this group.",
          data: null,
        });
      }

      // Check if the user is the sender of the message
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "You are not the sender of this message.",
          data: null,
        });
      }

      // Remove the message from the group
      group.messages = group.messages.filter(
        (message) => message.toString() !== req.params.messageId.toString()
      );

      // Save the group
      await group.save();

      // Delete the message
      await message.delete();

      // Create an audit log
      await AuditLogService.log(
        req.user._id,
        "MESSAGE_DELETED_FROM_GROUP",
        req.ipAddress,
        null,
        message
      );

      // Return the group
      res.json({
        status: "success",
        code: 200,
        message: "Successfully deleted message from group.",
        data: {
          group,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        code: 500,
        message: "Failed to delete message from group.",
        data: null,
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/messages/groups:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get groups
 *     description: Get groups the authenticated user is in
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved groups
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
 *                   example: Successfully retrieved groups
 *                 data:
 *                   type: object
 *                   properties:
 *                     groups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Failed to retrieve groups
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve groups
 *                 data:
 *                   type: null
 *                   example: null
 *       500:
 *         description: Failed to retrieve groups
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
 *                   example: Failed to retrieve groups
 *                 data:
 *                   type: null
 *                   example: null
 */
router.get("/groups", authenticateJWT, async (req, res) => {
  try {
    // Find the groups
    const groups = await GroupMessage.find({
      participants: req.user._id,
    });

    // Return the groups
    res.json({
      status: "success",
      code: 200,
      message: "Successfully retrieved groups.",
      data: {
        groups,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to retrieve groups.",
      data: null,
    });
  }
});

// Create DM with user
// Creating a DM allows the user to send messages to the other user
/**
 * @swagger
 * /api/v1/messages/direct-messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Create a DM with a user
 *     description: Create a DM with a user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: User ID of the user to create a DM with
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID of the user to create a DM with
 *                 example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully created DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: success
 *                 code:
 *                    type: integer
 *                    example: 200
 *                 message:
 *                    type: string
 *                    example: Successfully created DM with user
 *                 data:
 *                    type: object
 *                    properties:
 *                      dm:
 *                        type: object
 *                        $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Failed to create DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: integer
 *                    example: 400
 *                 message:
 *                    type: string
 *                    example: Failed to create DM with user
 *                 data:
 *                    type: object
 *                    properties:
 *                      errors:
 *                        type: object
 *                        properties:
 *                          userId:
 *                            type: string
 *                            example: User ID is required.
 *       500:
 *         description: Failed to create DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: integer
 *                    example: 500
 *                 message:
 *                    type: string
 *                    example: Failed to create DM with user
 *                 data:
 *                    type: null
 *                    example: null
 */
router.post("/direct-messages", authenticateJWT, async (req, res) => {
  try {
    // Check if the req.body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "No data provided.",
        data: null,
      });
    }

    // Define the validation rules
    const rules = {
      userId: {
        type: "string",
        required: true,
      },
    };

    // Define the validation messages
    const messages = {
      userId: {
        type: "User ID must be a string.",
        required: "User ID is required.",
      },
    };

    // Validate the request body
    const validator = new Validator(rules, messages);
    if (!validator.validate(req.body)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Failed to create DM with user.",
        data: {
          errors: validator.errors,
        },
      });
    }

    // Find the user
    const user = await User.findById(req.body.userId);

    // Check if the user exists
    if (!user) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "User does not exist.",
        data: null,
      });
    }

    // Check if the user is trying to DM themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You cannot DM yourself.",
        data: null,
      });
    }

    // Find the DM
    const dm = await DirectMessage.findOne({
      participants: {
        $all: [req.user._id, req.body.userId],
      },
    });

    // Check if the DM already exists
    if (dm) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "DM already exists.",
        data: null,
      });
    }

    // Create the DM
    const createdDm = await DirectMessage.create({
      participants: [req.user._id, req.body.userId],
    });

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "DM_CREATED",
      req.ipAddress,
      null,
      createdDm
    );

    // Return the DM
    res.json({
      status: "success",
      code: 200,
      message: "Successfully created DM with user.",
      data: {
        dm: createdDm,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to create DM with user.",
      data: null,
    });
  }
});

// Open DM with user
// Opening a DM means that the user will receive notifications for the DM
/**
 * @swagger
 * /api/v1/messages/direct-messages/{id}/open:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Open a DM with a user
 *     description: Open a DM with a user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to open a DM with
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully opened DM with user
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
 *                   example: Successfully opened DM with user
 *                 data:
 *                   type: object
 *                   properties:
 *                     dm:
 *                       type: object
 *                       $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Failed to open DM with user
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to open DM with user
 *                 data:
 *                   type: null
 *                   example: null
 *       500:
 *         description: Failed to open DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: integer
 *                    example: 500
 *                 message:
 *                    type: string
 *                    example: Failed to open DM with user
 *                 data:
 *                    type: null
 *                    example: null
 */
router.post("/direct-messages/:id/open", authenticateJWT, async (req, res) => {
  try {
    // Find the DM
    const dm = await DirectMessage.findOne({
      participants: {
        $all: [req.user._id, req.params.id],
      },
    });

    // Check if the DM exists
    if (!dm) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "DM does not exist.",
        data: null,
      });
    }

    // Check if the DM is already open
    if (dm.isOpen) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "DM is already open.",
        data: null,
      });
    }

    // Open the DM
    dm.isOpen = true;

    // Save the DM
    await dm.save();

    // Create an audit log
    await AuditLogService.log(
      req.user._id,
      "DM_OPENED",
      req.ipAddress,
      null,
      dm
    );

    // Return the DM
    res.json({
      status: "success",
      code: 200,
      message: "Successfully opened DM.",
      data: {
        dm,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to open DM.",
      data: null,
    });
  }
});

// Close DM with user
// Closing a DM means that the user will no longer receive notifications for the DM, but the DM will still exist
/**
 * @swagger
 * /api/v1/messages/direct-messages/{id}/close:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Close a DM with a user
 *     description: Close a DM with a user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to close a DM with
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     responses:
 *       200:
 *         description: Successfully closed DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: success
 *                 code:
 *                    type: integer
 *                    example: 200
 *                 message:
 *                    type: string
 *                    example: Successfully closed DM with user
 *                 data:
 *                    type: object
 *                    properties:
 *                      dm:
 *                        type: object
 *                        $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Failed to close DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: integer
 *                    example: 400
 *                 message:
 *                    type: string
 *                    example: Failed to close DM with user
 *                 data:
 *                    type: null
 *                    example: null
 *       500:
 *         description: Failed to close DM with user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: integer
 *                    example: 500
 *                 message:
 *                    type: string
 *                    example: Failed to close DM with user
 *                 data:
 *                    type: null
 *                    example: null
 */
router.delete(
  "/direct-messages/:id/close",
  authenticateJWT,
  async (req, res) => {
    try {
      // Find the DM
      const dm = await DirectMessage.findOne({
        participants: {
          $all: [req.user._id, req.params.id],
        },
      });

      // Check if the DM exists
      if (!dm) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "DM does not exist.",
          data: null,
        });
      }

      // Check if the DM is already closed
      if (!dm.isOpen) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "DM is already closed.",
          data: null,
        });
      }

      // Close the DM
      dm.isOpen = false;

      // Save the DM
      await dm.save();

      // Create an audit log
      await AuditLogService.log(
        req.user._id,
        "DM_CLOSED",
        req.ipAddress,
        null,
        dm
      );

      // Return the DM
      res.json({
        status: "success",
        code: 200,
        message: "Successfully closed DM.",
        data: {
          dm,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        code: 500,
        message: "Failed to close DM.",
        data: null,
      });
    }
  }
);

// Send message to user
/**
 * @swagger
 * /api/v1/messages/direct-messages/{id}/messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message to a user
 *     description: Send a message to a user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to send a message to
 *         type: string
 *         example: 5f0aeeb3b5476448b4f0c2b1
 *     requestBody:
 *       description: Message content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the message
 *                 example: Hello World!
 *     responses:
 *       200:
 *         description: Successfully sent message to user
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
 *                   example: Successfully sent message to user
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Failed to send message to user
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to send message to user
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         content:
 *                           type: string
 *                           example: Content is required.
 *       500:
 *         description: Failed to send message to user
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
 *                   example: Failed to send message to user
 *                 data:
 *                   type: null
 *                   example: null
 */
router.post(
  "/direct-messages/:id/messages",
  authenticateJWT,
  async (req, res) => {
    try {
      // Check if the req.body is empty
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "No data provided.",
          data: null,
        });
      }

      // Define the validation rules
      const rules = {
        content: {
          type: "string",
          required: true,
        },
      };

      // Define the validation messages
      const messages = {
        content: {
          type: "Content must be a string.",
          required: "Content is required.",
        },
      };

      // Validate the request body
      const validator = new Validator(rules, messages);
      if (!validator.validate(req.body)) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Failed to send message to user.",
          data: {
            errors: validator.errors,
          },
        });
      }

      // Find the DM
      const dm = await DirectMessage.findOne({
        participants: {
          $all: [req.user._id, req.params.id],
        },
      });

      // Check if the DM exists
      if (!dm) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "DM does not exist.",
          data: null,
        });
      }

      // Create the message
      const message = await Message.create({
        sender: req.user._id,
        content: req.body.content,
      });

      // Add the message to the DM
      dm.messages.push(message._id);

      // Save the DM
      await dm.save();

      // Create an audit log
      await AuditLogService.log(
        req.user._id,
        "MESSAGE_SENT_TO_DM",
        req.ipAddress,
        null,
        message
      );

      // Return the message
      res.json({
        status: "success",
        code: 200,
        message: "Successfully sent message to user.",
        data: {
          message,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        code: 500,
        message: "Failed to send message to user.",
        data: null,
      });
    }
  }
);

// View list of DMs user is in (open/close)
/**
 * @swagger
 * /api/v1/messages/direct-messages:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get DMs
 *     description: Get DMs the authenticated user is in
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved DMs
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
 *                   example: Successfully retrieved DMs
 *                 data:
 *                   type: object
 *                   properties:
 *                     dms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Failed to retrieve DMs
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve DMs
 *                 data:
 *                   type: null
 *                   example: null
 *       500:
 *         description: Failed to retrieve DMs
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
 *                   example: Failed to retrieve DMs
 *                 data:
 *                   type: null
 *                   example: null
 */
router.get("/direct-messages", authenticateJWT, async (req, res) => {
  try {
    // Find the DMs
    const dms = await DirectMessage.find({
      participants: req.user._id,
    });

    // Return the DMs
    res.json({
      status: "success",
      code: 200,
      message: "Successfully retrieved DMs.",
      data: {
        dms,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      code: 500,
      message: "Failed to retrieve DMs.",
      data: null,
    });
  }
});

module.exports = router;
