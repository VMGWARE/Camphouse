/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manage user profiles, including retrieval of profile details and follower count.
 */

const express = require("express");
const User = require("../models/User");
const Follow = require("../models/Follow");
const router = express.Router();

// Load environment variables
require("dotenv").config();

// Middleware
const { authenticateJWT, isAdmin, loadUser } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/users/{userRef}/verify:
 *   get:
 *     summary: Verify User's Status
 *     description: |
 *       This endpoint is used to verify a user's status based on a given user reference.
 *       The user reference can either be a user handle or a unique identifier.
 *       The endpoint will update the user's verification status according to the
 *       `verified` query parameter.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userRef
 *         in: path
 *         description: The handle or unique ID of the user to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *       - name: verified
 *         in: query
 *         description: The verified status to update the user to.
 *         required: true
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: User's verification status successfully updated.
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
 *                   example: User's verification status has been successfully updated.
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User with provided reference not found.
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
 *                   example: User with the provided reference was not found.
 *                 data:
 *                   type: null
 */
router.get("/:userRef/verify", authenticateJWT, isAdmin, async (req, res) => {
  // Define variables
  const userRef = req.params.userRef;
  const verified = req.query.verified;
  var user;

  // Check if the userRef is a valid ObjectId
  if (!userRef.match(/^[0-9a-fA-F]{24}$/)) {
    // If not, Get the user
    user = await User.findOne({ handle: req.params.userRef });
  } else {
    user = await User.findById(userRef);
  }

  // If the user doesn't exist, return an error
  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User with the provided reference was not found.",
      data: null,
    });
  }

  // Update the user's verified status
  user.verified = verified;

  // Save the user
  await user.save();

  // Remove the "password", "email", and "__v" fields from the user object
  user = {
    ...user.toObject(),
    password: undefined,
    email: undefined,
    __v: undefined,
  };

  // Return the user
  res.json({
    status: "success",
    code: 200,
    message: "User's verification status has been successfully updated.",
    data: user,
  });
});

/**
 * @swagger
 * /api/v1/users/{userRef}:
 *   get:
 *     summary: Retrieve a user by their handle or id.
 *     description: Fetches user profile details including the count of followers.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userRef
 *         in: path
 *         description: The handle or id of the user to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile details successfully retrieved.
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
 *                   example: User found
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
 */
router.get("/:userRef", async (req, res) => {
  // Define variables
  const userRef = req.params.userRef;
  var user;

  // Check if the userRef is a valid ObjectId
  if (!userRef.match(/^[0-9a-fA-F]{24}$/)) {
    // If not, Get the user
    user = await User.findOne({ handle: req.params.userRef });
  } else {
    user = await User.findById(userRef);
  }

  // If the user doesn't exist, return an error
  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User not found",
      data: null,
    });
  }

  // Reassign the user object to a new object so we can add more fields
  var enrichedUser = user.toObject();

  // Get the number of followers
  const followers = await Follow.find({ following: enrichedUser._id });
  enrichedUser.followers = followers.length;
  // Remove the "password" field from the enrichedUser object
  enrichedUser = {
    ...enrichedUser,
    password: undefined,
    email: undefined,
    __v: undefined,
  };

  // Return the user
  res.json({
    status: "success",
    code: 200,
    message: "User found",
    data: enrichedUser,
  });
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve a list of all users.
 *     description: Fetches a list of all user profiles excluding sensitive information like passwords and emails.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of users to return per page.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         description: Search query to filter users by handle.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users successfully retrieved.
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
 *                   example: Users found
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserProfile'
 *                     page:
 *                       type: integer
 *                     maxPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
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
 *                   example: Server error
 *                 data:
 *                   type: null
 */
router.get("/", loadUser, async (req, res) => {
  // Page number
  const page = parseInt(req.query.page) || 1;

  // Number of posts per page
  const limit = parseInt(req.query.limit) || 10;

  // Search query
  const search = req.query.search || "";

  // HideEmail
  var hideEmail = "-email";
  if (req.user && req.user.admin) {
    hideEmail = "";
  }

  const criteria = { handle: { $regex: search, $options: "i" } };

  // Sort by
  const users = await User.find(criteria)
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(`-password -__v ${hideEmail}`);

  // Return the users
  res.json({
    status: "success",
    code: 200,
    message: "Users found",
    data: {
      users: users,
      page: page,
      maxPages: Math.ceil((await User.countDocuments(criteria)) / limit),
      limit: limit,
    },
  });
});

module.exports = router;
