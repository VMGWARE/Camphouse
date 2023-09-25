/**
 * @swagger
 * tags:
 *   name: Follows
 *   description: Handle following and unfollowing users, and getting who a user is following
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Follow:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - user_id
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           description: The auto-generated ID of the record.
 *         follower:
 *           type: string
 *           format: ObjectId
 *           description: The ID of the user following another user.
 *         following:
 *           type: string
 *           format: ObjectId
 *           description: The ID of the user being followed.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was last updated.
 */

const express = require("express");
const User = require("../models/User");
const Follow = require("../models/Follow");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/follows:
 *   get:
 *     tags:
 *       - Follows
 *     summary: Retrieve the list of users the authenticated user is following.
 *     description: Fetch the list of users the authenticated user is following.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched followed users.
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
 *                   example: Successfully fetched followed users.
 *                 data:
 *                   type: object
 *                   properties:
 *                     follows:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "64df498da26d3f21289c6042"
 *       500:
 *         description: Error occurred while fetching followed users.
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
 *                   example: An error occurred while fetching followed users.
 *                 data:
 *                   type: null
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    // Find all follows where the follower is the authenticated user
    const userFollows = await Follow.find({ follower: req.user._id }).populate(
      "following",
      "_id"
    );

    // Return an array of user IDs that the authenticated user is following
    res.json({
      status: "success",
      code: 200,
      message: "Successfully fetched followed users.",
      data: {
        follows: userFollows.map((follow) => follow.following._id),
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred while fetching followed users.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/follows/{userId}:
 *   post:
 *     tags:
 *       - Follows
 *     summary: Follow a specific user.
 *     description: Follow a specific user.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to follow
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully followed the user.
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
 *                   example: Successfully followed the user.
 *                 data:
 *                   $ref: '#/components/schemas/Follow'
 *       400:
 *         description: User is already being followed or user not found.
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
 *                   example: User is already being followed.
 *                 data:
 *                   type: null
 *       500:
 *         description: Error occurred while following the user.
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
 *                   example: An error occurred while following the user.
 *                 data:
 *                   type: null
 */
router.post("/:userId", authenticateJWT, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found.",
        data: null,
      });

    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: req.params.userId,
    });
    if (existingFollow)
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "User is already being followed.",
        data: null,
      });

    const follow = new Follow({
      follower: req.user.id,
      following: req.params.userId,
    });
    await follow.save();

    res.json({
      status: "success",
      code: 200,
      message: "Successfully followed the user.",
      data: { follow },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred while following the user.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/follows/{userId}:
 *   delete:
 *     tags:
 *       - Follows
 *     summary: Unfollow a specific user.
 *     description: Unfollow a specific user.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to unfollow
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user.
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
 *                   example: Successfully unfollowed the user.
 *                 data:
 *                   type: null
 *       400:
 *         description: User is not being followed or user not found.
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
 *                   example: User is not being followed.
 *                 data:
 *                   type: null
 *       500:
 *         description: Error occurred while unfollowing the user.
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
 *                   example: An error occurred while unfollowing the user.
 *                 data:
 *                   type: null
 */
router.delete("/:userId", authenticateJWT, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found.",
        data: null,
      });

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.userId,
    });
    if (!existingFollow)
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "User is not being followed.",
        data: null,
      });

    await Follow.findByIdAndDelete(existingFollow._id);
    res.json({
      status: "success",
      code: 200,
      message: "Successfully unfollowed the user.",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred while unfollowing the user.",
      data: null,
    });
  }
});

module.exports = router;
