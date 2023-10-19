/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Handle user interactions with posts, including liking and unliking content.
 */

const express = require("express");
const Post = require("../models/Post");
const Like = require("../models/Like");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");
const AuditLogService = require("../services/AuditLogService");

/**
 * @swagger
 * /api/v1/likes/{postId}:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Retrieve the number of likes for a specific post
 *     description: Retrieve the number of likes for a specific post
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post to get the likes for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved likes
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
 *                   example: Successfully retrieved likes
 *                 data:
 *                   type: object
 *                   properties:
 *                     likes:
 *                       type: integer
 */
router.get("/:postId", async (req, res) => {
  // Get the number of likes for the post
  const likes = await Like.find({ post: req.params.postId });

  // Return the number of likes
  res.json({
    status: "success",
    code: 200,
    message: "Successfully retrieved likes",
    data: {
      likes: likes.length,
    },
  });
});

/**
 * @swagger
 * /api/v1/likes/{postId}:
 *   post:
 *     tags:
 *       - Likes
 *     summary: Like a specific post
 *     description: Like a specific post
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post to like
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully liked post
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
 *                   example: Successfully liked post
 *                 data:
 *                   type: object
 *                   properties:
 *                     likes:
 *                       type: integer
 *       400:
 *         description: User has already liked this post
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
 *                   example: You have already liked this post
 *                 data:
 *                   type: null
 */
router.post("/:postId", authenticateJWT, async (req, res) => {
  // Get the user
  const user = req.user;

  // Get the post
  const post = await Post.findById(req.params.postId);

  // Check if the user has already liked the post
  const like = await Like.findOne({ user: user._id, post: post._id });

  // If the user has already liked the post
  if (like) {
    // Return an error
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "You have already liked this post.",
      data: null,
    });
  }

  // Create the like
  const newLike = new Like({
    user: user._id,
    post: post._id,
  });

  // Save the like
  await newLike.save();

  // Return the number of likes
  res.json({
    status: "success",
    code: 200,
    message: "Successfully liked post",
    data: {
      likes: (await Like.find({ post: post._id })).length,
    },
  });

  // Send a notification to the recipient
  if (req.user._id.toString() != post.user.toString()) {
    await NotificationService.create(
      "LIKE",
      user._id,
      post.user,
      post._id,
      "Post",
      `${user.handle} liked your post "${post.title}"`
    );
  }

  // Log the action
  await AuditLogService.log(req.user._id, "LIKE_CREATED", req.ipAddress);
});

/**
 * @swagger
 * /api/v1/likes/{postId}:
 *   delete:
 *     tags:
 *       - Likes
 *     summary: Unlike a specific post
 *     description: Unlike a specific post
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post to unlike
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unliked post
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
 *                   example: Successfully unliked post
 *                 data:
 *                   type: object
 *                   properties:
 *                     likes:
 *                       type: integer
 *       400:
 *         description: User has not liked this post
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
 *                   example: You have not liked this post
 *                 data:
 *                   type: null
 */
router.delete("/:postId", authenticateJWT, async (req, res) => {
  // Get the user
  const user = req.user;

  // Get the post
  const post = await Post.findById(req.params.postId);

  // Check if the user has already liked the post
  const like = await Like.findOne({ user: user._id, post: post._id });

  // If the user has not already liked the post
  if (!like) {
    // Return an error
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "You have not liked this post.",
      data: null,
    });
  }

  // Delete the like
  await Like.deleteOne({ user: user._id, post: post._id });

  // Return the number of likes
  res.json({
    status: "success",
    code: 200,
    message: "Successfully unliked post",
    data: {
      likes: (await Like.find({ post: post._id })).length,
    },
  });

  // Log the action
  await AuditLogService.log(req.user._id, "LIKE_DELETED", req.ipAddress);
});

module.exports = router;
