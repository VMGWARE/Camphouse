/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operations related to creating, fetching, updating, and deleting data as an admin
 */

// Require the necessary packages
const express = require("express");
const router = express.Router();

// Require the necessary models
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Message = require("../models/Message");
const Report = require("../models/Report");

// Middleware
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");

// TODO: User: CRUD

// Read (GET) - Fetch a specific user by ID
/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Retrieve a user by ID as an admin
 *     tags:
 *       - Admin
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully.
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
 *                   example: User fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5f1f2d5a1f2d5a1f2d5a1f2d
 *                     handle:
 *                       type: string
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       example: john@doe.com
 *                     username:
 *                       type: string
 *                       example: John Doe
 *                     profilePicture:
 *                       type: string
 *                       example: https://camphouse.vmgware.dev/images/profiles/ProfilePicture.png
 *                     bio:
 *                       type: string
 *                       example: I'm John Doe
 *                     verified:
 *                       type: boolean
 *                       example: false
 *                     admin:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       example: 2020-07-27T00:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2020-07-27T00:00:00.000Z
 *       400:
 *         description: Invalid user ID.
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
 *                   example: Invalid user ID
 *                 data:
 *                   type: null
 *       404:
 *         description: User not found.
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
 *                   example: User not found
 *                 data:
 *                   type: null
 *       500:
 *         description: Server error.
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
 *                   example: Something went wrong
 *                 data:
 *                   type: null
 */
router.get("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // If the ID is invalid, return an error
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        status: "error",
        message: "Invalid user ID",
        code: 400,
        data: null,
      });
    }

    // Fetch the user by ID
    const user = await User.findById(req.params.id).select("-password -__v");

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        data: null,
      });
    }

    // Return the user
    res.json({
      status: "success",
      message: "User fetched successfully",
      code: 200,
      data: user,
    });
  } catch (error) {
    // Return an error
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      code: 500,
      data: null,
    });
  }
});

// TODO: Post: RD
// TODO: Comment: RD
// TODO: Message: RD

// Return router
module.exports = router;
