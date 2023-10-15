/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Operations related to creating, fetching, updating, and deleting comments.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - user
 *         - post
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         user:
 *           type: object
 *           description: The user who created the comment
 *           properties:
 *             username:
 *               type: string
 *               description: The username of the user
 *             handle:
 *               type: string
 *               description: The handle of the user
 *             profilePicture:
 *               type: string
 *               description: The profile picture of the user
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The date when the user was created
 *         post:
 *           type: string
 *           format: ObjectId
 *           description: Reference to the post the comment is associated with
 *         comment:
 *           type: string
 *           description: The comment text
 *           minLength: 3
 *           maxLength: 255
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the comment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the comment was last updated
 *     ObjectId:
 *       type: string
 *       pattern: '^[0-9a-fA-F]{24}$'
 *       description: A string of 24 hexadecimal characters which represents a MongoDB ObjectId
 */

const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const router = express.Router();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");

/**
 * @swagger
 * /api/v1/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments
 *     description: Retrieve comments
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: The page number to retrieve
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: The number of comments per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         description: Search query for comments
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
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
 *                   example: Successfully retrieved comments
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     maxPages:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       500:
 *         description: An error occurred while retrieving comments
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
 *                   example: An error occurred while retrieving comments
 *                 data:
 *                   type: null
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    // Page number
    const page = parseInt(req.query.page) || 1;

    // Number of posts per page
    const limit = parseInt(req.query.limit) || 10;

    // Search query
    const search = req.query.search || "";

    // create an object to hold the search criteria
    let criteria = {
      $or: [{ comment: { $regex: search, $options: "i" } }],
    };

    // Get the comments
    const comments = await Comment.find(criteria)
      .populate("user", "username handle createdAt profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Return the comments
    res.json({
      status: "success",
      code: 200,
      message: "Successfully retrieved comments.",
      data: {
        comments: comments,
        page: page,
        maxPages: Math.ceil((await Comment.countDocuments(criteria)) / limit),
        limit: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      code: 500,
      message: "An error occurred while retrieving comments.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/comments/post/{postId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments for a post
 *     description: Retrieve comments for a post
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
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
 *                   example: Successfully retrieved comments
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       500:
 *         description: An error occurred while retrieving comments
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
 *                   example: An error occurred while retrieving comments
 *                 data:
 *                   type: null
 */
router.get("/post/:postId", authenticateJWT, async (req, res) => {
  try {
    // Get the comments for the post
    const comments = await Comment.find({
      post: req.params.postId,
    }).populate("user", "username handle createdAt profilePicture");

    // Return the comments
    res.json({
      status: "success",
      code: 200,
      message: "Successfully retrieved comments.",
      data: comments,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      code: 500,
      message: "An error occurred while retrieving comments.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/comments/post/{postId}:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment for a post
 *     description: Create a comment for a post
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Comment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created comment
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
 *                   example: Successfully created comment
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Comment validation failed
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
 *                   example: Comment validation failed
 *                 data:
 *                   type: null
 *       500:
 *         description: An error occurred while creating the comment
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
 *                   example: An error occurred while creating the comment
 *                 data:
 *                   type: null
 */
router.post("/post/:postId", authenticateJWT, async (req, res) => {
  // Params
  const post = req.params.postId;
  const { comment } = req.body;

  // Verify post exists
  const postExists = await Post.exists({ _id: post });
  if (!postExists) {
    return res.json({
      status: "error",
      code: 400,
      message: "Post does not exist.",
      data: null,
    });
  }

  // Get the id of the post owner
  const postOwner = await Post.findById(post, "user");

  // Validate comment
  if (!comment) {
    return res.json({
      status: "error",
      code: 400,
      message: "Comment is required.",
      data: null,
    });
  } else if (comment.length < 3 || comment.length > 255) {
    return res.json({
      status: "error",
      code: 400,
      message: "Comment must be between 3 and 255 characters.",
      data: null,
    });
  }

  // Create the comment
  try {
    const newComment = await Comment.create({
      user: req.user._id,
      post,
      comment,
    });

    // Return the comment
    res.json({
      status: "success",
      code: 200,
      message: "Successfully created comment.",
      data: newComment,
    });

    // Send a notification to the recipient
    if (req.user._id.toString() != postOwner.user.toString()) {
      await NotificationService.create(
        "COMMENT", // type
        req.user._id, // sender
        postOwner.user, // receiver
        post, // onModelId
        "Post", // onModel
        `${req.user.handle} commented on your post.` // message
      );
    }
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      code: 500,
      message: "An error occurred while creating the comment.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/comments/{commentId}:
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Edit a comment
 *     description: Edit a specific comment by providing new values for one or more fields of the comment
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: ID of the comment to edit
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *     requestBody:
 *       description: Comment details to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The updated comment text
 *     responses:
 *       200:
 *         description: Successfully updated comment
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
 *                   example: Successfully updated comment
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Comment does not exist or invalid comment provided
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
 *                   example: Comment does not exist or invalid comment provided
 *                 data:
 *                   type: null
 *       500:
 *         description: An error occurred while updating the comment
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
 *                   example: An error occurred while updating the comment
 *                 data:
 *                   type: null
 */
router.patch("/:commentId", authenticateJWT, async (req, res) => {
  // Params
  const commentId = req.params.commentId;
  const { comment } = req.body;

  // Verify comment exists
  const commentExists = await Comment.exists({
    _id: commentId,
    user: req.user._id,
  });
  if (!commentExists) {
    return res.json({
      status: "error",
      code: 400,
      message:
        "Comment does not exist or you do not have permission to update it.",
      data: null,
    });
  }

  // Validate comment
  if (!comment) {
    return res.json({
      status: "error",
      code: 400,
      message: "Comment is required.",
      data: null,
    });
  } else if (comment.length < 3 || comment.length > 255) {
    return res.json({
      status: "error",
      code: 400,
      message: "Comment must be between 3 and 255 characters.",
      data: null,
    });
  }

  // Update the comment
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { comment },
      { new: true } // This option ensures that the response contains the updated data
    );

    // Return the updated comment
    res.json({
      status: "success",
      code: 200,
      message: "Successfully updated comment.",
      data: updatedComment,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      code: 500,
      message: "An error occurred while updating the comment.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Delete a specific comment
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: ID of the comment to delete
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *     responses:
 *       200:
 *         description: Successfully deleted comment
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
 *                   example: Successfully deleted comment
 *                 data:
 *                   type: null
 *       400:
 *         description: Comment does not exist or user does not have permission to delete it
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
 *                   example: Comment does not exist or user does not have permission to delete it
 *                 data:
 *                   type: null
 *       500:
 *         description: An error occurred while deleting the comment
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
 *                   example: An error occurred while deleting the comment
 *                 data:
 *                   type: null
 */
router.delete("/:commentId", authenticateJWT, async (req, res) => {
  // Params
  const comment = req.params.commentId;

  // Verify comment exists
  const commentExists = await Comment.exists({
    _id: comment,
    user: req.user._id,
  });
  if (!commentExists) {
    return res.json({
      status: "error",
      code: 400,
      message:
        "Comment does not exist or you do not have permission to delete it.",
      data: null,
    });
  }

  // Delete the comment
  try {
    await Comment.deleteOne({ _id: comment });

    // Return the comment
    res.json({
      status: "success",
      code: 200,
      message: "Successfully deleted comment.",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      code: 500,
      message: "An error occurred while deleting the comment.",
      data: null,
    });
  }
});

// Return router
module.exports = router;
