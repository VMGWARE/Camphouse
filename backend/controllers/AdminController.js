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
 *                   $ref: '#/components/schemas/UserProfile'
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
