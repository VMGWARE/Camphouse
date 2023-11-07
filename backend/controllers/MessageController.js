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
 */

const express = require("express");
const GroupMessage = require("../models/GroupMessage");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

// Require the necessary services/helpers
const NotificationService = require("../services/NotificationService");
const AuditLogService = require("../services/AuditLogService");
const Validator = require("../helpers/Validator");

/**
 * @swagger
 * /api/v1/messages/group:
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
router.post("/group", authenticateJWT, async (req, res) => {
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
